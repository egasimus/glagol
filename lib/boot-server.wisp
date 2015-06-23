(ns boot (:require [wisp.runtime :refer [= and or str]]))

;; bootstrapper.
;; enables live reloading of server-side process.

(set! exports (fn [session-module]
  (if (= session-module require.main)
    (let
      [ filename
          session-module.filename

        session
          nil
        start
          (fn []
            (log "Loading session" filename)
            (delete (aget require.cache filename))
            (set! session (require filename))
            (log "Starting session" filename "\n")
            (session.start))
        restart
          (fn []
            (session.stop)
            (start))

        dedupe
          nil
        on-change 
          (fn [fname stat]
            (let [duplicate false]
              (if stat (do
                (if (= dedupe stat.mtime) (set! duplicate true))
                (set! dedupe stat.mtime)))
              (if (not duplicate) (do
                (log "\n")
                (if fname (log "File changed:" fname))
                (restart)))))

        chok-opts
          { :persistent true
            :alwaysStat true }
        watcher
          (.watch (require "chokidar") filename chok-opts)

      ] ; (.install            (require "source-map-support")) 
        ; (.register-handler   (require "segfault-handler"))
        ;(process.on "SIGINT" exit)
        (watcher.on "change" on-change)
        (start)))))
