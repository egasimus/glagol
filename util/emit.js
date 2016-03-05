(function emit (event) {

  if (! (event instanceof Function)) {
    console.error("won't be able to emit", event, "(not a function)")
    return function () {
      console.error("can't emit", event, "(not a function)");
    }
  }

  var args1 = Array.prototype.slice.call(arguments, 1);

  return function emitEvent () {
    var args2 = Array.prototype.slice.call(arguments, 0);
    event.apply(null, args1.concat(args2));
  }

})
