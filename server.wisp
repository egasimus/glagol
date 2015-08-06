(def ^:private colors (require "colors"))
(def ^:private errors (require "./errors.wisp"))
(def ^:private http   (require "http"))
(def ^:private Q      (require "q"))

;;
;; basic web server
;;

(set! exports server)

(defn- server
  [options & endpoints]
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
                  (catch error (errors.handler-error error req res)))
                (errors.handler-404 req res))
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
