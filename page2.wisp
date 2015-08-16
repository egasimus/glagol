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
            (engine.translate (.join (.slice (atom.split "/") 1) "/"))

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
              (.done (.then (prepare-getrequire atom)
                (fn [bundled]
                  (log "compiled client from atom" (colors.green atom.name))
                  (set! body bundled)))))

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

(defn- template-getrequire
  " Populates a template for a JS bundle containing all atoms and
    browserified libraries. "
  [bundle mapped atom]
  (str "var " bundle ";var deps=" (JSON.stringify mapped)
    (.replace (harness.replace "%ENTRY%" (engine.translate atom.name))
      "%ATOMS%" (JSON.stringify (get-atom-with-derefs atom)))))

(defn- get-atom-by-name
  " A lil bit of convenience. "
  [name]
  (aget engine.ATOMS name))

(defn- get-atom-with-derefs
  " Collects atom dependencies, starting from the root atom. "
  [atom]
  (let [retval
          {}
        add
          (fn [a] (let [frozen (engine.freeze-atom a)]
            (set! (aget retval (engine.translate a.name)) frozen)))]
    (add atom)
    (.map (.-derefs (get-deps atom)) (fn [atom-name]
      (add (get-atom-by-name atom-name))))
    retval))

(defn- detect-and-parse-deref
  " Hacks detective module to find `_.<atom-name>`
    expressions (as compiled from `./<atom-name>` in wisp). "
  [node]
  (set! node.arguments (or node.arguments []))
  (if (and (= node.type "MemberExpression")
           (= node.object.type "Identifier")
           (= node.object.name "_"))
    (loop [step  node
           value node.property.name]
      (if (and step.parent
               (= step.parent.type "MemberExpression"))
        (recur step.parent (conj value "." step.parent.property.name))
        (do
          (set! node.arguments
            [ { :type  "Literal"
                :value value } ])
          true)))
    false))

(defn- find-derefs
  " Returns a list of atoms referenced from an atom. "
  [atom]
  (let [detective (require "detective")
        code      atom.compiled.output.code
        results   (detective.find code
                  { :word      ".*"
                    :isRequire detect-and-parse-deref })]
    (log.as :detective results.strings)
    (engine.unique results.strings)))

(defn- get-deps
  " Returns a processed list of the dependencies of an atom. "
  [atom]
  (log :get-deps atom.path)
  (let [;; native library requires
        requires
          []
        find-requires
          (fn [atom]
            (atom.requires.map (fn [req]
              (let [resolved
                      (.sync (require "resolve") req
                        { :basedir    (path.dirname atom.path)
                          :extensions [".js" ".wisp"] })]
                (if (= -1 (requires.index-of resolved))
                  (requires.push resolved))))))

        ;; atom dependencies a.k.a. derefs
        derefs
          []
        add-dep
          nil
        _ (set! add-dep ; no recursion in (let)s as usual :(
          (fn add-dep [atom-name]

            ; TODO support more than 1 level of directories
            (let [rel (path.relative (engine.get-root-dir)
                                     (path.dirname atom.path))]
              (if rel (set! atom-name (conj rel "." atom-name))))

            (if (= -1 (derefs.index-of atom-name))
              (let [dep (aget engine.ATOMS atom-name)]
                (if (not dep) (throw (Error. (str "No atom " atom-name))))
                (derefs.push atom-name)
                (find-requires dep)
                (.map (find-derefs dep) add-dep))))) ]

    (find-requires atom)
    (.map (find-derefs atom) add-dep)
    { :derefs   derefs
      :requires requires }))

(defn- prepare-getrequire
  " Promises a browserified bundle containing any Node.js libs required
    by the root atom (passed as single argument) and its dependencies. "
  [atom]
  (Q.Promise (fn [resolve reject notify]
    (let [deps     (get-deps atom)
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
        (set! (aget requires atom.name) {})
        (atom.requires.map (fn [req]
          (let [res
                  (.sync (require "resolve") req
                    { :basedir    (path.dirname atom.path)
                      :extensions [".js" ".wisp"]}) ]
            (set! (aget (aget requires atom.name) req) res)
            (if (= -1 (.index-of (keys resolved) res))
              (set! (aget resolved res) (shortid.generate))))))))

      (.map (keys requires) (fn [i]
        (set! (aget mapped i) {})
        (.map (keys (aget requires i)) (fn [j]
          (set! (aget (aget mapped i) j) (aget resolved (aget (aget requires i) j)))))))

      (.map (keys resolved) (fn [module]
        (br.require module { :expose (aget resolved module) })))

      (br.bundle (fn [err buf]
        (if err (reject err))
        (resolve (template-getrequire (String buf) mapped atom))))))))
