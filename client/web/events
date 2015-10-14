(let [emitter
        (new (.-EventEmitter2 (require "eventemitter2"))
          { :maxListeners 64 :wildcard true } )]

  (emitter.on :search (fn []
    (./search (.-value (document.get-element-by-id "searcher")))))

  (emitter.on :search-results (fn []
    (log "search results" arguments)))

  emitter)

