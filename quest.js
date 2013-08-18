var io = require('socket.io').listen(1337);
var db = require('mongoskin').db('localhost:27017/quest', {w: 1});





io.sockets.on('connection', function (socket) {

	var sendRooms = function (broadcast) {
		db.collection('rooms').find().sort([['_id', -1]]).toArray(function(error, things){
			broadcast ? socket.broadcast.emit('room:list', things) : socket.emit('room:list', things);
		});		
	}

	socket.on('room:create', function(obj){
		db.collection('rooms').insert({name: obj.name}, null, function(error, obj){
			socket.emit('room:create', obj[0]);
			sendRooms(true);
		});
	});

	socket.on('room:join', function(obj){
		db.collection('rooms').findById(obj.id, {}, function(error, obj){
			socket.set('currentRoom', obj.name, function () {
				socket.emit('room:join', obj);
			});
		});
	})

	socket.on('room:list', sendRooms)

});


