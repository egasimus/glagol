(function (node) {

  if (node._glagol.type !== 'File') return;

  var path = require('path')
    , fs   = require('fs');

  var data = JSON.parse(node());
  console.log('added', node._sourcePath);
  if (data.state === 'spawning') {
    // TODO: kill preexisting processes
    data.state = 'alive';
    fs.writeFileSync(node._sourcePath, JSON.stringify(data), 'utf8');
    return;
  }

  return;

  var task = tasks[taskName]
    , exec = require('child_process').execFile;

  $.log("starting", taskName, "\n" + JSON.stringify(task))

  var commands = task.commands || [];

  commands.forEach(spawn);

  function spawn (executable) {
    $.log("spawning", executable);
    var proc = exec(executable, died.bind(null, executable));
    proc.stdout.on('data', function (data) { process.stdout.write(data) })
    proc.stderr.on('data', function (data) { process.stderr.write(data) })
  }

  function died (executable, error, stdout, stderr) {
    if (error) {
      $.log(executable, 'died with code', error.code, 'from signal', error.signal);
    }
  }

})
