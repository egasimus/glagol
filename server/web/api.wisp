{ :root (fn []
    (let [frozen (./client/freeze)
          string (JSON.stringify frozen)]
      (log frozen)
      string)) }
  ;(let)
  ;;(log.as :root ./client)
  ;(log.as :bundle )
  ;16) };(JSON.stringify (.freeze (require "glagol/bundle") ./client))) }
