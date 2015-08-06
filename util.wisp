(def ^:private runtime (require "etude-engine/runtime.js"))
(def ^:private through (require "through"))

(defn wispify [file]
  (if (or (= (file.index-of ".wisp") (- file.length 5))
          (= -1 (file.index-of ".")))
    (through)
    (let [data ""]
      (through
        (fn [buf] (set! data (+ data buf)))
        (fn [] (this.queue (compiled data file))
               (this.queue nil))))))

(defn compiled [data file]
  (.-code (.-output (runtime.compile-source data file))))
