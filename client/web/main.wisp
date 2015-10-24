(fn [document]
  (let [mainloop (./vdom/start #(./templates/main %1) ./state)]

    (set! document.body.innerHTML "")
    (document.body.append-child mainloop.target)

    ; preprocess and insert css
    (.read-file (require :fs) "./client/web/style.styl" :utf8 (fn [err styl]
      (if err (throw err))
      (.render (require :stylus) styl { :filename "style.styl" } (fn [err css]
        (if err (throw err))
        (./vdom/insert-css css)))))

    mainloop))


  ;(./vdom/update (./view document) ./state))
  ;(debug "\nindex" ./state)
  ;(./vdom/update ./view ./state)) ; i'm not sure why this works
                                  ;; or if
