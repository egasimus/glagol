module.exports = function connectToAPI (socket) {

  API.socket = socket;
  API.write = function (command, args) { return JSON.stringify([command, args]) };

  return API;

  function API (command) {
    var args = Array.prototype.slice.call(arguments, 1);
    socket.send(API.write(command, args))
  }

}
