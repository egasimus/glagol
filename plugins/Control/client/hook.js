module.exports = function DragHook (dragDirection) {

  var initial = null;

  return require('virtual-hook')({ hook: hook, unhook: unhook });
  
  function hook (el) {
    el.addEventListener('mousedown', start); }

  function unhook (el) {
    el.removeEventListener('mousedown', start); }

  function start (event) {
    initial = event.y;
    window.addEventListener('mousemove',  move);
    window.addEventListener('mouseup',    stop);
    window.addEventListener('mouseenter', stop); }

  function move (event) {
    console.log(initial - event.y); }

  function stop (event) {
    window.removeEventListener('mousemove',  move);
    window.removeEventListener('mouseenter', stop);
    window.removeEventListener('mouseup',    stop); }

}
