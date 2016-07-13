module.exports = function (style, moduleName) {

  var cssNode;

  insert();

  style.events.on('changed', function () {
    cssNode.parentElement.removeChild(cssNode);
    insert();
  });

  function insert () {
    cssNode = $.util.insertCss(style());
    if (moduleName) cssNode.dataset.module = moduleName;
  }

}
