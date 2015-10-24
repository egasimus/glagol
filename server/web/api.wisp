{ :root (fn []
    (let [frozen (.freeze (require "glagol/bundle") ./client)
          string (JSON.stringify frozen)]
      (log frozen)
      string)) }
  ;(let)
  ;;(log.as :root ./client)
  ;(log.as :bundle )
  ;16) };(JSON.stringify (.freeze (require "glagol/bundle") ./client))) }
