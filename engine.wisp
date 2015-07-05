(def ^:private Q (require "q"))
(set! Q.longStackSupport true)

(def ^:private colors    (require "colors/safe"))
;(def ^:private chokidar (require "chokidar"))
(def ^:private detective (require "detective"))
(def ^:private fs        (require "fs"))
(def ^:private glob      (require "glob"))
(def ^:private observ    (require "observ"))
(def ^:private path      (require "path"))
(def ^:private runtime   (require "./runtime.js"))
(def ^:private url       (require "url"))
(def ^:private vm        (require "vm"))

(def ^:private = runtime.wisp.runtime.is-equal)

(def translate
  (.-translate-identifier-word (require "wisp/backend/escodegen/writer.js")))

(def log     (.get-logger (require "./logging.js") "engine"))
(def events  (new (.-EventEmitter2 (require "eventemitter2")) { :maxListeners 32 }))
;(def watcher (chokidar.watch "" { :persistent true :alwaysStat true}))

(def ATOMS {})

(defn make-atom [name source]
  (let [atom
          { :type      "Atom"
            :name      name
            :source    (observ (.trim (or source "")))
            :compiled  nil
            :requires  []
            :derefs    []
            :value     (observ undefined)
            :evaluated false
            :outdated  false } ]

    ; compile source now and on update
    (compile-atom-sync atom)
    (atom.source (fn []
      (compile-atom-sync atom)
      (if atom.evaluated (do
        (set! atom.outdated true)
        (evaluate-atom-sync atom)))))

    ; emit event on value update
    (atom.value (fn [] (events.emit "atom-updated" (freeze-atom atom))))

    ; listen for value updates from dependencies
    (events.on "atom-updated" (fn [frozen-atom]
      (if (.index-of atom.derefs frozen-atom.name)
        (log "dependency of" atom.name "updated:" frozen-atom.name))))

    atom))

(defn compile-atom-sync [atom]
  (set! atom.compiled (runtime.compile-source (atom.source) atom.name))
  (set! atom.requires (detective.find atom.compiled))
  (set! atom.derefs   (detective.find atom.compiled { :word "deref" }))
  atom)

(defn load-directory [dir]
  (.then (.then (list-atoms dir) init-atoms) read-atoms))

(defn list-atoms [dir]
  (Q.Promise (fn [resolve reject]
    (glob (path.join dir "**" "*") {} (fn [err atoms]
      (if err (do (log err) (reject err)))
      (let [names (.join (atoms.map (path.relative.bind nil dir)) " ")]
        (log "loading atoms" (colors.bold names) "from" (colors.green dir))
        (resolve atoms)))))))

(defn init-atoms [atom-names]
  (Q.all-settled (.map atom-names (fn [name]
    (init-atom name)))))

(defn init-atom [name]
  (Q.Promise (fn [resolve]
    (let [atom (make-atom name)]
      (set! (aget ATOMS name) atom)
      (resolve atom)))))

(defn read-atoms [atoms]
  (Q.all-settled (.map atoms (fn [promised]
    (read-atom promised.value)))))

(defn read-atom [atom]
  (Q.Promise (fn [resolve reject]
    (fs.read-file atom.name { :encoding "utf-8" } (fn [err src]
      (if err (do (log err) (reject err)))
      (atom.source.set src)
      (resolve atom))))))

(defn freeze-atoms []
  (let [snapshot {}]
    (.map (Object.keys ATOMS) (fn [i]
      (set! (aget snapshot i) (freeze-atom (aget ATOMS i)))))
    snapshot))

(defn freeze-atom [atom]
  (let [frozen { :name atom.name :source (atom.source)}]
    (if atom.evaluated (set! frozen.value (atom.value)))
    (set! frozen.timestamp (Math.floor (Date.now)))
    frozen))

(defn run-atom [name]
  (Q.Promise (fn [resolve reject]
    (if (= -1 (.index-of (Object.keys ATOMS) name))
      (reject (str "No atom" name)))
    (resolve (evaluate-atom (aget ATOMS name))))))

(defn evaluate-atom [atom]
  (Q.Promise (fn [resolve reject]
    (try (resolve (evaluate-atom-sync atom))
      (catch e (reject e))))))

(defn evaluate-atom-sync [atom]
  ; compile atom code if not compiled yet
  (if (and atom.evaluated (not atom.outdated))
    atom
    (do
      (if (not atom.compiled) (compile-atom-sync atom))
      (let [code    atom.compiled.output.code
            context (runtime.make-context atom.name)]
        ; make loaded atoms available in context
        (.map (Object.keys ATOMS) (fn [i]
          (set! (aget context (translate (aget (i.split "/") 2))) (aget ATOMS i))))
        ; add deref function and associated dependency tracking to context
        (let [deref-deps
                []
              deref-atom
                (fn deref-atom [atom]
                  (if (= -1 (deref-deps.index-of atom.name))
                    (deref-deps.push atom.name))
                  (if (and atom.evaluated (not atom.outdated))
                    (.value atom))
                    (.value (evaluate-atom-sync atom)))]
          (set! deref-atom.deps deref-deps)
          (set! context.deref deref-atom))
        ; add browserify require to context
        (if process.browser
          (set! context.require require))
        ; evaluate atom code
        (let [value (vm.run-in-context (runtime.wrap code) context { :filename atom.name })]
          ; if a runtime error has arisen, throw it upwards
          (if context.error
            (throw context.error)
            ; otherwise store the updated value and return the atom
            (do
              (set! atom.evaluated true)
              (atom.value.set value)
              atom)))))))
