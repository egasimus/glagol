(function (App, node) {

  console.info("FS read", node.type, node.path, node);

  var type = node.type === 'file'      ? 'Files'
           : node.type === 'directory' ? 'Directories'
           : null;

  if (type === null) throw Error('unknown type: ' + node.type);

  App.Model.FS[type].put(node.path, $.lib.model(node));

})
