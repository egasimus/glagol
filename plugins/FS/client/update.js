(function (App, node) {

  console.debug('updating FS:', node);

  node = node || {};
  console.info("FS read", node.type, node.path, node);

  var type =
    node.type === 'file'      ? 'Files'       :
    node.type === 'directory' ? 'Directories' :
    node.error                ? 'Errors'      :
    null;

  if (type === null) ;

  App.Model.FS[type].put(node.path, $.lib.model(node));

})
