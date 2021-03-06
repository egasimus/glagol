var API_URL = 'ws://localhost:1617';

module.exports = function (App) {

  var socket = require('extend')(
    new WebSocket(API_URL),
    { onopen: function () { socket.onopen = null; socket.send('api'); }
    , onclose: function () { $.reload('API socket closed') }
    , onmessage: function (msg) { return _.update(App, msg) } });

  App.API = require('riko-api2')(socket);

  App.API.socket = socket;

};
