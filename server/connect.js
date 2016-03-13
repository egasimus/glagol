(function (socket, api) {
  require("q-connection")(socket, require('riko-api/server')(api))
})
