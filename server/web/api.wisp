{ :root (fn []
    (console.log 1)
    (console.log ./client)
    (let [frozen (./client/freeze)
          string (JSON.stringify frozen)]
      (console.log frozen)
      string)) }
  ;(let)
  ;;(log.as :root ./client)
  ;(log.as :bundle )
  ;16) };(JSON.stringify (.freeze (require "glagol/bundle") ./client))) }
