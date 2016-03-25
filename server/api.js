module.exports = function (id) {
  return {
    subscribe: function subscribe (cb) {
      if (cb) _.model(function (val) { cb(serialize(val)) });
      return serialize(_.model());
    },
    connect: function connect (address) {
      console.log("connecting to debug session at", address);
      address = (address || '').split(':');
      var host, port;
      if (address.length === 1) {
        host = 'localhost';
        port = address[0];
      } else {
        host = address[0];
        port = address[1];
      }
      return new Promise(function (win, fail) {
        var address = 'ws://' + (host || 'localhost') + ':' + port
          , socket  = new (require('ws'))(address);
        socket.onerror = fail.bind(null, 'could not connect to ' + address);
        socket.onopen = function () {
          socket.onerror = null;
          var sessions = _.model.sessions()
            , session  = sessions[address] || {}
          if (session.socket) session.socket.close();
          _.model.sessions.put(address,
            { address: address
            , socket:  socket });
          win(address);
        }
      })
    },
    fetch: function fetch (address) {
      console.log("fetching data for", address);
      return new Promise(function (win, fail) {
        win(JSON.stringify(
          { 'foo/':  '1234'
          , '  bar': '5678'
          , '  baz': '9101112' }))
      })
    }
  }
};

function serialize (data) {
  return JSON.stringify(data, function (key, val) {
    if (key === 'socket' || key === 'api') return undefined;
    return val;
  });
}
