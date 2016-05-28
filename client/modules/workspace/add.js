(function (type, address) {

  address = (address || "").trim();

  if (!address) {

    console.info('adding', type, '(empty)');

    App.Model.Workspace.Frames.push($.lib.model(
      { type:    type
      , address: null
      , status:  'empty' }))

    App.Workspace('add', type);

  } else {

    console.info('adding', type, 'at', address);

    var index = App.Model.Workspace.Frames().length;

    var frame = require('riko-mvc/model')(
      { type:    type
      , address: address
      , status:  'loading' })

    App.Model.Workspace.Frames.put(index, frame);

    App.Workspace('add', type, address);
    if (type === 'file' || type === 'directory') App.FS('read', address);

  }

})
