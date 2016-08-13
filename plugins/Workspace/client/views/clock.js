module.exports = function () {
  return h('button.Taskbar_Clock', { hook: ClockHook() }); }

function ClockHook () {
  var frame = null;
  return $.lib.hook(hook, unhook);
  function hook (element) {
    frame = requestAnimationFrame(function render () {
      element.innerHTML = getClockValue();
      frame = requestAnimationFrame(render); }) }
  function unhook (element) {
    cancelAnimationFrame(frame); } }

function getClockValue () {
  var now = new Date()
  return '' +
    '<strong>' + now.getFullYear()   +
    '-'    + pad(now.getMonth(), 2) +
    '-'    + pad(now.getDate(), 2) +
    '</strong>'                   +
    '<br>' + pad(now.getHours(), 2) +
    ':'    + pad(now.getMinutes(), 2) +
    ':'    + pad(now.getSeconds(),   2) +
    '.'    + pad(now.getMilliseconds(), 3) }

function pad (value, n) {
  var length  = Math.max((n || 1) - String(value).length, 0)
    , padding = '';
  while (length--) padding += '0';
  return padding + value; }
