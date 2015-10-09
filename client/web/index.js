document.write('hellow');
var socket = new WebSocket("ws://localhost:1620");
var events = new (require('eventemitter2').EventEmitter2)();
var api = { emit: function emit (evt, arg) { events.emit(evt, arg); } };
var conn = new (require("q-connection"))(socket, api);
socket.addEventListener('open', function () {
  document.write('socket');
  conn.get('web').invoke('root').then(
    function (data) { document.write(data); },
    function (err)  { console.log(err); });
})
//require('./foo.wisp');
