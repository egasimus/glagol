(set! exports (fn jack-remote [socket]
  ((require "q-connection") socket
    (.require-wisp (require "etude-engine/runtime.js") "./index.wisp"))))
