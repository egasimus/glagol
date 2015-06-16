(def ^:private colors     (require "colors/safe"))
(def ^:private browserify (require "browserify"))
(def ^:private preprocess (require "./preprocess.js"))
(def ^:private runtime    (require "./runtime.js"))
(def ^:private send-html  (require "send-data/html"))
(def ^:private send-json  (require "send-data/json"))
(def ^:private through    (require "through"))
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

(deftype HTTPEndpoint [route handler destroy])

(defn endpoint
  ([route handler] (endpoint route handler (fn [])))
  ([route handler destroy]
    (HTTPEndpoint. (fn [req] (= req.url route)) handler destroy)))

(defn template [output]
  (str "<head><meta charset=\"utf-8\"></head><body><script>" output "</script>"))

(defn page [route script]
  (let [bundle  "<body>loading...!"
        options (assoc watchify.args :debug false :extensions [".wisp"])
        bundler (browserify options)
        watcher (watchify bundler)
        handler (fn [req res] (send-html req res { :body bundle }))
        bundled (fn [err out] (if err (throw err)) (set! bundle (template out)))]
    (bundler.transform "stylify")
    (bundler.transform (fn [file]
      (let [data
              ""
            wispy
              (= (file.index-of ".wisp") (- file.length 5))
            write 
              (fn [buf] (set! data (+ data buf)))
            end
              (fn []
                (this.queue
                  (if wispy (.-code (.-output (runtime.compile-source data file))) data))
                (this.queue null))]
        (through write end))))
    (bundler.add script)
    (bundler.bundle bundled)
    (watcher.on "update" (fn [ids]
      (log "rebuilding" (colors.green script) "bundle because of" (colors.blue ids))
      (bundler.bundle bundled)))
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

(def route-404 (fn [req res]
  (send-html req res { :body "404" })))

(defn socket [])
