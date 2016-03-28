(function (state, connected) {
  state.socket = new WebSocket("ws://" + window.location.host);
  state.socket.onclose = function () {
    state.server = false
  };
  state.socket.onopen = function () {
    state.socket.send('riko');
    state.server = true;
  }

  // connection is also a promise-like, so it must be wrapped in an object
  connected.resolve({ connection: require('q-connection')(state.socket) })
})
