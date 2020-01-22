;;
;; message parsing
;;

(def ^:private bitwise (require "etude-jack/bitwise.js"))

(def event-types
  { 128 :note-off
    144 :note-on
    160 :key-pressure
    176 :control
    192 :program
    208 :pressure
    224 :pitch-bend })

(defn parse
  ([msg] (parse (aget msg 0) (aget msg 1) (aget msg 2)))
  ([d1 d2 d3]
    (let [channel (bitwise.and d1 15)
          event   (aget event-types (bitwise.and d1 240))]
      {:channel channel :event event :data1 d2 :data2 d3})))

(defn match
  [mask msg]
  (.reduce
    (Object.keys mask)
    (fn [prev curr]
      (and prev (= (aget mask curr) (aget msg curr))))
    true))

;;
;; port communication
;;

(def ^:private jack    (require "etude-jack"))
(def ^:private expect  jack.expect)
(def ^:private midi    (require "midi"))
(def ^:private Q       (require "q"))

(def a2j (jack.client "a2j"))
(jack.spawn "a2j" "a2jmidid" "-e")

(def state
  { :inputs  {}
    :outputs {} })

; TODO make these port-finders promises
; also make them useful
(defn- find-a2j-port [port-name-regex]
  (let [regex (RegExp. port-name-regex)
        ports (.-ports (aget jack.state.clients a2j.name))
        ports (.filter (Object.keys ports) (fn [p] (regex.test p)))
        port  (aget ports 0)]
    port))


(defn- find-rtmidi-port [client-name-regex port-name-regex]
  (let [client-regex  (RegExp. client-name-regex)
        client-list   (.filter (Object.keys jack.state.clients)
                        (fn [c] (client-regex.test c)))
        port-regex    (RegExp. port-name-regex)]
    (client-list.map (fn [client]
      (let [client-ports (.-ports (aget jack.state.clients client))]
        (log "->" client-ports)))))
  nil)


(defn re-test [regex value]
  (.test (RegExp regex) value))


(defn expect-hardware-port [port-name-regex]
  (let [deferred (Q.defer)]
    (expect
      (Q.all [jack.after-session-start a2j.started])
      (fn [] (find-a2j-port port-name-regex))
      jack.state.events "port-online"
      (fn [c p] (and (= a2j.name c) (re-test port-name-regex p)))
      (fn [port-name] (deferred.resolve [a2j.name port-name])))
    deferred.promise))


(defn expect-virtual-port [c-name-re p-name-re]
  (let [deferred (Q.defer)]
    (expect
      jack.after-session-start
      (fn [] (find-rtmidi-port c-name-re p-name-re))
      jack.state.events "port-online"
      (fn [c p] (and (re-test c-name-re c) (re-test p-name-re p)))
      (fn [c-name p-name] (deferred.resolve [c-name p-name])))
    deferred.promise))


(defn connect-to-input [port-name]
  (let [m (aget state.inputs port-name)]
    (or m (let [m       (new midi.input)
                vpcname "^RtMidi Input Client"
                vppname (str "^" port-name)
                hppname (str "^" port-name ".+(capture)")
                ports-online
                  (Q.all [ (expect-hardware-port hppname)
                           (expect-virtual-port vpcname vppname) ])
                connected (Q.defer)]
      (set! m.connected connected.promise)
      (set! (aget state.inputs port-name) m)
      (jack.after-session-start.then (fn []
        (m.open-virtual-port port-name)
        (.then ports-online 
          (fn [ports] (let [out-port (aget ports 0)
                            in-port  (aget ports 1)]
            (jack.connect-by-name
              (aget out-port 0) (aget out-port 1)
              (aget in-port  0) (aget in-port  1))
            (connected.resolve))))))
      m))))


(defn connect-to-output [port-name]
  (let [m (aget state.outputs port-name)]
    (or m (let [m       (new midi.output)
                vpcname "^RtMidi Output Client"
                vppname (str "^" port-name)
                hppname (str "^" port-name ".+(playback)")
                ports-online
                  (Q.all [ (expect-virtual-port vpcname vppname)
                           (expect-hardware-port hppname) ])
                connected (Q.defer)]
      (set! m.connected connected.promise)
      (set! (aget state.outputs port-name) m)
      (jack.after-session-start.then (fn []
        (m.open-virtual-port port-name)
        (.then ports-online
          (fn [ports] (let [out-port (aget ports 0)
                            in-port  (aget ports 1)]
            (jack.connect-by-name
              (aget out-port 0) (aget out-port 1)
              (aget in-port  0) (aget in-port  1))
            (connected.resolve))))))
      m))))
