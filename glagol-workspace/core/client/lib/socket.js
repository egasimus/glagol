(function (address) {
  return new Promise(
    function (win, fail) {
      var socket = new WebSocket(address);
      socket.onerror = fail.bind(null, 'could not connect to' + address);
      socket.onopen = function () {
        socket.onerror = null;
        win(socket);
      } }) })
