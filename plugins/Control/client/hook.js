module.exports = function DragHook (dragDirection) {

  var element  = null
    , knob     = null
    , initialY = null
    , minValue = -135
    , maxValue = 135
    , value    = 0

  return require('virtual-hook')({ hook: hook, unhook: unhook });
  
  function hook (el) {
    setTimeout(function () {
      element = el;
      knob = el.querySelector('.Knob');
      el.addEventListener('mousedown', start); }, 0) }

  function unhook (el) {
    el.removeEventListener('mousedown', start); }

  function start (event) {
    initialY = event.y;
    window.addEventListener('mousemove',  move);
    window.addEventListener('mouseup',    stop);
    window.addEventListener('mouseenter', stop); }

  function move (event) {
    var difference = initialY - event.y;
    initialY = event.y;
    value = Math.max(minValue, Math.min(maxValue, value + difference));
    knob.style.transform = 'rotate(' + value + 'deg)' }

  function stop (event) {
    window.removeEventListener('mousemove',  move);
    window.removeEventListener('mouseenter', stop);
    window.removeEventListener('mouseup',    stop); }

}
