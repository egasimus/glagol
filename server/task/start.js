(function (tasks, taskName) {

  var task = tasks[taskName]
    , blue = $.util.colors.blue
    , exec = require('child_process').execFile;

  $.log("starting", blue(taskName), "\n" + JSON.stringify(task))

  var processes = task.processes || [];

  processes.forEach(spawn);

  function spawn (executable) {
    $.log("spawning", blue(executable));
    var proc = exec(executable, died.bind(null, executable));
    proc.stdout.on('data', function (data) { process.stdout.write(data) })
    proc.stderr.on('data', function (data) { process.stderr.write(data) })
  }

  function died (executable, error, stdout, stderr) {
    if (error) {
      $.log(blue(executable), 'died with code', error.code, 'from signal', error.signal);
    }
  }

})
