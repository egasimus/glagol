// swag
document.body.style.backgroundColor='#1d1f21';
document.body.style.color='d5d8d6';
document.body.style.fontFamily="'Terminess Powerline', Inconsolata, monospace";
document.body.style.fontSize=8;

function error (err) { console.log(err); }

document.body.innerText = 'connecting';

var socket = new WebSocket("ws://localhost:1620");
var events = new (require('eventemitter2').EventEmitter2)();
var api = { emit: function emit (evt, arg) { events.emit(evt, arg); } };
var conn = new (require("q-connection"))(socket, api);

socket.addEventListener('open', function () {
  document.body.innerText = 'connected';
  conn.get('web').invoke('root', start).catch(error);
});

function start (data) {
  document.body.innerText = data;
  var app = require('glagol').Directory(null, { thaw: JSON.parse(data) })
    , root = app.tree();
  console.log(root);
  console.log(root.main);
  console.log(root.vdom);
  root.main(document);
}
