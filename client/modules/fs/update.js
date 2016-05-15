(function (node) {

  console.info("FS read", node.type, node.path, node);

  if (node.type === 'file') {

    App.Model.FS.files.put(node.path, $.lib.model(node))

  } else if (node.type === 'directory') {

    App.Model.FS.directories.put(node.path, $.lib.model(node))

  }

})
