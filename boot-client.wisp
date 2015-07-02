(def ^:private assoc (.-assoc   (require "wisp/sequence")))
(def ^:private map   (.-map     (require "wisp/sequence")))
(def ^:private =     (.-isEqual (require "wisp/runtime")))

(def ^:private vdom (require "./lib/vdom.wisp"))

(def state ((require "observ") { :embeds [] :layout "columns" }))

(defn update [& args] (state.set (apply assoc (state) args)))

(defn template []
  (vdom/h "html" [
    (vdom/h "head" [
      (vdom/h "meta" { :attributes { :charset "utf-8" } })
      (vdom/h "style" (require "./global.styl"))
      (vdom/h "title" "étude") ] )
    (vdom/h "body" (.map (.-embeds (state)) (fn [embed]
      (vdom/h "section" { :dataset { :src embed.src } } [
        (if embed.error
          (vdom/h ".embed-error-container"
            (vdom/h ".embed-error" (str "Could not load " embed.src))))
        (vdom/h "script" { :src     embed.src
                           :onload  load-success
                           :onerror load-error }) ] )))) ] ) )

(defn set-error [evt error]
  (fn [embed]
    (if (= embed.src evt.target.src)
      (assoc embed :error error) embed)))

(defn load-success [evt]
  (console.log "Loaded" evt.target.src)
  (update :embeds (.map (.-embeds (state)) (set-error evt false))))

(defn load-error [evt]
  (console.log "Failed to load" evt.target.src)
  (update :embeds (.map (.-embeds (state)) (set-error evt true))))

(def view (vdom.init document template))

(state (vdom.update.bind nil view))

(update :embeds
  [ { :src "http://localhost:4194/editor?embed=true" }
    { :src "http://localhost:2097/?embed=true"       } ] )
