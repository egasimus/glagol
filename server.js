module.exports = function makeAPI (getCommands) {

  API.getCommands = getCommands;
  API.parse       = JSON.parse;

  return API;

  function API (state) {
    return function (message) {
      message = API.parse(message);
      return Promise(function (win, fail) {
        var commands = API.getCommands(state)
          , command  = commands[message[0]];
        if (command) {
          win(command.apply(commands, message[1] || []))
        } else {
          fail("no command " + message[0]);
        }
      })
    }
  }

}
