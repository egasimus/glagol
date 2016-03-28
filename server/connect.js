(function (socket, api) {
  return require("q-connection")(socket, require('riko-api/server')(api))
})
