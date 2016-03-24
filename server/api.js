module.exports =
  { session:
    { connect:
      function connect (address) {
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
          fail('oops')
        })
      } } }
