(let [glagol (require :glagol)
      path   (require :path)]
  (glagol.Directory (path.resolve "./client/web")))
