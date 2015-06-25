(def ^:private colors     (require "colors/safe"))
(def ^:private browserify (require "browserify"))
(def ^:private path       (require "path"))
(def ^:private Q          (require "q"))
(def ^:private runtime    (require "./runtime.js"))
(def ^:private send-html  (require "send-data/html"))
(def ^:private send-json  (require "send-data/json"))
(def ^:private through    (require "through"))
(def ^:private url        (require "url"))
(def ^:private watchify   (require "watchify"))

(defn server [options & args]
  (let [http      (require "http")
        name      (if options.name (str (colors.green options.name) " ") "")
        handler   (get-handler args)
        srv       (http.create-server handler)
        started   (Q.defer)
        destroy   (fn [] (let [deferred (Q.defer)]
                    (srv.close (fn [err]
                      (if err (deferred.reject err)
                          (do (log (str "closed server " name
                                        "on " (colors.green options.port)))
                              (deferred.resolve)))))
                    deferred.promise))
        descript  { :destroy destroy
                    :started started.promise }]
    (log (str "server " name "listening on " (colors.green options.port)))
    (srv.listen options.port (fn [] (started.resolve descript)))
    descript))

(defn- get-handler [args]
  (fn [req res]
    (let [matcher (fn [endpoint] (if (endpoint.route req) endpoint.handler))
          match   (first (filter matcher args))]
      (if match
        (try
          (match.handler req res)
          (catch error (route-error error req res)))
        (route-404 req res)))))

(deftype HTTPEndpoint [route handler destroy])

(defn endpoint
  ([route handler]
    (endpoint route handler (fn [])))
  ([route handler destroy]
    (HTTPEndpoint. (fn [req] (= route (aget (req.url.split "?") 0))) handler destroy)))

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

(defn page [route script]
  (let [bundle  "document.write('loading...!')"
        options (assoc watchify.args
                  :debug      false
                  :extensions [".wisp"]
                  :basedir    __dirname)
        bundler (browserify options)
        watcher (watchify   bundler)
        handler (fn [req res]
                  (let [parsed (url.parse req.url true)]
                    (send-html req res { :body
                      ((if parsed.query.embed embed-template document-template)
                        bundle) })))
        bundled (fn [err out]
                  (if err
                    (log (colors.red "error") err)
                    (set! bundle out)))]
    (bundler.require "./runtime.js" { :expose "runtime" })
    (bundler.transform "./node_modules/stylify")
    (bundler.transform wispify)
    ;(bundler.transform "brfs")
    (bundler.add script)
    (log "bundling" (colors.green script))
    (bundler.bundle bundled)
    (watcher.on "update" (fn [ids]
      (let [relative-ids (ids.map (fn [id] (path.relative process.cwd id)))]
        (log "rebuilding" (colors.green script)
             "bundle because of" (colors.blue relative-ids))
        (bundler.bundle bundled))))
    (endpoint route handler (fn [] (watcher.close)))))

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

(defn route-404 [req res]
  (send-html req res { :body "404" }))

(defn route-error [error req res]
  (send-json req res error))

(defn socket [])
