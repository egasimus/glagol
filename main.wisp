use postmelodic
use jack
use web

samplers
  []

fn add-sampler
  ([index client-name port-number] (add-sampler samplers.length client-name port-number))

fn remove-sampler
  ([index])

fn send-osc
  ([index address & args])

server
  (web.server { :port 2097 }
    (page   "/" "gui.wisp")
    (socket "/"
      "/list"   samplers
      "/add"    (apply add-sampler    args)
      "/remove" (apply remove-sampler args)
      "/osc"    (apply send-osc       args)))
