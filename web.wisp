(def ^:private browserify (require "browserify"))
(def ^:private colors     (require "colors/safe"))
(def ^:private fs         (require "fs"))
(def ^:private http       (require "http"))
(def ^:private path       (require "path"))
(def ^:private Q          (require "q"))
(def ^:private runtime    (require "etude-engine/runtime.js"))
(def ^:private send       (require "send-data"))
(def ^:private send-html  (require "send-data/html"))
(def ^:private send-json  (require "send-data/json"))
(def ^:private shortid    (require "shortid"))
(def ^:private through    (require "through"))
(def ^:private url        (require "url"))
(def ^:private watchify   (require "watchify"))
(def ^:private ws         (require "ws"))

(def ^:private engine     (runtime.require-wisp "etude-engine"))

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

(deftype HTTPEndpoint [name route handler destroy])

(defn- endpoint-matcher [route]
  (fn [req]
    (= route (.-pathname (url.parse req.url)))))

(defn endpoint
  ([route handler]
    (endpoint route handler (fn [])))
  ([route handler destroy]
    (fn [state]
      (assoc state :endpoints (conj state.endpoints
        (HTTPEndpoint. route (endpoint-matcher route) handler destroy))))))

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
                (let [relative-ids
                        (ids.map (fn [id] (path.relative process.cwd id)))]
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
        (endpoint route handler (fn [] (watcher.close))))))))

(defn- document-template [output]
  (str "<head><meta charset=\"utf-8\"></head><body><script>"
    output "</script>"))

(defn- embed-template [output]
  (str "(function () { var require = " output "; return require })()"))

(defn- compiled [data file]
  (.-code (.-output (runtime.compile-source data file))))

(defn wispify [file]
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
    (if (string? options)
      (socket options {})
      (fn [state]
        (let [options
                (assoc (conj default-socket-opts options) :server state.server)
              socket
                (ws.Server. options)
              matcher
                (endpoint-matcher options.path)
              destroy
                (fn [] (log "destroying socket" options.path) (socket.close))]
          (assoc ((endpoint options.path (fn []) (fn [] (socket.close))) state)
            :sockets
              (assoc state.sockets options.path socket)))))))

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

(def ^:private harness-path (path.join __dirname "harness.js"))

(def ^:private harness (fs.readFileSync harness-path "utf-8"))

(defn page2 [route atom]
  (fn [state]
    (let [socket-path
            (str route "socket") ; TODO

          add-socket  ; web socket for realtime updates
            (socket { :path socket-path })

          body (str   ; updated to contain actual body
            "document.write('loading...!');"
            "setTimeout(function(){window.location.reload()}, 2000)")

          handler     ; response handler that serves the body contents
            (fn [req res]
              (let [embed?
                      (.-query.embed (url.parse req.url true))
                    body
                      (if embed? body (document-template body))
                    ctype
                      (str "text/" (if embed? "javascript" "html")
                           "; charset=utf-8")]
                (send req res
                  { :body    body
                    :headers { "Content-Type" ctype } })))

          compile
            (fn []
              ; reload harness
              (set! harness (fs.readFileSync harness-path "utf-8"))
              ; start cooking up code bundle --
              ; serve when ready
              (.done (.then (prepare-getrequire atom)
                (fn [bundled]
                  (log "compiled client from atom" (colors.green atom.name))
                  (set! body bundled)))))

          watcher     ; the inevitable hindu
            (.watch (require "chokidar") harness-path { :persistent true })
          ]

      ; set em balls rollin
      (compile)
      (watcher.on "change" compile)

      ; attach socket and http endpoint to server
      (let [state
              (add-socket state)
            socket-server
              (aget state.sockets socket-path)
            connect
              (fn [connect]
                (socket-server.once "connection" (fn [socket]
                  (let [updated
                          (fn [arg]
                            (socket.send (JSON.stringify
                              { :event this.event :arg arg }))) ]
                    (engine.events.on "atom.updated.*" updated)
                    (socket.on "close" (fn [code msg]
                      (engine.events.off "atom.updated.*" updated)
                      (connect connect)))
                    (log "connected socket" socket-path)))))]
        (connect connect)
        ((endpoint route handler (fn [])) state)))))

(defn- template-getrequire [bundle mapped atom]
  (str "var " bundle ";var deps=" (JSON.stringify mapped)
    (.replace (harness.replace "%ENTRY%" (engine.translate atom.name))
      "%ATOMS%" (JSON.stringify (get-atom-with-derefs atom)))))

(defn- get-atom-by-name [name]
  (aget engine.ATOMS name))

(defn- get-atom-with-derefs [atom]
  (let [retval
          {}
        add
          (fn [a] (set! (aget retval (engine.translate a.name))
            (engine.freeze-atom a)))]
    (add atom)
    (.map (.-derefs (engine.get-deps atom)) (fn [atom-name]
      (add (get-atom-by-name atom-name))))
    retval))

(defn- get-deps
  " Returns a processed list of the dependencies of an atom. "
  [atom]
  (let [;; atom dependencies a.k.a. derefs
        derefs
          []
        find-derefs
          (fn [atom]
            (let [detective (require "detective")
                  code      atom.compiled.output.code]
              (log :in code)
              (log (detective.find code {
                :word ".*"
                :isRequire (fn [node]
                  ; patch node to hide abuse from detective
                  (set! node.arguments [])
                  (if
                    (and (= node.type "MemberExpression")
                         (= node.object.type "Identifier")
                         (= node.object.name "_"))
                    (do
                      (set! node.arguments
                        [ { :type  "Literal"
                            :value node.property.name } ])
                      true)
                    false)) })))
            atom.derefs)
        add-dep
          nil
        _ ; no recursion in (let)s as usual :(
          (set! add-dep (fn add-dep [atom-name]
            (if (= -1 (derefs.index-of atom-name))
              (let [dep (aget ATOMS atom-name)]
                (if (not dep) (throw (Error. (str "No atom " atom-name))))
                (derefs.push atom-name)
                (find-requires dep)
                (.map (find-derefs dep) add-dep)))))

        ;; native library requires
        requires
          []
        find-requires
          (fn [atom]
            (atom.requires.map (fn [req]
              (let [resolved (resolve.sync req { :basedir    root-dir
                                                 :extensions [".js" ".wisp"] })]
                (if (= -1 (requires.index-of resolved))
                  (requires.push resolved)))))) ]
    (find-requires atom)
    (.map (find-derefs atom) add-dep)
    (log atom.name "has derefs" derefs "and requires" requires)
    { :derefs   derefs
      :requires requires }))

(defn- prepare-getrequire [atom]
  (Q.Promise (fn [resolve reject notify]
    (let [deps     (get-deps atom)
          atoms    (.concat [atom] (deps.derefs.map get-atom-by-name))
          requires {}
          resolved {}
          mapped   {}
          modules  "./node_modules/etude-engine/node_modules"
          br       (browserify { :paths [modules] })]

      (br.transform wispify)
      (br.transform (require "stylify"))

      (br.require "vm" { :expose "vm" })
      (br.require "observ" { :expose "observ" })
      (br.require "wisp/sequence.js" { :expose "wisp/sequence.js" })
      (br.require "wisp/runtime.js" { :expose "wisp/runtime.js" })
      ;(br.require "etude-engine/engine.wisp" { :expose "etude-engine" })
      ;(br.exclude "chokidar")

      (.map atoms (fn [atom]
        (set! (aget requires atom.name) {})
        (atom.requires.map (fn [req]
          (let [res
                  (.sync (require "resolve") req
                    { :basedir    (path.dirname atom.path)
                      :extensions [".js" ".wisp"]}) ]
            (set! (aget (aget requires atom.name) req) res)
            (if (= -1 (.index-of (Object.keys resolved) res))
              (set! (aget resolved res) (shortid.generate))))))))

      (.map (Object.keys requires) (fn [i]
        (set! (aget mapped i) {})
        (.map (Object.keys (aget requires i)) (fn [j]
          (set! (aget (aget mapped i) j) (aget resolved (aget (aget requires i) j)))))))

      (.map (Object.keys resolved) (fn [module]
        (br.require module { :expose (aget resolved module) })))

      (br.bundle (fn [err buf]
        (if err (reject err))
        (resolve (template-getrequire (String buf) mapped atom))))))))
