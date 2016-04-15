(function disconnect (address) {
  return new Promise(function (win) {
    var sockets = App.model.sockets
      , status  = sockets[address].status
      , socket  = sockets[address].socket;
    status.set('disconnecting');
    socket().onclose = function () {
      status.set('disconnected');
      win(address); }
    socket().close(); }); })
