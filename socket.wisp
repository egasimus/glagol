(def ^:private endpoint (require "./endpoint.wisp"))
(def ^:private ws       (require "ws"))

;;
;; real-time web socket
;;

(def ^:private default-socket-opts { :path "/socket" })

(set! exports socket)

(defn- socket
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
                (endpoint.matcher options.path)
              destroy
                (fn [] (log "destroying socket" options.path) (socket.close))]
          (assoc ((endpoint options.path (fn []) (fn [] (socket.close))) state)
            :sockets
              (assoc state.sockets options.path socket)))))))
