var exec = require('child_process').execFileSync

var serialize = JSON.stringify;

module.exports = function (state, respond) {

  return {

    Refresh:
      function () {
        respond(serialize({ plugin: 'Service', data: _.model() }));
      },

    GetSystemServices:
      function () {
        _.model.put('System', String(exec('systemctl', ['status'])));
        this['Service/Refresh']();
      },

    GetUserServices:
      function () {
        _.model.put('User', String(exec('systemctl', ['status', '--user'])));
        this['Service/Refresh']();
      }

  }

}
