(defn wispify [file]
  (log.as :wispify)
  (let [through
          (require :through) $ (log through)
        runtime
          (require "glagol/runtime") $ (log runtime)
        compiled
          (fn [data file]
            (.-code (.-output (runtime.compile-source data file)))) $(log compiled)
        data
          ""
        wispy?
          (or (= (file.index-of ".wisp") (- file.length 5))
              (= -1 (file.index-of ".")))
        write
          (fn [buf] (set! data (+ data buf)))
        end
          (fn []
            (this.queue (if wispy? (compiled data file) data))
            (this.queue null))]
    (through write end)))
