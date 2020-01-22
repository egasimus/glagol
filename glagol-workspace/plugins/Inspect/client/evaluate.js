(function (path, socket) {
  socket.send('evaluate ' + path);
})
