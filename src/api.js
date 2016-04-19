(function (state, socket) {

  return function (message) {

    $.log("received:", message.data);

    if (message.data === 'hello') {
      socket.send('hi');
    }

    if (message.data === 'subscribe') {
      var url  = socket.upgradeReq.url;
      state.cwd = state.app.get(url);
      update();
    }

    if (message.data.indexOf('compile') === 0) {
      var path = message.data.split(' ')[1].trim().slice(1);
      console.log(state.cwd.get(path).compiled);
      update();
    }

    if (message.data.indexOf('evaluate') === 0) {
      var path = message.data.split(' ')[1].trim().slice(1);
      console.log(state.cwd.get(path).value);
      update();
    }

    function update () {
      socket.send('update%' + JSON.stringify(_.serialize(state.cwd)));
    }

  }

})
