module.exports = function makeAPI (getCommands) {

  API.getCommands = getCommands;
  API.read = function (message) { return JSON.parse(message.data) };

  return API;

  function API (state) {
    return function (message) {
      var data     = API.read(message)
        , commands = API.getCommands(state)
        , command  = commands[data[0]];
      if (command) {
        command.apply(commands, data[1] || []);
      } else {
        throw new Error("riko-api2: no command " + data[0]);
      }
    }
  }

}
