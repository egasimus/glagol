module.exports = function ScrollHook () {
  return require('virtual-hook')({ hook: function (node) {

    if (node._scrollHook) {
      shadows();
      return;
    }

    var scrollbarTimer = null;

    node._scrollHook = true;
    node.style.overflow = 'hidden';
    node.addEventListener('wheel', onwheel);
    shadows();

    function onwheel (event) {
      node.scrollTop += 2 * 21 * (event.deltaY > 0 ? 1 : -1);
      shadows();
      showScrollbar();
    }

    function shadows () {
      var scrollMax = node.scrollHeight - node.clientHeight;
      node.classList.toggle('ScrollShadow_Above', node.scrollTop > 0);
      node.classList.toggle('ScrollShadow_Below', node.scrollTop < scrollMax);
    }

    function showScrollbar () {
      if (scrollbarTimer) scrollbarTimer = clearTimeout(scrollbarTimer);
      scrollbarTimer = setTimeout(hideScrollbar, 1000);
    }

    function hideScrollbar () {}

  }})
}
