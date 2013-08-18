var io = require('socket.io').listen(1337);
var db = require('mongoskin').db('localhost:27017/quest', {w: 1});





io.sockets.on('connection', function (socket) {

	var sendQuests = function (broadcast) {
		db.collection('quests').find().sort([['_id', -1]]).toArray(function(error, things){
			broadcast ? socket.broadcast.emit('quest:list', things) : socket.emit('quest:list', things);
		});		
	}

	socket.on('quest:create', function(obj){
		db.collection('quests').insert({name: obj.name}, null, function(error, obj){
			socket.emit('quest:create', obj[0]);
			sendQuests(true);
		});
	});

	socket.on('quest:join', function(obj){
		db.collection('quests').findById(obj.id, {}, function(error, obj){
			socket.set('currentQuest', obj.name, function () {
				socket.emit('quest:join', obj);
			});
		});
	})

	socket.on('quest:list', sendQuests)

});


