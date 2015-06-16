use dom

fn sampler
  ([index] (dom/tree
    [ ".sampler"
      [ [ ".sampler-controls"
          [ [ ".sampler-label"  (str "Sample " index) ]
            [ ".sampler-button" "Play"                ] ] ]
        [ ".sampler-waveform" ] ] ] ) )

new-body
  (let [bod (dom/create (dom/tree ["html" [["head"]] [["body" [(sampler) (sampler)]]]]))]
    (document.replaceChild new-body document.firstChild)
    (dom/add-style (require "./sampler.styl"))
    bod)
