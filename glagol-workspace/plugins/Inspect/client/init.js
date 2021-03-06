(function (index, address) {

  return function () {
    App.model.frames.get(index).put('collapsed', $.lib.model([]))
    var socket = App.model.sockets[address].socket();
    socket.addEventListener('message', onmessage);
    socket.send('subscribe');
  }

  function onmessage (message) {
    if (message.data.indexOf('update%') === 0) {
      $.plugins.Workspace.update(index, JSON.parse(message.data.slice(7)))
    }
  };

  App.Workspace.registerFrameType('glagol', _.views.glagol);

})
