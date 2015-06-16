(let [create     (require "virtual-dom/create-element")
      h          (require "virtual-dom/h")
      insert-css (require "insert-css")
      sampler  (fn []
        (h ".sampler" [
          (h ".sampler-controls" [
            (h ".sampler-label" "Sample 1")
            (h ".sampler-play" "Play")])
          (h ".sampler-waveform")]))
      new-body (create
        (h "html" [(h "head") (h "body" [(sampler) (sampler)])]))]
  (document.replaceChild new-body document.firstChild)
  (insert-css (require "./gui.styl")))
