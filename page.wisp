(def ^:private watchify (require "watchify"))
(def ^:private util     (require "./util.wisp"))

(set! exports page)

;;
;; browserify-based page
;; automatically updated when any of the included files changes
;;

(defn- page
  [route script]
  (fn [state]
    (let [bundle
            "document.write('loading...!')"
          options
            (assoc watchify.args
              :debug      false
              :extensions [".wisp"]
              :basedir    __dirname)
          bundler
            (browserify options)
          watcher
            (watchify bundler)
          bundled
            (fn [err out]
              (if err
                (log (colors.red "error") (str err))
                (set! bundle out)))
          rebuild
            (fn [ids]
              (if ids
                (let [relative-ids
                        (ids.map (fn [id] (path.relative process.cwd id)))]
                  (log "rebuilding" (colors.green script)
                     "bundle because of" (colors.blue relative-ids)))
                (log "building" (colors.green script) "bundle"))
              (watcher.bundle bundled))
          handler
            (fn [req res]
              (let [parsed (url.parse req.url true)]
                (send-html req res { :body
                  ((if parsed.query.embed embed-template document-template)
                    bundle) })))]

      (bundler.transform "./node_modules/stylify")
      (bundler.transform util.wispify)
      ;(bundler.transform "./node_modules/uglifyify")

      (bundler.add script)

      (rebuild)
      (watcher.on "update" rebuild)

      (assoc state :endpoints (conj state.endpoints
        (endpoint route handler (fn [] (watcher.close))))))))

(defn- document-template [output]
  (str "<head><meta charset=\"utf-8\"></head><body><script>"
    output "</script>"))

(defn- embed-template [output]
  (str "(function () { var require = " output "; return require })()"))
