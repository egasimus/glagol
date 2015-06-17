use "./lib/dom.wisp"

;fn sampler
  ;([index] (dom/tree
    ;[ ".sampler"
      ;[ [ ".sampler-controls"
          ;[ [ ".sampler-label"  (str "Sample " index) ]
            ;[ ".sampler-button" "Play"                ] ] ]
        ;[ ".sampler-waveform" ] ] ] ) )

fn sampler-template
  ([index]
    (dom/el ".sampler"
      [ (dom/el ".sampler-controls"
        [ (dom/el ".sampler-label"  (str "Sample " index))
          (dom/el ".sampler-button" "Play") ])
        (dom/el ".sampler-waveform")]))

template
  (dom/el "html" [
    (dom/el "head")
    (dom/el "body" [
      (sampler-template 1)
      (sampler-template 2)])])

init
  (let
    [ doc (dom/create @template) ]
    (document.replaceChild doc document.firstChild)
    (dom/add-style (require "./sampler.styl"))
    doc)

;(let [doc (dom/create (dom/tree ["html" [["head"] ["body" [(sampler) (sampler)]]]]))]
