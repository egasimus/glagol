;; WIP

(defn is-symbol [f]
  (and (= f.metadata.type "wisp.symbol")
       (= f.namespace     undefined)))

(defn enable-meta [f]
  (Object.defineProperty (or f {}) "metadata" { :enumerable true })
  f)

(defn unexpected-form! [f i]
  (throw (Error. (str
    "Unexpected form " i ": " f
    (if f.metadata
      (str " at " f.metadata.start.line ":" f.metadata.start.column)
      "")))))

(defn array->object [arr]
  (let [obj { :metadata arr.metadata}]
    (loop [index 0]
      (if (< arr.length) (do
        (set! (aget obj index) (aget arr index))
        (recur (+ 1 index)))))
    (set! obj.metadata.type "array")
    obj))

(defn make-private [f]
  (set! f (with-meta f { :private true }))
  (enable-meta f))

(defn get-source-getter [lines]
  (fn [f]
    (let [src   []
          start f.metadata.start
          end   f.metadata.end]
      (loop [line start.line]
        (if (> line end.line)
          (src.join "\n")
          (let [line (aget lines line)]
            (src.push
              (cond
                (= line start.line) (line.substr start.column)
                (= line end.line)   (line.substr 0 end.column)
                true                line))
            (recur (+ 1 line))))))))

(defn get-meta-exposer [lines]
  (let [get-source (get-source-getter lines)]
    (fn expose-meta [f]
      (if (instance-of? f Array) (set! f (array->object f)))
      (enable-meta f)
      (if (not f.metadata.tile) (set! f.metadata.type f.constructor.type))
      (set! f.metadata.source (get-source f)))))

(defn preprocess [parsed source]
  (if parsed.error (throw (Error. (str "Reader error: " parsed.error))))
  (let [lines
          (source.split "\n")
        forms
          (:forms parsed)
        out
          []
        error
          []
        sym
          (symbol.bind nil undefined)
        expose-meta
          (get-meta-exposer lines)]

    (loop [state :init
           arg   nil
           m     nil
           out   []
           f     (expose-meta (first forms))
           forms (rest forms)]
      (if (= state :init)
        (cond
          (and (is-symbol f) (= "use" f.name))
            (recur :use arg f.metadata out
              (expose-meta (first forms)) (rest forms))

          (and (is-symbol f) (= "fn"  f.name))
            (recur :fn  arg f.metadata out
              (expose-meta (first forms)) (rest forms))

          (is-symbol f)
            (recur :def f   f.metadata out
              (expose-meta (first forms)) (rest forms))

          (= "wisp.list" f.metadata.type)
            (recur state arg m (conj out f)
              (expose-meta (first forms)) (rest forms))

          true
            (unexpected-form! f i))

        (if (and (is-symbol f) (not (= -1 (.index-of [:use :fn :def] f.name))))
          (unexpected-form! f i)
          (let [output (fn [f] (conj out (enable-meta (if m (with-meta f m) f))))]
            (cond
              (= state :use)
                (recur
                  :init nil nil
                  (output (list (sym "def") (make-private (sym f.name))
                                (list (sym "use") f.name)))
                  (expose-meta (first forms)) (rest forms))

              (= state :fn)
                (if arg
                  (recur :init nil nil
                    out
                    (expose-meta (first forms)) (rest forms))
                  (recur :fn f nil
                    (output (list (sym "defn") arg f))
                    (expose-meta (first forms)) (rest forms)))

              (= state :def)
                (recur
                  :init nil nil
                  (output (list (sym "def") arg (list (sym "atom") f)))
                  (expose-meta (first forms)) (rest forms))

              true
                (unexpected-form! f i))))

        ))))
