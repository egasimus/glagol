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
  conn.get('web').invoke('root').then(start, error).done();
});

function start (data) {
  document.body.innerText = data;
  var root =
        JSON.parse(data)
    , notion =
        root.type === "FrozenNotion"          ? root              :
        root.type === "FrozenNotionDirectory" ? root.notions.main :
        null;
  notion.value =
    require('vm').runInNewContext(notion.code, makeContext(notion));
  if (typeof notion.value === "function") {
    notion.value(root);
  }
  return notion;
}

function evaluate (notion) {
  return notion;
}

function makeContext (notion) {
  return {
      _:            {}
    , assoc:        require('wisp/sequence.js').assoc
    , conj:         require('wisp/sequence.js').conj
    , isEqual:      require('wisp/runtime.js').isEqual
    , log:          function () { console.log.apply(console, arguments) }
    , require:      function () {}
    , setTimeout:   setTimeout
    , clearTimeout: clearTimeout
    , WebSocket:    WebSocket
    , XMLHttpRequest: XMLHttpRequest };
};
