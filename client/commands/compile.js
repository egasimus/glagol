(function (path, socket) {
  socket.send('compile ' + path);
})
