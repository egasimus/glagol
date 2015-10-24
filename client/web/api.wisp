(fn api-call [op path & args]

  (let [call
          (fn []
            (loop [p (path.split "/")
                   q ./server/api]
              (if (< 1 p.length) (recur (p.slice 1) (q.get (aget p 0)))
                (if (= 1 p.length) (.apply (aget q op) q (.concat [p] args))
                  (if (> 1 p.length) (throw (Error. (str "api: say path"))))))))

        ready
          ./server/socket/ready-state]

    (if (= 0 ready)
      (new (.-Promise (require :q)) (fn [resolve]
        (./server/socket/on :open (fn [] (resolve (call))))))
      (if (= 1 ready)
        (call)
        (throw (Error. (str "api socket in state " ready)))))))
