(def ^:private url (require "url"))

;;
;; generic http endpoint
;; calls arbitrary function in response to http request
;;

(set! exports endpoint)

(deftype HTTPEndpoint [name route handler destroy])

(defn matcher [route]
  (fn [req]
    (= route (.-pathname (url.parse req.url)))))

(defn- endpoint
  ([route handler]
    (endpoint route handler (fn [])))
  ([route handler destroy]
    (fn [state]
      (assoc state :endpoints (conj state.endpoints
        (HTTPEndpoint. route (matcher route) handler destroy))))))
