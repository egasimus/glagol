(function (state) {
  state.socket         = new WebSocket("ws://" + window.location.host);
  state.socket.onclose = function () { state.server = false };
  state.socket.onopen  = function () { state.server = true  };
  state.connection     = require('q-connection')(state.socket);
})
