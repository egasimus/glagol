(ns boot (:require [wisp.runtime :refer [= and or str]]))

(def ^:private colors (require "colors/safe"))
(def ^:private path   (require "path"))

(set! log.from "boot")

;; bootstrapper.
;; enables live reloading of server-side process.

(set! exports (fn [session-module]
  (if (= session-module require.main)
    (let
      [ filename
          session-module.filename
        shortname
          (path.relative (process.cwd) filename)

        session
          nil
        start
          (fn []
            (log "loading" (colors.green shortname))
            (delete (aget require.cache filename))
            (set! session (require filename))
            (log "starting" (colors.green shortname))
            (.then (session.start) (fn []
              (log "started" (colors.green shortname)))))
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
                (if fname (log "\nchanged"
                  (colors.blue (path.relative (process.cwd) fname))))
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
