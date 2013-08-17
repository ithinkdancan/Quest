var io = require('socket.io').listen(1337);

io.sockets.on('connection', function (socket) {
  socket.emit('news', [
      'Esmeralda!',
      'Daniel',
      'Kingsley',
      'Roxy'
    ]);
  socket.on('my other event', function (data) {
    console.log(data);
  });
});