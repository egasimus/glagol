(function (type, address) {

  address = (address || "").trim();

  if (!address) {

    console.debug('adding', type, '(empty)');

    App.model.frames.push(require('riko-mvc/model')(
      { type:    type
      , status:  'empty' }))

  } else {

    var fragments = (address || "").trim().split(':').length;
    address =
      fragments === 3
      ? address
      : fragments === 2
        ? ('ws://' + address)
        : fragments === 1
          ? ('ws://localhost:' + address)
          : null;
    if (!address) throw Error('address must be: [[ws://]<HOST>]<PORT>');

    console.debug('adding', type, 'at', address);

    var index = App.model.frames().length;

    var frame = require('riko-mvc/model')(
      { type:    type
      , address: address
      , status:  'loading' })

    App.model.frames.put(index, frame);

    API('add', type, address).done(function () {
      console.log("->", frame)
      if (type === 'glagol') {
        $.commands.connect(address).then(function () {
          var socket = App.model.sockets[address].socket();
          socket.addEventListener('message', function (message) {
            if (message.data.indexOf('update%') === 0)
              $.commands.updateSession(
                index, JSON.parse(message.data.slice(7))) });
          socket.send('subscribe'); }) } });

  }


})
