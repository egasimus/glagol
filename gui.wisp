(let [create     (require "virtual-dom/create-element")
      h          (require "virtual-dom/h")
      insert-css (require "insert-css")
      sampler  (fn []
        (h ".sampler" [
          (h ".sampler-controls" [(h ".sampler-label" "Sample 1")])
          (h ".sampler-waveform")]))
      new-body (create
        (h "html" [(h "head") (h "body" (sampler))]))]
  (document.replaceChild new-body document.firstChild)
  (insert-css (str
    "body { font-family: Open Sans; background: rgb(44, 62, 80); color: #eee; margin: 0 }"
    ".sampler { margin: 12px; height: 240px; display: flex; }"
    ".sampler-waveform { flex-grow: 1; background: rgb(189, 195, 199); }"
    ".sampler-controls { width: 180px; background: rgb(140, 152, 153); }"
    ".sampler-label { padding: 6px 12px; background: rgb(39, 174, 96); font-size: 12px; font-weight: bold; text-transform: uppercase }")))
