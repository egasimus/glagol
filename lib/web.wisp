(def ^:private browserify (require "browserify"))
(def ^:private send-html  (require "send-data/html"))
(def ^:private send-json  (require "send-data/json"))

(defn server [options & args]
  (let [http    (require "http")
        handler (get-handler args)
        srv     (http.create-server handler)]
    (log "Listening on" options.port)
    (srv.listen options.port)
    { :destroy (fn [cb] (srv.close cb)) }))

(defn- get-handler [args]
  (fn [req res]
    (let [matcher (fn [endpoint] (if (endpoint.route req) endpoint.handler))
          handler (first (map matcher args))]
      (if handler (handler req res)
        (route-404 req res)))))

(def route-404 (fn [req res]
  (send-html req res { :body "404" })))

(deftype HTTPEndpoint [route handler])

(defn page [route script]
  (let [bundle  "<body>loading..."
        options { :debug false :extensions [".wisp"] }
        bundler (browserify options)
        route   (fn [req] (= req.url route))
        handler (fn [req res] (send-html req res { :body bundle }))]
    (bundler.transform "stylify")
    (bundler.add script)
    (bundler.bundle (fn [err output]
      (if err (throw err))
      (set! bundle (str "<body><script>" output "</script>"))))
    (HTTPEndpoint. route handler)))

(defn socket [])
