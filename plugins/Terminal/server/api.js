module.exports = function (state, respond) {

  var api; return api =

  { Refresh:
      function () {
        respond(serialize({ plugin: 'Terminal', data: _.model() })); }

  , Spawn:
      function (id) {
        id = id || $.lib.makeId();
        var pty;
        _.model.Instances.put(id, pty = spawn());
        this['Terminal/Refresh']()
        return pty; }

  , Kill:
      function (id) {
        this['Terminal/Refresh']() }

  , Attach:
      function (id) {
        var pty;
        if (!(pty = _.model.Instances()[id]))
          pty = this['Terminal/Spawn'](id);
        if (!pty._glagolHandler) {
          pty.on('data', pty._glagolHandler = function (data) {
            _.log("!!!!!", state)
            // TODO update
          }) }
        this['Terminal/Refresh']() }

  , Detach:
      function (id) {
        var pty = _.model.Instances()[id];
        pty.off('data', pty._glagolHandler);
        delete pty._glagolHandler;
        this['Terminal/Refresh']() }

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
    , env: process.env })
}

function serialize (data) {
  return JSON.stringify(data);
}
