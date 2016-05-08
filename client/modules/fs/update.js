(function (node) {

  console.info("FS read", node.type, node.path, node);

  if (node.type === 'file') {

    App.Model.FS.files.put(node.path, require('riko-mvc/model')(node))

  } else if (node.type === 'directory') {

    App.Model.FS.directories.put(node.path, require('riko-mvc/model')(node))

  }

})
