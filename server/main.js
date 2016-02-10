(function () {
  var web = require('glagol-web')
    , resolve = require('path').resolve.bind(null, __dirname)
    , server = web.server($.options.server.host, $.options.server.port,
        [ web.route('/', web.app({}, resolve('../client'), resolve('../common')))
        , web.route('/upload', _.upload) ]);

  server.http.on('listening', function () {
    console.log('open ' + $.options.server.host + ':' + $.options.server.port +
      ' in your browser')
  })

  server.sockets.on("connection", function (socket) { $.connect(socket) });

  return server;
})
