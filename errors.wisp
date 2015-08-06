;;
;; error routes
;;

(defn handler-404 [req res]
  (send-html req res { :body "404" }))

(defn handler-error [error req res]
  (send-json req res error))

