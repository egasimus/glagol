module.exports = function (state, respond) {

  return {

    Spawn:
      function () {},

    Kill:
      function () {},

    Attach:
      function (id) {
        id = id || $.lib.makeId();
        var pty = _.model.Instances()[id];
        if (!pty) _.model.Instances.put(id, pty = spawn());
        if (!pty._glagolHandler) {
          pty.on('data', pty._glagolHandler = function (data) {
            // TODO update
          })
        }
      },

    Detach:
      function (id) {
        var pty = _.model.Instances()[id];
        pty.off('data', pty._glagolHandler);
      }

  }

}

function spawn () {
  return require('pty.js').spawn(
    process.platform === 'win32' ? 'cmd.exe' : 'bash',
    [],
    { name: 'xterm-256color'
    , cols: 80
    , rows: 24
    , cwd: process.env.PWD
    , env: process.env }) }
