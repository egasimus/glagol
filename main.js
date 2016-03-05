(function (root, overrides) {

  root.events.on('changed', window.location.reload.bind(window.location));
  _.util.defaults(root);
  _.util.connect(root);
  _.util.initStyle(root);
  return _.util.initView(root);

})
