(function (state) {
  state.socket = new WebSocket("ws://" + window.location.host);
  state.socket.onclose = function () { state.server = false };
  state.socket.onopen = function () {
    state.socket.send('riko');
    state.socket.onmessage = function () {
      state.socket.onmessage = null;
      state.server = true;
      state.connection = require('q-connection')(state.socket);
    }
  };
})
