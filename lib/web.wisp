(def ^:private browserify (require "browserify"))
(def ^:private colors     (require "colors/safe"))
(def ^:private deumdify   (require "deumdify"))
(def ^:private http       (require "http"))
(def ^:private path       (require "path"))
(def ^:private Primus     (require "primus"))
(def ^:private Q          (require "q"))
(def ^:private runtime    (require "./runtime.js"))
(def ^:private send-html  (require "send-data/html"))
(def ^:private send-json  (require "send-data/json"))
(def ^:private StrStr     (require "string-stream"))
(def ^:private through    (require "through"))
(def ^:private url        (require "url"))
(def ^:private watchify   (require "watchify"))

;;
;; web server instance
;;

(defn server [options & endpoints]
  (let [colored-name
          (if options.name (str (colors.green options.name) " ") "")
        srv
          (http.create-server)
        _
          (set! srv.primuses {})
        endpoints
          (endpoints.map (fn [endpt] (endpt srv)))
        handler
          (fn [req res]
            (let [matcher (fn [endpt] (if (endpt.route req) endpt.handler))
                  match   (first (filter matcher endpoints))]
              (if match
                (try
                  (match.handler req res)
                  (catch error (route-error error req res)))
              (route-404 req res))))
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
            :started started.promise }]
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
    (fn [server]
      (HTTPEndpoint. (endpoint-matcher route) handler destroy))))

;;
;; browserify-based page
;; automatically updated when any of the included files changes
;;

(defn page [route script]
  (fn [server]
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
              (log (Object.keys bundler) bundler._bundled bundler._external (JSON.stringify bundler._expose))
              (if err
                (log (colors.red "error") err)
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
                    bundle) })))
          require-primuses
            (fn []
              (log "reqp")
                (log (Object.keys server.primuses))
                (.map (Object.keys server.primuses) (fn [primus]
                  (bundler.require (StrStr. (aget server.primuses primus))
                    { :expose (str "sockets" primus "/primus.js") })))) ]

      (bundler.plugin deumdify)

      (bundler.transform "./node_modules/stylify")
      (bundler.transform wispify)

      (bundler.require "./runtime.js" { :expose "runtime" })
      (require-primuses)
      ;(server.primuses (fn [] (require-primuses) (rebuild)))
      (bundler.add script)

      (rebuild)
      (watcher.on "update" rebuild)

      (HTTPEndpoint. (endpoint-matcher route) handler (fn [] (watcher.close))))))

(defn- document-template [output]
  (str "<head><meta charset=\"utf-8\"></head><body><script>" output "</script>"))

(defn- embed-template [output]
  (str "(function () { var " output "; return require })()"))

(defn- compiled [data file]
  (str "var use=require('runtime').requireWisp;"
       "var atom=require('runtime').makeAtom;"
       "var deref=function(a) { return a.get() };"
    (.-code (.-output (runtime.compile-source data file)))))

(defn- wispify [file]
  (let [data
          ""
        wispy
          (= (file.index-of ".wisp") (- file.length 5))
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
  { :transformer "websockets"
    :pathname    "/socket" })

(defn socket
  ([]
    (socket {}))
  ([route options]
    (socket (assoc options :pathname route)))
  ([options]
    (fn [server]
      (let [options
              (conj default-socket-opts options)
            socket
              (Primus. server options)
            matcher
              (fn [req] (= 0 (.indexOf (aget (req.url.split "?") 0) options.pathname)))
            destroy
              (fn [] (log "destroying socket" options.pathname))]
        (log "setp")
        (set! (aget server.primuses options.pathname) (socket.library))
        (HTTPEndpoint. matcher (fn []) destroy)))))

  ;((endpoint (str options.pathname "/primus.js") (fn []) destroy) server)))))

;;
;; error routes
;;

(defn route-404 [req res]
  (send-html req res { :body "404" }))

(defn route-error [error req res]
  (send-json req res error))
