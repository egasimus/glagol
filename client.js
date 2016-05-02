module.exports = function connectToAPI (socket) {

  socket.onmessage = function () {
    if (API.onmessage) API.onmessage.apply(socket, arguments);
  }

  return API;

  function API (command) {
    var args = Array.prototype.slice.call(arguments, 1);
    socket.send(JSON.serialize([command, args]))
  }

}
