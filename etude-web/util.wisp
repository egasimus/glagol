(def ^:private runtime (require "etude-engine/runtime.js"))
(def ^:private through (require "through"))

(defn wispify [file]
  (let [data
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

(defn compiled [data file]
  (.-code (.-output (runtime.compile-source data file))))

(defn document-template [output]
  (str "<head><meta charset=\"utf-8\"></head><body><script>"
    output "</script>"))
