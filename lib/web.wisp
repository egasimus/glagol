(def ^:private browserify (require "browserify"))
(def ^:private colors     (require "colors/safe"))
(def ^:private http       (require "http"))
(def ^:private path       (require "path"))
(def ^:private Q          (require "q"))
(def ^:private runtime    (require "./runtime.js"))
(def ^:private send       (require "send-data"))
(def ^:private send-html  (require "send-data/html"))
(def ^:private send-json  (require "send-data/json"))
(def ^:private through    (require "through"))
(def ^:private url        (require "url"))
(def ^:private watchify   (require "watchify"))
(def ^:private ws         (require "ws"))

(def ^:private engine     (runtime.require-wisp "./engine.wisp"))

;;
;; web server instance
;;

(defn server [options & endpoints]
  (let [colored-name
          (if options.name (str (colors.green options.name) " ") "")
        srv
          (http.create-server)
        state
          (endpoints.reduce (fn [state endpt] (endpt state))
            { :server srv :endpoints [] :sockets {} })
        handler
          (fn [req res]
            (let [matcher (fn [endpt] (if (endpt.route req) endpt.handler))
                  match   (first (filter matcher state.endpoints))]
              (if match
                (try
                  (match.handler req res)
                  (catch error (handler-error error req res)))
                (handler-404 req res))
              (log res.status-code req.method req.url)))
        started
          (Q.defer)
        destroy
          (fn [] (let [deferred (Q.defer)]
            (srv.close (fn [err]
              (if err (deferred.reject err)
                  (do (log (str "closed server " colored-name
                                "on " (colors.green options.port)))
                      (deferred.resolve)))))
            deferred.promise))
        descriptor
          { :destroy destroy
            :started started.promise 
            :state   state }]
    (srv.on "request" handler)
    (srv.listen options.port (fn []
      (log (str "server "       colored-name
                "listening on " (colors.green options.port)))
      (started.resolve descriptor)))
    descriptor))

;;
;; generic http endpoint
;; calls arbitrary function in response to http request
;;

(deftype HTTPEndpoint [route handler destroy])

(defn- endpoint-matcher [route]
  (fn [req]
    (= route (.-pathname (url.parse req.url)))))

(defn endpoint
  ([route handler]
    (endpoint route handler (fn [])))
  ([route handler destroy]
    (fn [state]
      (assoc state :endpoints (conj state.endpoints
        (HTTPEndpoint. (endpoint-matcher route) handler destroy))))))

;;
;; browserify-based page
;; automatically updated when any of the included files changes
;;

(defn page [route script]
  (fn [state]
    (let [bundle
            "document.write('loading...!')"
          options
            (assoc watchify.args
              :debug      false
              :extensions [".wisp"]
              :basedir    __dirname)
          bundler
            (browserify options)
          watcher
            (watchify bundler)
          bundled
            (fn [err out]
              (if err
                (log (colors.red "error") (str err))
                (set! bundle out)))
          rebuild
            (fn [ids]
              (if ids
                (let [relative-ids (ids.map (fn [id] (path.relative process.cwd id)))]
                  (log "rebuilding" (colors.green script)
                     "bundle because of" (colors.blue relative-ids)))
                (log "building" (colors.green script) "bundle"))
              (watcher.bundle bundled))
          handler
            (fn [req res]
              (let [parsed (url.parse req.url true)]
                (send-html req res { :body
                  ((if parsed.query.embed embed-template document-template)
                    bundle) })))]

      (bundler.transform "./node_modules/stylify")
      (bundler.transform wispify)
      ;(bundler.transform "./node_modules/uglifyify")

      (bundler.add script)

      (rebuild)
      (watcher.on "update" rebuild)

      (assoc state :endpoints (conj state.endpoints
        (HTTPEndpoint. (endpoint-matcher route) handler (fn [] (watcher.close))))))))

(defn- document-template [output]
  (str "<head><meta charset=\"utf-8\"></head><body><script>" output "</script>"))

(defn- embed-template [output]
  (str "(function () { var require = " output "; return require })()"))

(defn- compiled [data file]
  (.-code (.-output (runtime.compile-source data file))))

(defn- wispify [file]
  (let [data
          ""
        wispy
          (or (= (file.index-of ".wisp") (- file.length 5))
              (= -1 (file.index-of ".")))
        write
          (fn [buf] (set! data (+ data buf)))
        end
          (fn []
            (this.queue
              (if wispy
                (compiled data file)
                data))
            (this.queue null))]
    (through write end)))

;;
;; exposes an atom over rest
;;

(defn variable [route atom-instance]
  (endpoint route (fn [req res]
    (cond
      (= req.method "GET")
        (send-json req res @atom-instance)
      (= req.method "POST")
        (let [data ""]
          (req.on "data" (fn [buf] (set! data (+ data buf))))
          (req.on "end"  (fn []
            (log "posted to" (colors.green route) "value" (colors.blue data))
            (send-json req res "OK"))))))))

;;
;; real-time web socket
;;

(def default-socket-opts
  { :path "/socket" })

(defn socket
  ([]
    (socket {}))
  ([route options]
    (socket (assoc options :path route)))
  ([options]
    (fn [state]
      (let [options
              (assoc (conj default-socket-opts options) :server state.server)
            socket
              (ws.Server. options)
            matcher
              (endpoint-matcher options.path)
            destroy
              (fn [] (log "destroying socket" options.path) (socket.close))]
        (assoc state
          :sockets   (assoc state.sockets options.path socket)
          :endpoints (conj state.endpoints (HTTPEndpoint.
            (endpoint-matcher route) (fn []) (fn [] (watcher.close)))))))))

;;
;; error routes
;;

(defn handler-404 [req res]
  (send-html req res { :body "404" }))

(defn handler-error [error req res]
  (send-json req res error))

;;
;; atom page
;;

(defn page2 [route atom]
  (fn [state]
    (let [derefs
            (engine.get-derefs atom)
          handler
            (fn [req res] (send req res {
              :body    "foo" ;atom.compiled.output.code
              :headers { "Content-Type" "text/javascript; charset=utf-8" } })) ]
      (log "dependency tree" derefs)
      (assoc state :endpoints (conj state.endpoints
        (HTTPEndpoint. (endpoint-matcher route) handler (fn [])))))))
