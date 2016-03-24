module.exports =
  { session:
    { connect:
        function connect (port) {
          console.log("connecting to session", port)
          return new Promise(function (win, fail) {
            fail('oops')
          })
        }  } }
