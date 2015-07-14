(ns tree (:require [wisp.runtime :refer [=]]))

(def runtime    (require "./runtime.js"))
(def log        (.get-logger (require "./logging.js") "trees"))
(def engine     (runtime.require-wisp "./engine.wisp"))
(def wispify    (.-wispify (runtime.require-wisp "./lib/web.wisp")))
(def path       (require "path"))
(def browserify (require "browserify"))
(def shortid    (require "shortid"))

(defn resolve [path]
  (.sync (require "resolve") path
    { :basedir    "./project"
      :extensions [".js" ".wisp"]}))

(defn template [code mapped]
  (.join
    [ "var" code ";var deps=" mapped
      ";exports=function getRequire(a){"
      "return function atomRequire(m){"
      "return require(deps[a][m])}}"] ""))

(defn get-atom-by-name [name]
  (aget engine.ATOMS name))

(defn do-mah-thang []
  (let [init     (get-atom-by-name "init")
        deps     (engine.get-deps init)
        atoms    (.concat [init] (deps.derefs.map get-atom-by-name))
        requires {}
        resolved {}
        mapped   {}
        br       (.transform (browserify) wispify)]

    (.map atoms (fn [atom]
      (set! (aget requires atom.name) {})
      (atom.requires.map (fn [req]
        (let [res (resolve req)]
          (set! (aget (aget requires atom.name) req) res)
          (if (= -1 (.index-of (Object.keys resolved) res))
            (set! (aget resolved res) (shortid.generate))))))))

    (.map (Object.keys requires) (fn [i]
      (set! (aget mapped i) {})
      (.map (Object.keys (aget requires i)) (fn [j]
        (set! (aget (aget mapped i) j) (aget resolved (aget (aget requires i) j)))))))

    (.map (Object.keys resolved) (fn [module]
      (br.require module { :expose (aget resolved module) })))

    (br.bundle (fn [err buf]
      (if err (throw err)
      (log (template (String buf) mapped)))))))

(.then (engine.start "./project") do-mah-thang)
