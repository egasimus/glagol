(function (type, address) {

  address = (address || "").trim();

  if (!address) {

    console.info('adding', type, '(empty)');

    App.Model.Workspace.frames.push(require('riko-mvc/model')(
      { type:    type
      , address: null
      , status:  'empty' }))

  } else {

    console.info('adding', type, 'at', address);

    var index = App.Model.Workspace.frames().length;

    var frame = require('riko-mvc/model')(
      { type:    type
      , address: address
      , status:  'loading' })

    App.Model.Workspace.frames.put(index, frame);

    API('add', type, address);
    if (type === 'file' || type === 'directory') FS('read', address);

  }


})
