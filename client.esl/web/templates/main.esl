(fn [s]
  (let [h ../vdom/h]
    (h ".app"
      { :attributes
          { :tabindex 1 }
        ;:onkeydown
          ;(fn [evt] (log "keydown" evt)
            ;(Array.prototype.map.call (container.get-elements-by-class-name "sampler")
              ;(fn [el] (if (= el.dataset.key (String.from-char-code evt.key-code)) (el.click)))))
        :hook
          ../vdom/focus-me }
      [ (./toolbar s)
        (./library s) ])))
