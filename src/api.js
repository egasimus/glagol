(function (state, socket) {

  return function (message) {

    $.log("received:", message.data);

    if (message.data === 'hello') {
      socket.send('hi');
    }

    var url
      , root;

    if (message.data === 'subscribe') {
      url  = socket.upgradeReq.url;
      root = state.app.get(url);
      update();
    }

    if (message.data.indexOf('compile') === 0) {
      root.get(message.data.split(' ')[1].trim()).compiled;
      update();
    }

    if (message.data.indexOf('evaluate') === 0) {
      root.get(message.data.split(' ')[1].trim()).value;
      update();
    }

    function update () {
      socket.send('update%' + JSON.stringify(_.serialize(root)));
    }

  }

})
