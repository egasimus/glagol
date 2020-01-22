(def create    (require "virtual-dom/create-element"))

(def el        (require "virtual-dom/h"))

(def add-style (require "insert-css"))

(defn tree [root]
  (console.log "DOM tree" root)
  (el "div"))
