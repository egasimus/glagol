(function main () {

  var options = require('../../options.js');
  $.log(options);

  var tasks = require('../../tasks/index.js');
  console.log(tasks);
  return;

  var args = Array.prototype.slice.call(process.argv, 2)
    , bold = $.util.colors.bold
    , blue = $.util.colors.blue

  $.log(bold('environment:\n '),
    Object.keys(process.env).map(printEnv).join("\n  "));

  $.log(bold('arguments:\n '),
    process.argv.join("\n  "));

  $.log(bold('available tasks:\n '),
    Object.keys(tasks.nodes).map(printTask).join("\n  "));

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

})
