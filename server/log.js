(function () {
  var args = Array.prototype.slice.call(arguments, 0);
  args.unshift(require('colors/safe').bold('glagol-file-manager:'));
  console.log.apply(console, args);
})
