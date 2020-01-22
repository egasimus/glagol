module.exports = function makeAPI (getCommands) {

  var API = function API () {

    var commands = API.getCommands.apply(null, arguments);

    return function (message) {
      var data    = API.read(message)
        , command = commands[data[0]];
      if (command) {
        command.apply(commands, data[1] || []);
      } else {
        throw new Error("riko-api2: no command " + data[0]);
      }
    }

  };

  API.getCommands = getCommands;

  API.read = function (message) { return JSON.parse(message.data) };

  return API;

}
