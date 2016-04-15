(function (state, socket) {

  return function (message) {

    $.log("received:", message.data);

    if (message.data === 'hello') {
      socket.send('hi');
    }

  }

})
