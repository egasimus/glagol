(.map ["endpoint" "page" "page2" "server" "socket"]
  (fn [x] (set! (aget exports x) (require (str "./" x ".wisp")))))
