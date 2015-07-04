(def ^:private Q (require "q"))
(set! Q.longStackSupport true)

(def ^:private colors   (require "colors/safe"))
;(def ^:private chokidar (require "chokidar"))
(def ^:private fs       (require "fs"))
(def ^:private glob     (require "glob"))
(def ^:private observ   (require "observ"))
(def ^:private path     (require "path"))
(def ^:private runtime  (require "./runtime.js"))
(def ^:private url      (require "url"))
(def ^:private vm       (require "vm"))

(def ^:private = runtime.wisp.runtime.is-equal)

(def translate
  (.-translate-identifier-word (require "wisp/backend/escodegen/writer.js")))

(def log     (.get-logger (require "./logging.js") "engine"))
(def events  (new (.-EventEmitter2 (require "eventemitter2"))))
;(def watcher (chokidar.watch "" { :persistent true :alwaysStat true}))

(def ATOMS {})

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

(defn make-atom [name source initial-value]
  (let [atom  { :type "Atom" :name name :source (observ (.trim (or source "")))}
        value (observ initial-value)]
    (value (fn [] (events.emit "atom-updated" (freeze-atom atom))))
    (set! atom.value (fn value-placeholder [listener]
      (if (not listener) (do
        (value.set (.value (evaluate-atom-sync atom)))
        (set! atom.value value)
        (atom.value)))))
    (set! atom.value.set (fn [v]
      (value.set v)
      (set! atom.value value)))
    atom))

(defn freeze-atoms []
  (let [snapshot {}]
    (.map (Object.keys ATOMS) (fn [i]
      (set! (aget snapshot i) (freeze-atom (aget ATOMS i)))))
    snapshot))

(defn freeze-atom [atom]
  (let [frozen { :name atom.name :source (atom.source)}]
    (if (= atom.value.name "observable") (set! frozen.value (atom.value)))
    (set! frozen.timestamp (Math.floor (Date.now)))
    frozen))

(defn run-atom [name]
  (Q.Promise (fn [resolve reject]
    (if (= -1 (.index-of (Object.keys ATOMS) name))
      (reject (str "No atom" name)))
    (resolve (evaluate-atom (aget ATOMS name))))))

(defn evaluate-atom-sync [atom]
  (let [compiled (runtime.compile-source (atom.source) atom.name)
        context  (runtime.make-context atom.name)]
    (.map (Object.keys ATOMS) (fn [i]
      (set! (aget context (translate (aget (i.split "/") 2))) (aget ATOMS i))))
    (set! context.__dirname (path.resolve (path.dirname atom.name)))
    (let [deref-deps
            []
          deref-atom
            (fn deref-atom [atom]
              (if (= -1 (deref-deps.index-of atom.name))
                (deref-deps.push atom.name))
              (.value atom))]
      (set! deref-atom.deps deref-deps)
      (set! context.deref deref-atom))
    (let [value (vm.run-in-context
                  (runtime.wrap compiled.output.code)
                  context { :filename atom.name })]
      (if context.error
        (throw context.error)
        (do
          (atom.value.set value)
          atom)))))

(defn evaluate-atom [atom]
  (Q.Promise (fn [resolve reject]
    (try
      (resolve (evaluate-atom-sync atom))
      (catch e (reject e))))))
