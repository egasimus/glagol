(function main () {

  var args = Array.prototype.slice.call(process.argv, 2);

  if (args.length === 0) {
    console.log(_.help);
    return;
  }

  var options = require('../../options.js')
    , tasks   = require('../../tasks/index.js')
    , bold    = $.util.colors.bold
    , blue    = $.util.colors.blue
    , red     = $.util.colors.red;

  $.log(bold('options:\n '),
    Object.keys(options).map($.util.printOption.bind(null, options)).join('\n  '));

  if (args[0] === 'tasks') {
    $.log(bold('available tasks:\n '),
      Object.keys(tasks.nodes).map(printTask).join("\n  "));
    return;
  }

  $.util.mkdir(options.pids);
  var state = require('glagol')(options.pids);

  if (args[0] === 'status') {
    var keys = Object.keys(state.nodes);
    $.log(bold('running jobs:\n '),
      keys.length > 0 ? keys.map(printJob).join("\n  ") : "(none)");
    return;
  }

  var path = require('path');

  if (args[0] === 'spawn') {
    var name = args[1];
    if (!name) {
      $.log("please specify a task name to start");
      return;
    }
    var task = tasks.get(name);
    if (!task) {
      $.log("can't spawn unknown task", red(name));
      return;
    }
    var id  = name + '.' + _.util.id()
      , dir = path.join.bind(null, options.pids, id)
    var taskData = task();
    taskData.source = task._sourcePath;
    $.log("spawning task", blue(id), '\n ',
      Object.keys(taskData).map(printTaskData).join('\n  '));
    $.util.mkdir(dir());
    var taskState = { id: id, task: taskData };
    $.util.write(dir('info'), taskState);
    return;
  }

  if (args[0] === 'kill') {
    var id = args[1];
    if (!id) {
      $.log("please specify a task id to kill");
      return;
    }
    var task = state.get(id);
    if (!id) {
      $.log("can't kill unknown task", red(id));
      return;
    }
    var taskData = task();
    $.log("killing task", blue(id), '\n ',
      Object.keys(JSON.parse(taskData.info)).map(printTaskData).join('\n '));
    require('rimraf').sync(path.join(options.pids, id));
    return;
  }

  return;

  var args = Array.prototype.slice.call(process.argv, 2)

  $.log(bold('environment:\n '),
    Object.keys(process.env).map(printEnv).join("\n  "));

  $.log(bold('arguments:\n '),
    process.argv.join("\n  "));

  $.log(bold('is starting with options:\n '),
    args.join("\n  "));

  args.forEach(parseOption);

  function parseOption (option) {
    $.task.start(tasks(), option);
  }

  function printEnv (key) {
    return blue(key) + ' ' + process.env[key];
  }

  function printTask (key) {
    var task = tasks.get(key)() || {};
    return blue(key) +
      ((task.name || task.description) ? ':' : '') + ' ' +
      (task.name || '') + ' ' + (task.description || '');
  }

  function printJob (key) {
    var job   = state.get(key)
      , procs = Object.keys(job.nodes).filter(isDir);
    return blue(key) + ' ' + JSON.parse(job().info).state +
      (procs ? '\n    ' : '') + procs.map(printProcess).join('\n    ');

    function isDir (node) {
      return job.nodes[node]._glagol.type === 'Directory';
    }

    function printProcess (id) {
      var proc = JSON.parse(job.nodes[id]().info);
      return blue(proc.id) + ' ' + proc.status;
    }
  }

  function printTaskData (key) {
    return blue(key) + ' ' + taskData[key];
  }

})
