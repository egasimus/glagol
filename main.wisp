use sampler
use jack
use web

samplers
  []

fn add-sampler
  ; creates a new instance of postmelodic and adds it to the gui
  ([client-name port-number] (add-sampler samplers.length client-name port-number))
  ;([after client-name port-number])

fn remove-sampler
  ; kills the specified instance of postmelodic and removes it from the gui
  ([index])

fn send-osc
  ; relays an osc message to the specified instance of postmelodic
  ([index address & args])

server
  (web.server { :port 2097 }
    (page   "/" "gui.wisp")
    (socket "/"
      "/list"   samplers
      "/add"    (apply add-sampler    args)
      "/remove" (apply remove-sampler args)
      "/osc"    (apply send-osc       args)))
