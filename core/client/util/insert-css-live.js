module.exports = function (style, pluginName) {

  var cssNode;

  insert();

  style.events.on('changed', function () {
    cssNode.parentElement.removeChild(cssNode);
    insert();
  });

  function insert () {
    cssNode = $.util.insertCss(style());
    if (pluginName) cssNode.dataset.plugin = pluginName;
  }

}
