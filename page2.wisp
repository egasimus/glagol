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
;; atom page
;;

(def ^:private harness-path (path.join __dirname "harness.js"))
(def ^:private harness (fs.readFileSync harness-path "utf-8"))

(defn- page2
  [route atom]
  (fn [state]
    (let [atom-name
            (.replace
              (engine.translate (.join (.slice (atom.split "/") 1) "/"))
              "." "/")

          atom
            (get-atom-by-name atom-name)

          socket-path
            (str route "socket") ; TODO

          add-socket  ; web socket for realtime updates
            (socket { :path socket-path })

          body (str   ; updated to contain actual body
            "document.write('loading...!');"
            "setTimeout(function(){window.location.reload()}, 2000)")

          handler     ; response handler that serves the body contents
            (fn [req res]
              (let [embed?
                      (.-query.embed (url.parse req.url true))
                    body
                      (if embed? body (util.document-template body))
                    ctype
                      (str "text/" (if embed? "javascript" "html")
                           "; charset=utf-8")]
                (send req res
                  { :body    body
                    :headers { "Content-Type" ctype } })))

          compile
            (fn []
              ; reload harness
              (set! harness (fs.readFileSync harness-path "utf-8"))
              ; start cooking up code bundle --
              ; serve when ready
              (-> (make-bundle atom)
                (.then (fn [bundled]
                  (log "compiled client from atom" (colors.green atom.name))
                  (set! body bundled)))
                (.done)))

          watcher
            (.watch (require "chokidar") harness-path { :persistent true })
          ]

      ; set em balls rollin
      (compile)
      (watcher.on "change" compile)

      ; attach socket and http endpoint to server
      (let [state
              (add-socket state)
            socket-server
              (aget state.sockets socket-path)
            connect
              (fn [connect]
                (socket-server.once "connection" (fn [socket]
                  (let [updated
                          (fn [arg]
                            (socket.send (JSON.stringify
                              { :event this.event :arg arg }))) ]
                    (engine.events.on "atom.updated.*" updated)
                    (socket.on "close" (fn [code msg]
                      (engine.events.off "atom.updated.*" updated)
                      (connect connect)))
                    (log "connected socket" socket-path)))))]
        (connect connect)
        ((endpoint route handler (fn [])) state)))))

(defn- template
  " Populates a template for a JS bundle containing all atoms and
    browserified libraries. "
  [bundle mapped atom]
  (str "var " bundle ";var deps=" (JSON.stringify mapped)
    (-> harness
      (.replace "%ENTRY%" (path.basename atom.name))
      (.replace "%ATOMS%" (JSON.stringify (get-snapshot atom))))))

(defn- get-atom-by-name
  " A lil bit of convenience. "
  [name]
  (aget engine.ATOMS name))

(defn- get-snapshot
  " Collects atom dependencies, starting from the root atom. "
  [root]
  (let [dependencies
          (.-derefs (engine.get-deps root))
        snapshot
          {}
        rel
          (fn [a] (path.relative (path.dirname root.path) a.path))
        add
          (fn [a] (aset snapshot (rel a) (engine.freeze-atom a)))]
    (add root)
    (dependencies.map (fn [dep] (add (get-atom-by-name dep))))
    snapshot))

(defn- make-bundle
  " Promises a browserified bundle containing any Node.js libs required
    by the root atom (passed as single argument) and its dependencies. "
  [atom]
  (Q.Promise (fn [resolve reject notify]
    (let [deps     (engine.get-deps atom)
          atoms    (.concat [atom] (deps.derefs.map get-atom-by-name))
          requires {}
          resolved {}
          mapped   {}
          br-paths [ "./node_modules/etude-engine/node_modules" ]
          br       (browserify { :paths br-paths })]

      (br.transform util.wispify)
      (br.transform (require "stylify"))

      (br.require "vm" { :expose "vm" })
      (br.require "observ" { :expose "observ" })
      (br.require "wisp/sequence.js" { :expose "wisp/sequence.js" })
      (br.require "wisp/runtime.js" { :expose "wisp/runtime.js" })
      ;(br.require "etude-engine/engine.wisp" { :expose "etude-engine" })
      ;(br.exclude "chokidar")

      (.map atoms (fn [atom]
        (aset requires atom.name {})
        (.map (or atom.requires []) (fn [req]
          (let [res
                  (.sync (require "resolve") req
                    { :basedir    (path.dirname atom.path)
                      :extensions [".js" ".wisp"]}) ]
            (set! (aget (aget requires atom.name) req) res)
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
        (resolve (template (String buf) mapped atom))))))))
