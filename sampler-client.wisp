use "./lib/vdom.wisp"

;fn sampler
  ;([index] (dom/tree
    ;[ ".sampler"
      ;[ [ ".sampler-controls"
          ;[ [ ".sampler-label"  (str "Sample " index) ]
            ;[ ".sampler-button" "Play"                ] ] ]
        ;[ ".sampler-waveform" ] ] ] ) )

fn sampler-template
  ([index]
    (vdom/h ".sampler"
      [ (vdom/h ".sampler-controls"
        [ (vdom/h ".sampler-label"  (str "Sample " index))
          (vdom/h ".sampler-button" "Play") ])
        (vdom/h ".sampler-waveform")]))

fn template
  ([]
    (vdom/h ".samplers" [
      (sampler-template 1)
      (sampler-template 2)]))

init
  (vdom/init document.current-script.parent-element template)
  ;(let
    ;[ doc (dom/create @template) ]
    ;(document.replaceChild doc document.firstChild)
    ;(dom/add-style (require "./sampler.styl"))
    ;doc)

;(let [doc (dom/create (dom/tree ["html" [["head"] ["body" [(sampler) (sampler)]]]]))]
