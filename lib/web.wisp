(def ^:private colors     (require "colors/safe"))
(def ^:private browserify (require "browserify"))
(def ^:private send-html  (require "send-data/html"))
(def ^:private send-json  (require "send-data/json"))
(def ^:private watchify   (require "watchify"))

(defn server [options & args]
  (let [http    (require "http")
        handler (get-handler args)
        srv     (http.create-server handler)]
    (log (str
      "server " (if options.name (str (colors.green options.name) " ") "")
      "listening on " (colors.green options.port)))
    (srv.listen options.port)
    { :destroy (fn [cb] (srv.close cb)) }))

(defn- get-handler [args]
  (fn [req res]
    (let [matcher (fn [endpoint] (if (endpoint.route req) endpoint.handler))
          match   (first (filter matcher args))]
      (if match
        (match.handler req res)
        (route-404 req res)))))

(deftype HTTPEndpoint [route handler])

(defn endpoint [route handler]
  (HTTPEndpoint. (fn [req] (= req.url route)) handler))

(defn template [output]
  (str "<head><meta charset=\"utf-8\"></head><body><script>" output "</script>"))

(defn page [route script]
  (let [bundle  "<body>loading...!"
        options (assoc watchify.args :debug false :extensions [".wisp"])
        bundler (browserify options)
        watcher (watchify bundler)
        route   (fn [req] (= req.url route))
        handler (fn [req res] (send-html req res { :body bundle }))
        bundled (fn [err out] (if err (throw err)) (log "bundled" script) (set! bundle (template out)))]
    (bundler.transform "stylify")
    (bundler.transform "wispify")
    (bundler.add script)
    (bundler.bundle bundled)
    (watcher.on "update" (fn [ids]
      (log "updated" ids)
      (bundler.bundle bundled)))
    (HTTPEndpoint. route handler)))

(def route-404 (fn [req res]
  (send-html req res { :body "404" })))

(defn socket [])
