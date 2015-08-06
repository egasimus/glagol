(def ^:private through (require "through"))

(defn wispify [file]
  (let [data
          ""
        wispy
          (or (= (file.index-of ".wisp") (- file.length 5))
              (= -1 (file.index-of ".")))
        write
          (fn [buf] (set! data (+ data buf)))
        end
          (fn []
            (this.queue
              (if wispy
                (compiled data file)
                data))
            (this.queue null))]
    (through write end)))

