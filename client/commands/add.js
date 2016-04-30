(function (type, address) {

  address = (address || "").trim();

  if (!address) {

    console.info('adding', type, '(empty)');

    App.model.frames.push(require('riko-mvc/model')(
      { type:    type
      , address: null
      , status:  'empty' }))

  } else {

    console.info('adding', type, 'at', address);

    var index = App.model.frames().length;

    var frame = require('riko-mvc/model')(
      { type:    type
      , address: address
      , status:  'loading' })

    App.model.frames.put(index, frame);

    API('add', type, address).done(
      function () {
        if (type === 'glagol') {
          $.commands.connect(address).then($.commands.initGlagol(index, address));
        } },
      function (err) {
        var msg = 'could not add ' + type + ' at ' + address;
        console.error(msg, 'because:', err);
        err.message = msg;
        App.model.frames.get(index).put('error', err)
      });

  }


})
