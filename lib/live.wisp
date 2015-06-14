(defprotocol Updatable
  (update [self]))

(defprotocol Destructible
  (destroy [self]))
