#!/usr/bin/env glagol
(let [port 1620
      server-http (./web/server port)
      server-ws (new (.-Server (require :ws)) { :server server-http })
      on-ws (fn [socket]
        (console.log "ws connection")
        ((require :q-connection) socket ./api))]

  (console.log :hello "starting with modules:" (.join (keys ./api) " "))
  (server-ws.on :connection on-ws)
  
  {})
