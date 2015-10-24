(fn [s])
  ;(let [h ../vdom/h]
    ;(h ".samplers"
      ;(s.samplers.map (fn [sampler i]
        ;(h (str ".sampler" (if sampler.playing ".playing" ""))
          ;{ :onclick (fn [] (./sampler-play sampler))
            ;:dataset { :key (if (< i 26) (String.from-char-code (+ i 65))) } }
          ;(.concat
            ;[ (if sampler.playing
                ;(h ".sampler-progress"
                  ;{ :dataset { :position sampler.position
                               ;:duration sampler.duration }
                    ;:style   { :width (/ sampler.position sampler.duration) } })) ]
            ;(.map (sampler.file.split "/") (fn [part]
              ;(h ".sampler-path-part" part))))))))))
