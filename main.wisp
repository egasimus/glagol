sampler
  (use "postmelodic")

jack
  (use "jack")

web
  (use "web")

samplers
  []

add-sampler
  (fn [after client-name port-number])

remove-sampler
  (fn [index])

send-osc
  (fn [index address & args])

server
  (web.server { :port 2097 }
    (page   "/" "gui.wisp")
    (socket "/"
      "/list"   samplers
      "/add"    (apply add-sampler    args)
      "/remove" (apply remove-sampler args)
      "/osc"    (apply send-osc       args)))
