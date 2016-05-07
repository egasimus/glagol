(function (node) {

  console.info("FS read", node.type, node.path, node);

  if (node.type === 'file') {

    App.model.files.put(node.path, require('riko-mvc/model')(node))

  } else if (node.type === 'directory') {

    App.model.directories.put(node.path, require('riko-mvc/model')(node))

  }

})
