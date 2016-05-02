module.exports = function makeAPI (commands) {

  API.commands = commands;

  return API;

  function API (state) {
    return function (message) {
      message = JSON.parse(message);
      return Promise(function (win, fail) {
        var command = API.commands[message[0]];
        if (API.commands[message[0]]) {
          win(command.apply(state, message[1] || []))
        } else {
          fail("no command " + message[0]);
        }
      })
    }
  }

}
