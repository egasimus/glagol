(fn [evt & args]
  (fn []
    (../events/emit evt args)))
