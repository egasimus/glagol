(let [fs    (require :fs)
      state { :content (fs.read-file-sync "./server/web/loading.js" :utf8) }
      built (fn [bundled] (set! state.content bundled))
      build (fn [] (./bundle "./client/web" built))]
  (build)
  state)
