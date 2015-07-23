(def ^:private bitwise  (require "./bitwise.js"))
(def ^:private child    (require "child_process"))
(def ^:private dbus     (require "dbus-native"))
(def ^:private event2   (require "eventemitter2"))
(def ^:private Q        (require "q"))

(def DEBUG false)

; cornerstone

(defn expect
  " Unbinds an event handler as soon as a condition is fulfilled;
    optionally waits for a promise beforehand. Came to be because
    Wisp's syntax doesn't seem to let an event handler unbind itself.
    Looks somewhat like a combination of promises and events; maybe
    the deferred should also be part of this construct, and a promise
    should always be returned? Also, how difficult would a circular
    expect be, and would it be the way to go for achieving automatic
    re-initialization of unplugged and then re-plugged controllers? "
  ([emitter event finder found]
    (let [finder- nil]
      (set! finder- (fn [& args]
        (if (finder.apply null args)
          (do (found.apply null args)
              (emitter.off event finder-)))))
      (emitter.on event finder-)))
  ([pre-promise pre-finder emitter event finder found]
    (pre-promise.then (fn [& args]
      (let [pre-found (pre-finder.apply null args)]
        (if pre-found
          (found.apply null [pre-found])
          (expect emitter event finder found)))))))

; initial state

(def state
  { :started
      false
    :events
      (event2.EventEmitter2. { :maxListeners 64 })
    :clients
      {}
    :clientNames
      []
    :connections
      {}
    :connectionIds
      []
    :spawn
      {} })

; parsers

(defn parse-ports [data]
  (let [ports {}]
    (data.map (fn [port]
      (let [port-id   (aget port 0)
            port-name (aget port 1)
            test-bit  (fn [bit] (= bit (bitwise.and (aget port 2) bit)))]
        (set! (aget ports port-name)
          { :id         port-id
            :name       port-name
            :canMonitor (test-bit 0x8)
            :isInput    (test-bit 0x1)
            :isOutput   (test-bit 0x2)
            :isPhysical (test-bit 0x4)
            :isTerminal (test-bit 0x10)
            :signal     (if (aget port 3) "event" "audio") }))))
    ports))

(defn parse-clients [data]
  (let [clients {}]
    (data.map (fn [client]
      (set! (aget clients (aget client 1))
        { :id    (aget client 0)
          :name  (aget client 1)
          :ports (parse-ports (aget client 2)) })))
    clients))

(defn parse-connections [data]
  (let [connections {}]
    (data.map (fn [connection]
      (let [out-client (aget state.clients    (aget connection 1))
            out-port   (aget out-client.ports (aget connection 3))
            in-client  (aget state.clients    (aget connection 5))
            in-port    (aget in-client.ports  (aget connection 7))]
        (set! (aget connections (aget connection 8))
          { :output out-port
            :input  in-port }))))
  connections))

; state updater

(defn update [cb]
  (state.patchbay.GetGraph "0" (fn [err graph client-list connection-list]
    (if err (throw err))
    (set! state.clients        (parse-clients     client-list))
    (set! state.connections    (parse-connections connection-list))
    (set! state.client-names   (Object.keys state.clients))
    (set! state.connection-ids (Object.keys state.connections))
    (if cb (cb)))))

; event handlers

(defn bind []
  (let [patchbay state.patchbay]
    (patchbay.on
      "ClientAppeared"
      (fn [& args] (let [client (aget args 2)]
        (if DEBUG (log (str "client appeared:    " client)))
        (update (fn [] (state.events.emit "client-online" client))))))
    (patchbay.on
      "ClientDisappeared"
      (fn [& args] (let [client (aget args 2)]
        (if DEBUG (log (str "client disappeared: " client)))
        (update (fn [] (state.events.emit "client-offline" client))))))
    (patchbay.on
      "PortAppeared"
      (fn [& args] (let [client (aget args 2)
                         port   (aget args 4)]
        (if DEBUG (log (str "port appeared:      " client ":" port)))
        (update (fn [] (state.events.emit "port-online" client port))))))
    (patchbay.on
      "PortDisappeared"
      (fn [& args] (let [client (aget args 2)
                         port   (aget args 4)]
        (if DEBUG (log (str "port disappeared:   " client ":" port)))
        (update (fn [] (state.events.emit "port-offline" client port))))))
    (patchbay.on
      "PortsConnected"
      (fn [& args] (let [out-client (aget args 2)
                         out-port   (aget args 4)
                         in-client  (aget args 6)
                         in-port    (aget args 8)]
        (if DEBUG (log (str "ports connected:    " out-client ":" out-port
                                           " -> "  in-client ":"  in-port)))
        (update (fn [] (state.events.emit "connected" out-client out-port
                                                      in-client  in-port))))))
    (patchbay.on
      "PortsDisconnected"
      (fn [& args] (let [out-client (aget args 2)
                         out-port   (aget args 4)
                         in-client  (aget args 6)
                         in-port    (aget args 8)]
        (if DEBUG (log (str "ports disconnected: " out-client ":" out-port
                                            " >< "  in-client ":"  in-port)))
        (update (fn [] (state.events.emit "disconnected" out-client out-port
                                                         in-client  in-port))))))
    (patchbay.on "GraphChanged"
      (fn []))
        ;(log (str "graph changed"))))
    (set! started true)
    (state.events.emit "started")))

; initializer

(defn init []
  (Q.Promise (fn [resolve reject notify]
    (let [dbus         (require "dbus-native")
          dbus-name    "org.jackaudio.service"
          dbus-path    "/org/jackaudio/Controller"
          dbus-service (.get-service (dbus.session-bus) dbus-name)]
      (dbus-service.get-interface dbus-path "org.jackaudio.JackControl"
        (fn [err control] (if err (reject err))
          (notify "connected to jack control")
          (set! state.control control)
          (control.StartServer (fn []
            (notify "jack server started")
            (dbus-service.get-interface dbus-path "org.jackaudio.JackPatchbay"
              (fn [err patchbay] (if err (reject err))
                (notify "connected to jack patchbay")
                (set! state.patchbay patchbay)
                (update (fn []
                  (notify "initialization complete")
                  (bind)
                  (resolve state)))))))))))))

; execute as soon as the session has started

(def after-session-start
  (let [deferred (Q.defer)]
    (if state.started
      (deferred.resolve)
      (state.events.on "started" deferred.resolve))
    deferred.promise))

; spawn a child process once the session has started
; so that a ClientAppeared notification can be received

(defn do-spawn [id & args]
  (or (aget state.spawn id)
    (let [p
            (child.spawn.apply nil 
              [ (aget args 0) (args.slice 1) { :stdio "inherit"} ]) ]
                ; command     args           opts
      (set! (aget state.spawn id) p)
      p)))

(defn spawn [id & args]
  (args.unshift id)
  (Q.Promise (fn [resolve reject]
    (after-session-start.then (fn []
      (try (resolve (do-spawn.apply nil args))
        (catch e (reject e))))))))


;;
;; client and port operations
;;

(defn connect-by-name [output-c output-p input-c input-p]
  (Q.Promise (fn [resolve]
    (state.patchbay.ConnectPortsByName output-c output-p input-c input-p
      (fn [] (resolve))))))

  ;(log "connecting:        "
    ;(str output-c ":" output-p)
    ;(str input-c  ":" input-p))
  ;(state.patchbay.ConnectPortsByName
    ;output-c output-p input-c input-p)
  ;(persist.cleanup.push (fn []
    ;(log "Disconnecting" output-c output-p input-c input-p)
    ;(state.patchbay.DisconnectPortsByName
      ;output-c output-p input-c input-p))))

(defn connect-by-id [output-c output-p input-c input-p]
  (state.patchbay.ConnectPortsByID output-c output-p input-c input-p))

(defn find-client [client-name]
  (.indexOf (Object.keys state.clients) client-name))

(defn client-found? [client-name]
  (not (= -1 (find-client client-name))))

(defn find-port [client-name port-name]
  (let [client  (or (aget state.clients client-name)
                    { :ports {} })
        ports   (Object.keys client.ports)]
    (.indexOf ports port-name)))

(defn port-found? [client-name port-name]
  (not (= -1 (find-port client-name port-name))))

(defn port [client-name port-name]
  (let [deferred   (Q.defer)
        port-state { :name    port-name  
                     :client  client-name
                     :started deferred.promise
                     :online  false }]

    
    port-state))

(defn port [client-name port-name]
  (Q.Promise (fn [resolve]
    (let [port-state
            { :client client-name
              :name   port-name }]
      (expect
        after-session-start (fn [] (port-found? client-name port-name))
        state.events "port-online"
        (fn [c p] (and (= c client-name) (= p port-name)))
        (fn [] (log "port up" client-name port-name) (set! port-state.online true) (resolve port-state)))))))

(defn client [client-name]
  (Q.Promise (fn [resolve]
    (let [client-state
            { :name   client-name
              :events (event2.EventEmitter2.)
              :port   (port.bind nil client-name) }]
      (expect
        after-session-start (fn [] (client-found? client-name))
        state.events "client-online"
        (fn [c] (= c client-name))
        (fn [] (log "client up" client-name) (resolve client-state)))))))

(def system (client "system"))

(defn chain [chain-name & links]
  (links.map (fn [link]
    (let [out (aget link 0)
          out (.port (aget out 0) (aget out 1))
          inp (aget link 1)
          inp (.port (aget inp 0) (aget inp 1))]
      (.then (Q.all [ out.started
                      inp.started ])
        (fn [] (connect-by-name out.client out.name
                                inp.client inp.name)))))))
