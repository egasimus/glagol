(def ^:private browserify (require "browserify"))
(def ^:private colors     (require "colors"))
(def ^:private endpoint   (require "./endpoint.wisp"))
(def ^:private engine     (require "etude-engine"))
(def ^:private fs         (require "fs"))
(def ^:private path       (require "path"))
(def ^:private Q          (require "q"))
(def ^:private send       (require "send-data"))
(def ^:private shortid    (require "shortid"))
(def ^:private socket     (require "./socket.wisp"))
(def ^:private url        (require "url"))
(def ^:private util       (require "./util.wisp"))

(set! exports page2)

;;
;; notion page
;;

(def ^:private harness-path (path.join __dirname "harness.js"))
(def ^:private harness (fs.readFileSync harness-path "utf-8"))

(defn- page2
  [route client-path]
  (log.as :page2 route client-path)
  (fn [state]
    (let [notion
            (engine.tree.get-notion-by-path state.options.notion client-path)

          body (str   ; updated asap to contain actual body
            "document.write('loading...!');"
            "setTimeout(function(){window.location.reload()}, 2000)")

          handler     ; response handler that serves the body contents
            (fn [req res]
              (let [embed? (.-query.embed (url.parse req.url true))
                    body   (if embed? body (util.document-template body))]
                (send req res
                  { :body    body
                    :headers { "Content-Type"
                                 (str "text/" (if embed? "javascript" "html")
                                   "; charset=utf-8")} })))
          compile
            (fn []
              ; reload harness, start cooking up code bundle, serve when ready
              (set! harness (fs.readFileSync harness-path "utf-8"))
              (-> (make-bundle notion)
                (.then (fn [bundled]
                  (log "compiled client from notion" (colors.green notion.name))
                  (set! body bundled)))
                (.done)))

          watcher
            (.watch (require "chokidar") harness-path { :persistent true })
          ]

      ; set em balls rollin
      (compile)
      (watcher.on "change" compile)

      ; attach socket and http endpoint to server
      (let [socket-path
              (str route "socket") ; TODO
            state
              ((socket { :path socket-path }) state)
            socket-server
              (aget state.sockets socket-path)
            connect
              (fn [connect]
                (socket-server.once "connection" (fn [socket]
                  (let [updated
                          (fn [arg]
                            (socket.send (JSON.stringify
                              { :event this.event :arg arg }))) ]
                    (engine.events.on "notion.updated.*" updated)
                    (socket.on "close" (fn [code msg]
                      (engine.events.off "notion.updated.*" updated)
                      (connect connect)))
                    (log "connected socket" socket-path)))))]
        (connect connect)
        ((endpoint route handler (fn [])) state)))))

(defn- template
  " Populates a template for a JS bundle containing all notions and
    browserified libraries. "
  [bundle mapped notion]
  (str "var " bundle ";var deps=" (JSON.stringify mapped)
    (-> harness
      (.replace "%ENTRY%"   (path.basename notion.name))
      (.replace "%NOTIONS%" (JSON.stringify (get-snapshot notion))))))

(defn- get-notion-by-name
  " A lil bit of convenience. "
  [name]
  (aget engine.NOTIONS name))

(defn- get-snapshot
  " Collects notion dependencies, starting from the root notion. "
  [root]
  (let [dependencies
          (.-derefs (engine.compile.get-deps root))
        snapshot
          {}
        rel
          (fn [a] (path.relative (path.dirname root.path) a.path))
        add
          (fn [a] (aset snapshot (rel a) (engine.notion.freeze-notion a)))]
    (add root)
    (dependencies.map (fn [dep] (add (get-notion-by-name dep))))
    snapshot))

(defn- make-bundle
  " Promises a browserified bundle containing any Node.js libs required
    by the root notion (passed as single argument) and its dependencies. "
  [notion]
  (Q.Promise (fn [resolve reject notify]
    (let [deps      (engine.compile.get-deps notion)
          notions   (.concat [notion] (deps.derefs.map
                      (engine.tree.get-notion-by-path.bind nil notion)))
          requires  {}
          resolved  {}
          mapped    {}
          br-paths  [ "./node_modules/etude-engine/node_modules" ]
          br        (browserify { :paths br-paths })]

      (br.transform util.wispify)
      (br.transform (require "stylify"))

      (br.require "vm" { :expose "vm" })
      (br.require "observ" { :expose "observ" })
      (br.require "wisp/sequence.js" { :expose "wisp/sequence.js" })
      (br.require "wisp/runtime.js" { :expose "wisp/runtime.js" })
      (br.require "etude-engine/tree.wisp" { :expose "tree" })
      ;(br.require "etude-engine/engine.wisp" { :expose "etude-engine" })
      ;(br.exclude "chokidar")

      (.map notions (fn [notion]
        (log.as :p2-notion notion)
        (aset requires notion.name {})
        (.map (or notion.requires []) (fn [req]
          (let [res
                  (.sync (require "resolve") req
                    { :basedir    (path.dirname notion.path)
                      :extensions [".js" ".wisp"]}) ]
            (set! (aget (aget requires notion.name) req) res)
            (if (= -1 (.index-of (keys resolved) res))
              (set! (aget resolved res) (shortid.generate))))))))

      (.map (keys requires) (fn [i]
        (aset mapped i {})
        (.map (keys (aget requires i)) (fn [j]
          (aset (aget mapped i) j (aget resolved (aget (aget requires i) j)))))))

      (.map (keys resolved) (fn [module]
        (br.require module { :expose (aget resolved module) })))

      (br.bundle (fn [err buf]
        (if err (reject err))
        (resolve (template (String buf) mapped notion))))))))
