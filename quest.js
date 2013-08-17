var io = require('socket.io').listen(1337);
var db = require('mongoskin').db('localhost:27017/quest');

io.sockets.on('connection', function (socket) {
  
	socket.on('getThings', function (data) {

		db.collection('awesomeThings').find().toArray(function(error, things){
			socket.emit('news', things);
		})

  	});
});


