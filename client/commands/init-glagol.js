(function (index, address) {

  return function () {
    console.log(App.model(), address);
    var socket = App.model.sockets[address].socket();
    socket.addEventListener('message', onmessage);
    socket.send('subscribe');
  }

  function onmessage (message) {
    if (message.data.indexOf('update%') === 0) {
      $.commands.updateSession(index, JSON.parse(message.data.slice(7)))
    }
  };

})
