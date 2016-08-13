module.exports = function () {
  return h('button.Taskbar_Clock', { hook: ClockHook() });
}

function ClockHook () {

  var frame = null;

  return require('virtual-hook')({ hook: hook, unhook: unhook });

  function hook (element) {
    frame = requestAnimationFrame(function render () {
      element.innerHTML = getClockValue();
      frame = requestAnimationFrame(render);
    })
  }

  function unhook (element) {
    cancelAnimationFrame(frame);
  }

}

function getClockValue () {
  var now = new Date()
  return now.getYear()       +
    '-' + pad(now.getMonth()) +
    '-' + pad(now.getDate())  +
    '<br>' + pad(now.getHours()) +
    ':' + pad(now.getMinutes()) +
    ':' + pad(now.getSeconds()) +
    '.' + pad(now.getMilliseconds(), 3)
}

function pad (value, n) {
  var length  = Math.max((n || 1) - String(value).length, 0)
    , padding = '';
  while (length--) padding += '0';
  return padding + value;
}
