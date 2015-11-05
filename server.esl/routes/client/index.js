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
  try {
    var parsed = JSON.parse(data);
    document.body.innerText = JSON.stringify(parsed.ice);
    require('require-like').install(parsed.deps.deps, parsed.bundle);
    var app = require('glagol-cryo/lib/thaw')(parsed.ice)
      , root = app.tree();
    console.log(app);
    root.main(app, conn);
  } catch (e) {
    error(e);
  }
}

function error (err) {
  console.error(err.message);
  console.log(err.stack)
}
