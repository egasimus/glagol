(def create     (require "virtual-dom/create-element"))
(def diff       (require "virtual-dom/diff"))
(def h          (require "virtual-dom/h"))
(def insert-css (require "insert-css"))
(def patch      (require "virtual-dom/patch"))

(defn init [context template]
  (let [tree (template)
        node (create tree)]
    (context.replace-child node context.first-child)
    { :context  context
      :template template
      :tree     template
      :node     node     }))

(defn update [view state]
  (let [new-tree (view.template)
        patches  (diff view.node new-tree)
        focused  false]
    (set! view.node (patch view.node patches))
    (set! view.tree new-tree)
    (Array.prototype.map.call
      (view.context.get-elements-by-class-name "focus-me")
      (fn [el]
        (if (not focused) (do (el.focus) (set! focused true)))
        (el.class-list.remove "focus-me")))
    view))
