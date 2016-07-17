module.exports = function ScrollHook () {

  return require('virtual-hook')({ hook: function (outer) {

    setTimeout(installScrollbars, 0);

    var inner;

    function installScrollbars () {

      inner = outer.firstChild;

      if (outer._scrollHook) {
        shadows();
        return;
      }

      var scrollbarTimer = null;

      outer._scrollHook = true;
      inner.style.overflow = 'hidden';
      inner.addEventListener('wheel', onwheel);
      shadows();

      function onwheel (event) {
        inner.scrollTop += 2 * 21 * (event.deltaY > 0 ? 1 : -1);
        shadows();
        showScrollbar();
      }

      function shadows () {
        var scrollMax = inner.scrollHeight - inner.clientHeight;
        outer.classList.add('ScrollShadow')
        outer.classList.toggle('ScrollShadow_Above', inner.scrollTop > 0);
        outer.classList.toggle('ScrollShadow_Below', inner.scrollTop < scrollMax);
      }

      function showScrollbar () {
        if (scrollbarTimer) scrollbarTimer = clearTimeout(scrollbarTimer);
        scrollbarTimer = setTimeout(hideScrollbar, 1000);
      }

      function hideScrollbar () {}
    }

  }})

}
