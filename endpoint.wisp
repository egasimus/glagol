;;
;; generic http endpoint
;; calls arbitrary function in response to http request
;;

(deftype HTTPEndpoint [name route handler destroy])

(defn- endpoint-matcher [route]
  (fn [req]
    (= route (.-pathname (url.parse req.url)))))

(defn- endpoint
  ([route handler]
    (endpoint route handler (fn [])))
  ([route handler destroy]
    (fn [state]
      (assoc state :endpoints (conj state.endpoints
        (HTTPEndpoint. route (endpoint-matcher route) handler destroy))))))

(set! exports endpoint)
