(let [glagol (require :glagol)
      path   (require :path)]
  (log.as :client (path.resolve "./client/web"))
  (glagol.Directory (path.resolve "./client/web")))
