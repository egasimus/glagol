(let [engine (require :glagol)
      path   (require :path)]
  (log.as :client (path.resolve "./client/web"))
  (engine.tree.make-notion-directory (path.resolve "./client/web")))
