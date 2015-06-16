(let [create     (require "virtual-dom/create-element")
      h          (require "virtual-dom/h")
      insert-css (require "insert-css")
      new-body (create
        (h "html" [(h "head") (h "body" (h "h1" "Foo"))]))]
  (document.replaceChild new-body document.firstChild)
  (insert-css "body { background: #333; color: #ccc }"))
