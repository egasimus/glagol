use "./lib/dom.wisp"

;fn sampler
  ;([index] (dom/tree
    ;[ ".sampler"
      ;[ [ ".sampler-controls"
          ;[ [ ".sampler-label"  (str "Sample " index) ]
            ;[ ".sampler-button" "Play"                ] ] ]
        ;[ ".sampler-waveform" ] ] ] ) )

template
  (dom/el "html" [(dom/el "head") (dom/el "body")])

init
  (let
    [ doc (dom/create @template) ]
    (document.replaceChild doc document.firstChild)
    (dom/add-style (require "./sampler.styl"))
    doc)

;(let [doc (dom/create (dom/tree ["html" [["head"] ["body" [(sampler) (sampler)]]]]))]
