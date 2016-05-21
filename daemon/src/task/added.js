(function (node) {

  console.log(node.source)

  return;

  var task = tasks[taskName]
    , exec = require('child_process').execFile;

  $.log("starting", taskName, "\n" + JSON.stringify(task))

  var processes = task.processes || [];

  processes.forEach(spawn);

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
