(fn serve [req res]
  (let [send   (require "send-data")
        url    (require "url")
        embed? (.-query.embed (url.parse req.url true))
        ctype  (str "text/" (if embed? "javascript" "html") "; charset=utf-8")
        just   (fn [x] x)]
    (send req res
      { :body    ((if embed? just ./document) ./body/content)
        :headers { "Content-Type" ctype } })))

;(defn- page2 [path]
  ;(let [notion
          ;(engine.tree.get-notion-by-path state.options.notion client-path)


        ;compile
          ;(fn []
            ;; reload harness, start cooking up code bundle, serve when ready
            ;(set! harness (fs.readFileSync harness-path "utf-8"))
            ;(-> (make-bundle notion)
              ;(.then (fn [bundled]
                ;(log "compiled client from notion" (colors.green notion.name))
                ;(set! body bundled)))
              ;(.done)))

        ;watcher
          ;(.watch (require "chokidar") harness-path { :persistent true })
        ;]
