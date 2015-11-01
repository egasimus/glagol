function error (err) { console.log(err); }

document.body.innerText = 'connecting';

var socket = new WebSocket("ws://localhost:1620");
var events = new (require('eventemitter2').EventEmitter2)();
var api = { emit: function emit (evt, arg) { events.emit(evt, arg); } };
var conn = new (require("q-connection"))(socket, api);

socket.addEventListener('open', function () {
  document.body.innerText = 'loading';
  conn.get('web').invoke('root', start).catch(error);
});

function start (data) {
  document.body.innerText = data;
  var parsed = JSON.parse(data);
  require('require-like').install(parsed.deps, parsed.bundle);
  var app = require('glagol').Directory(null, { thaw: parsed.ice })
    , root = app.tree();
  console.log(1);
  console.log(root);
  console.log(2);
  console.log(root.main);
  console.log(3);
  console.log(root.vdom);
  root.main(document);
}
