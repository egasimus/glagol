(fn [port]
  (let [server (new (.-Server (require :http)))]
    (server.on :request #(./handler %1 %2))
    (server.listen port)
    server))
