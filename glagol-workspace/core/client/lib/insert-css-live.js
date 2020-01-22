module.exports = function (style, pluginName) {

  var cssNode;

  insert();

  style.events.on('changed', function () {
    cssNode.parentElement.removeChild(cssNode);
    insert();
  });

  style.events.on('removed', function () {
    cssNode.parentElement.removeChild(cssNode);
  })

  function insert () {
    cssNode = _.insertCss(style());
    if (pluginName) cssNode.dataset.plugin = pluginName;
  }

}
