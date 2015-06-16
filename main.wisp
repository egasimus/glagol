use postmelodic
use jack
use web

samplers
  []

fn add-sampler
  ([filename port-number]
    (swap! samplers conj (postmelodic filename port-number))
    (jack/connect
      (jack/port filename "output") -> [ (jack/hw "playback_1")
                                         (jack/hw "playback_2") ]))

fn remove-sampler
  ([index])

fn send-osc
  ([index address & args])

the-answer-to-life-the-universe-and-everything
  42

server
  (web/server { :port (+ 2055 (the-answer-to-life-the-universe-and-everything.get)) 
                :name "postmelodic-gui" }
    (web/page   "/" "gui.wisp"))
    ;(web/socket "/"
      ;"/list"   samplers
      ;"/add"    (apply add-sampler    args)
      ;"/remove" (apply remove-sampler args)
      ;"/osc"    (apply send-osc       args)))
