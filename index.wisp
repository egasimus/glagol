(def ^:private runtime (require "etude-engine/runtime.js"))

(.map ["endpoint" "page" "page2" "server" "socket"]
  (fn [x] (set! (aget exports x) (runtime.require-wisp (str "./" x ".wisp")))))
