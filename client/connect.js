(function (state, connected) {
  state.socket = new WebSocket("ws://" + window.location.host);
  state.socket.onclose = function () {
    state.server = false
  };
  state.socket.onopen = function () {
    state.socket.send('riko');
    state.server = true;
  }
  //state.socket.onmessage = function () {
    var connection = require('q-connection')(state.socket);
    connected.resolve({ connection: connection })
  //}
})
