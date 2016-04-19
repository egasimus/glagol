(function (command) {
  var args = Array.prototype.slice.call(arguments, 1);
  return function (event) {
    event.preventDefault();
    $.commands[command].apply(null,
      args.concat(Array.prototype.slice.call(arguments))); } })
