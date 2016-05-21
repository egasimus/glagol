(function (node) {

  if (node._glagol.type !== 'File') return;

  var path = require('path')
    , fs   = require('fs');

  var task = JSON.parse(node());
  console.log('added', node._sourcePath);
  if (task.state === 'spawning') {
    if (!task.task) {
      $.log("can't spawn", task.id, ": no task data")
    } else {
      (task.task.commands || []).forEach(spawnCommand.bind(null, task));
      task.state = 'alive';
      //fs.writeFileSync(node._sourcePath, JSON.stringify(task), 'utf8');
    }
    return;
  }

  return;

  function spawnCommand (task, executable) {
    var id = path.basename(executable) + '.' + $.util.id();
    $.log('spawning', executable, 'for', task.id, 'as', id)
  }

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
