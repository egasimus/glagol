(def ^:private colors  (require "colors/safe"))
(def ^:private ee2     (require "eventemitter2"))
(def ^:private fs      (require "fs"))
(def ^:private logging (require "etude-logging"))
(def ^:private path    (require "path"))
(def ^:private runtime (require "./runtime.js"))
(def ^:private Q       (require "q"))
(def ^:private util    (require "./util.wisp"))
(def ^:private vm      (require "vm"))

(defn make-notion
  " A Notion corresponds to a source code file;
    it contains its contents, the result of its
    transpilation to JavaScript, and the result
    of its last evaluation.

    Passing a preloaded source is optional. "
  [notion-path source-text]
  (let [events      (ee2.EventEmitter2.)
        notion-path (or notion-path "")
        pipeline    { :source   (if (string? source-text) source-text nil)
                      :compiled nil
                      :value    nil }
        notion      { :type      "Notion"
                      :path      notion-path
                      :name      (path.basename notion-path)
                      :events    events
                      :requires  []
                      :evaluated false
                      :outdated  false
                      :parent    nil }]

    (.map (keys pipeline) (add-observable-property!.bind nil notion pipeline))

    notion))

(def ^:private pipeline-event-names
  { :source   :loaded
    :compiled :compiled
    :value    :evaluated })

(def ^:private pipeline-operations
  { :source   read
    :compiled compile
    :value    evaluate })

(defn- read [notion]
  (if notion.path
    (let [source (fs.read-file-sync notion.path :utf8)]
      (set! notion.source source)
      source)
    ""))

(defn- compile [notion]
  " Compiles a notion's source code and determines its dependencies. "
  [notion]
  (if notion.source
    (let [compiled (runtime.compile-source notion.source notion.name)]
      (set! notion.compiled compiled)
      compiled)
    {}))

(defn- evaluate
  " Evaluates the notion in a newly created context. "
  [notion]
  (if (and notion.source notion.compiled
           notion.compiled.output notion.compiled.output.code)
    (let [context (make-context notion)
          value   (vm.run-in-context
                    (runtime.wrap notion.compiled.output.code)
                    context { :filename notion.name })]
      (if context.error (throw context.error)
      value))
    undefined))

(defn- make-context [notion]
  " Prepares an execution context with globals used by notions. 

    Can't assoc context because the resulting object is uncontextified,
    so we rely on our good old friend imperative set! to add some
    notion-specific globals to each notion's VM execution context. "
  (let [context (runtime.make-context notion.path)]
    (set! context.process.cwd (fn [] (path.dirname notion.path)))
    (set! context.log  (logging.get-logger (str (colors.bold "@") notion.name)))
    (set! context.self notion)
    (set! context._    (get-tree notion))
    (set! context.__   (aget (get-tree notion) :__))
    context))

(defn- setter [i n]
  (fn [args]
    (if (not (vector? args)) (throw (Error. (str
        "pass a [operation arg1 arg2 ... argN] vector "
        "when writing to a notion"))))
      (let [operation (aget args 0)]
        (cond
          (= operation :watch)
            (cond
              (= n.type "Notion")
                (n.value (aget args 1))
              (= n.type "NotionDirectory")
                (.map (keys n.notions) (fn [i]
                  (.value (aget n.notions i) (aget args 1)))))
          :else (throw (Error. (str
            operation " is not a valid operation, "
            "unlike :watch"))))
        nil)))

(defn- dir-getter [n]
  (fn [] (get-tree n)))

(defn- getter [n]
  (fn [] (if (or (not n.evaluated) n.outdated) (evaluate n))
         n.value))

(defn- add-to-tree [cwd i n]
  (Object.define-property cwd (translate i)
    { :configurable true :enumerable true
      :get (cond
        (= n.type "Notion")          (getter n)
        (= n.type "NotionDirectory") (dir-getter n))
      :set (setter i n) }))

(defn get-tree
  " From file, . points to parent and .. to grandparent;
    from dir, .. points to parent and . to self. "
  [notion]
  (let [cwd {}]
    (cond
      (and (= notion.type "Notion") notion.parent)
        (set! cwd (get-tree notion.parent))
      (= notion.type "NotionDirectory") (do
        (set! cwd._ cwd)
        (.map (keys notion.notions) (fn [i]
          (let [n (aget notion.notions i)]
            (add-to-tree cwd i n))))
        (if notion.parent (set! cwd.__ (get-tree notion.parent)))))
    cwd))

(defn- add-observable-property! [notion pipeline i]
  (Object.define-property notion i
    { :configurable true
      :enumerable   true
      :get (fn []
             (if (nil? (aget pipeline i))
               ((aget pipeline-operations i) notion)
               (aget pipeline i)))
      :set (fn [v]
             (aset pipeline i v)
             (notion.events.emit (aget pipeline-event-names i) [notion v])) }))

(defn load-notion
  " Loads a notion from the specified path, and adds it to the watcher. "
  [notion-path]
  ;(log.as :load-notion notion-path)
  (Q.Promise (fn [resolve reject]
    (fs.read-file notion-path "utf-8" (fn [err src]
      (if err (reject err) (resolve (make-notion notion-path src))))))))

(def translate
  (.-translate-identifier-word (require "wisp/backend/escodegen/writer.js")))
