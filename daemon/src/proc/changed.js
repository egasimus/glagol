(function (node) {

  var blue = $.util.colors.blue;

  var proc = node.parent
    , info = JSON.parse(node());

  console.log(info);

  if (info.status === 'starting') {
    $.log('running command', blue(info.command));
    var child = require('child_process').execFile(info.command, died)
    info.status = 'started';
    info.pid = child.pid;
    $.util.write(node._sourcePath, info);
    return;
  }

  if (info.status === 'started') {
    return;
  }

  if (info.status === 'exited') {
    var msg = blue(info.command) + ' exited with code ' + blue(info.exitCode);
    if (info.exitSignal) msg += ' from signal ' + exitSignal;
    $.log(msg);
  }

  function died (error, stdout, stderr) {
    var info = JSON.parse(node());
    info.status = 'exited';
    info.exitCode = 0;
    if (error) {
      info.exitCode   = error.code;
      info.exitSignal = error.signal;
    }
    $.util.write(node._sourcePath, info);
  }

})
