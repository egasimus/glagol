// swag
document.body.style.backgroundColor='#1d1f21';
document.body.style.color='d5d8d6';
document.body.style.fontFamily="'Terminess Powerline', Inconsolata, monospace";
document.body.style.fontSize=8;

document.body.innerText = 'connecting';
var socket = new WebSocket("ws://localhost:1620");
var events = new (require('eventemitter2').EventEmitter2)();
var api = { emit: function emit (evt, arg) { events.emit(evt, arg); } };
var conn = new (require("q-connection"))(socket, api);
socket.addEventListener('open', function () {
  document.body.innerText = 'connected';
  conn.get('web').invoke('root').then(start, error);
});
function start (data) {
  document.body.innerText = data;
  data = JSON.parse(data);
  if (data.type === "FrozenNotion")
    evaluate(data);
  else if (data.type === "FrozenNotionDirectory")
    evaluate(data.notions.main);
}
function error (err)  { console.log(err); }
function evaluate (notion) {
  console.log("EVALUATING", notion);
}
//require('./foo.wisp');
