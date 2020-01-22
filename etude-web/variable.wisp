;;
;; (unused)
;; exposes an atom over rest
;;

(defn variable [route atom-instance]
  (endpoint route (fn [req res]
    (cond
      (= req.method "GET")
        (send-json req res @atom-instance)
      (= req.method "POST")
        (let [data ""]
          (req.on "data" (fn [buf] (set! data (+ data buf))))
          (req.on "end"  (fn []
            (log "posted to" (colors.green route) "value" (colors.blue data))
            (send-json req res "OK"))))))))
