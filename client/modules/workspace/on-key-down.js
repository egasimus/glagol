(function (event) {

  console.log(event);

  var keys = _.keys;

  if (event.superKey) keys = keys.Super || {};
  if (event.ctrlKey)  keys = keys.Ctrl  || {};
  if (event.altKey)   keys = keys.Alt   || {};
  if (event.shiftKey) keys = keys.Shift || {};

  if (keys[event.code]) {
    event.preventDefault();
    keys[event.code]();
  }

})
