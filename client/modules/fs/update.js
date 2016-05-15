(function (node) {

  console.info("FS read", node.type, node.path, node);

  var type = node.type === 'file'      ? 'files'
           : node.type === 'directory' ? 'directories'
           : null;

  if (type === null) throw Error('unknown type: ' + node.type);

  App.Model.FS[type].put(node.path, $.lib.model(node));

})
