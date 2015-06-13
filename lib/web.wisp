(defn server [options & args]
  (log "Hi, I'm a server!" (JSON.stringify options)))

(defn page [route script])

(defn socket [])
