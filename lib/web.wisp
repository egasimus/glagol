(def ^:private browserify (require "browserify"))
(def ^:private send-html  (require "send-data/html"))
(def ^:private send-json  (require "send-data/json"))

(defn server [options & args]
  (let [http
          (require "http")
        handler
          (fn [req res]
            (let [matcher (get-route-matcher req res)
                  handler (first (map matcher args))]
              (if handler (handler req res)
                (route-404 req res))))
        server
          (http.create-server handler)]
    (log "Listening on" options.port)
    (server.listen options.port)))
    ;(http.create-server (fn [req res]
      ;(log "EDITOR REQUEST" req res))))
  ;(log "Hi, I'm a server!" (JSON.stringify options))
  ;(log args))

(defn- get-route-matcher [req res]
  (fn [endpoint]
    (if (endpoint.route req)
      endpoint.handler)))

(def route-404 (fn [req res]
  (send-html req res { :body "404" })))

(defn page [route script]
  (let [bundle  "<body>loading..."
        options { :debug false :extensions [".wisp"] }
        bundler (browserify options)]
    (bundler.transform "stylify")
    (bundler.add script)
    (bundler.bundle (fn [err output]
      (if err (throw err))
      (set! bundle (str "<body><script>" output "</script>"))))
    (HTTPEndpoint.
      (fn [req]     (= req.url route))
      (fn [req res] (send-html req res { :body bundle })))))

(deftype HTTPEndpoint [route handler])

;(defn page [route script]
  ;(HTTPEndpoint
    ;(fn [req])
    ;(fn [req res])))

  ;(fn [context]

    ;(let [br (browserify { :debug      false
                           ;:extensions [ ".wisp" ]})]

      ;(br.add (path.resolve (path.join
        ;(path.dirname (require.resolve "wisp/runtime")) "engine" "browser.js")))
      ;(br.require (path.join __dirname "client.wisp") { :expose "client" })
      ;(br.transform (require "wispify") { :global true })
      ;(br.transform (require "stylify") { :global true })

      ;(add-routes context

        ;(route pattern
          ;(fn [request response]
            ;(send-html request response (str
              ;"<!doctype html>"
              ;(.-outerHTML (page-template context))))))

        ;(route (str pattern "script")
          ;(fn [request response]
            ;(br.bundle (fn [error bundled]
              ;(if error (throw error))
              ;(send-data request response (bundled.toString "utf8"))))))))))

(defn socket [])
