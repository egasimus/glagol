module.exports = function connectToAPI (socket) {

  API.socket    = socket;
  API.serialize = JSON.stringify;

  return API;

  function API (command) {
    var args = Array.prototype.slice.call(arguments, 1);
    socket.send(API.serialize([command, args]))
  }

}
