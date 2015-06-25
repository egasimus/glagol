(def ^:private assoc (.-assoc (require "wisp/sequence")))

(def ^:private vdom (require "./lib/vdom.wisp"))

(def state ((require "observ") { :embeds [] :layout "columns" }))

(defn template []
  (vdom/h "html" [
    (vdom/h "head" [
      (vdom/h "meta" { :attributes { :charset "utf-8" } })
      (vdom/h "title" "étude") ] )
    (vdom/h "body" (.map (.-embeds (state)) (fn [embed]
      (vdom/h "section" { :dataset { :src embed } }
        (vdom/h "script" { :src embed }))))) ] ) )

(def view (vdom.init document template))

(state (vdom.update.bind nil view))

(state (fn [i] (console.log i)))

(state.set (assoc (state) :embeds [ "/editor?embed=true" ]))
