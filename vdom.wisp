(def create     (require "virtual-dom/create-element"))
(def diff       (require "virtual-dom/diff"))
(def h          (require "virtual-dom/h"))
(def insert-css (require "insert-css"))
(def patch      (require "virtual-dom/patch"))
(def main-loop  (require "main-loop"))

(defn focus-me []
  (require "virtual-dom/virtual-hyperscript/hooks/focus-hook.js"))

(defn init [context template data]
  (let [tree (template data)
        node (create tree)]
    (context.replace-child node context.first-child)
    { :context  context
      :template template
      :tree     template
      :node     node     }))

(defn update [view data]
  (let [new-tree (view.template data)
        patches  (diff view.tree new-tree)
        focused  false]
    (set! view.node (patch view.node patches))
    (set! view.tree new-tree)
    (Array.prototype.map.call
      (view.context.get-elements-by-class-name "focus-me")
      (fn [el]
        (if (not focused) (do (el.focus) (set! focused true)))
        (el.class-list.remove "focus-me")))
    view))

(defn start [container template state]
  (main-loop state template { :target container }))
