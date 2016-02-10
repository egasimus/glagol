(function () {
  var x = setTimeout(function tick () {
    _.tick();
    x = setTimeout(tick, _.delay);
  });
  return function stop () {
    clearTimeout(x);
  };
})
