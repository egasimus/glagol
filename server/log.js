(function () {
  var args = Array.prototype.slice.call(arguments, 0);
  args.unshift(require('colors/safe').bold('supervisor'));
  console.log.apply(console, args);
})
