(function (state, socket) {

  return function (message) {

    $.log("received:", message.data);

    if (message.data === 'hello') {
      socket.send('hi');
    }

    if (message.data === 'subscribe') {
      socket.send('update%' + JSON.stringify(_.serialize(state.app)));
    }

  }

})
