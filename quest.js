var io = require('socket.io').listen(1337);
var db = require('mongoskin').db('localhost:27017/quest?auto_reconnect', {w: 1});

io.sockets.on('connection', function (socket) {

	var sendQuests = function (broadcast) {
		db.collection('quests').find().sort([['_id', -1]]).toArray(function(error, things){
			broadcast ? socket.broadcast.emit('quest:list', things) : socket.emit('quest:list', things);
		});		
	}

	var updateQuest = function (obj) {
		if(obj.heros.length){
			for (var i = 0; i < obj.heros.length; i++) {
				if(io.sockets.sockets[obj.heros[i]]){
					io.sockets.sockets[obj.heros[i]].emit('quest:update', obj);
				}
			};
		}
	};

	socket.on('quest:create', function(obj){
		db.collection('quests').insert({name: obj.name, heros: []}, null, function(error, obj){
			socket.emit('quest:create', obj[0]);
			sendQuests(true);
		});
	});

	//Join a quest
	socket.on('quest:join', function(obj){

		db.collection('quests').findById(obj.id, {}, function(error, obj){

			socket.set('currentQuest', obj._id, function () {

				obj.heros.push(socket.id);
				db.collection('quests').save(obj, null, function(){});

				socket.emit('quest:join', obj);

				updateQuest(obj);
			});
		});
	})

	//send a list of quests
	socket.on('quest:list', sendQuests)

	//sent a list of grails
	socket.on('grails:list', function(){
		db.collection('grails').find().toArray(function(error, grails){
			socket.emit('grails:list', grails);
		});		
	})

	//remove her on disconnect
	socket.on('disconnect',function(){

		//get the users current quest
		socket.get('currentQuest', function(err, quest_id){
			if(quest_id){

				//get the quest record from the DB
				db.collection('quests').findById(quest_id, {}, function(error, obj){
					
					if(error) console.log('bad error', error);
					
					else if(obj.heros){
						//pop off the leaving hero
						var index = obj.heros.indexOf(socket.id);
						obj.heros.splice(index,1);

						//Update other heros
						updateQuest(obj);

						//save the object
						db.collection('quests').save(obj, null, function(error){
							console.log('leaveSaveError', error);
						});
					}
	
				});
			}
		})
	});

});


