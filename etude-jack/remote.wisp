(set! exports (fn jack-remote [socket-server]
  (log "opening jack remote")
  (.Promise (require "q") (fn [resolve]
    (socket-server.on "connection" (fn connected [socket]
      (log "jack remote connected")
      (resolve ((require "q-connection") socket
        (.require-wisp (require "etude-engine/runtime.js") "./index.wisp")))))))))
