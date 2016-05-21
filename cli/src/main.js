(function main () {

  var args = Array.prototype.slice.call(process.argv, 2);

  if (args.length === 0) {
    console.log(_.help);
    return;
  }

  var options = require('../../options.js')
    , tasks   = require('../../tasks/index.js')
    , bold    = $.util.colors.bold
    , blue    = $.util.colors.blue;

  $.log(bold('options:\n '), Object.keys(options).map(printOption).join('\n  '));

  if (args[0] === 'tasks') {
    $.log(bold('available tasks:\n '),
      Object.keys(tasks.nodes).map(printTask).join("\n  "));
    return;
  }

  var state = require('glagol')(options.pids);

  if (args[0] === 'status') {
    var keys = Object.keys(state.nodes);
    $.log(bold('running tasks:\n '),
      keys.length > 0 ? keys.map(printState).join("\n  ") : "(none)");
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

  function printOption (key) {
    return blue(key) + ' ' + options[key];
  }

  function printTask (key) {
    var task = tasks.get(key)() || {};
    return blue(key) +
      ((task.name || task.description) ? ':' : '') + ' ' +
      (task.name || '') + ' ' + (task.description || '');
  }

  function printState (key) {
    return blue(key) + ' ' + state.get(key);
  }

})
