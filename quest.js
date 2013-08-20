var io = require('socket.io').listen(1337);
var db = require('mongoskin').db('localhost:27017/quest?auto_reconnect', {w: 1});

var quests = db.collection('quests');

io.sockets.on('connection', function (socket) {

	var sendQuests = function (broadcast) {
		quests.find().sort([['_id', -1]]).toArray(function(error, things){
			broadcast ? socket.broadcast.emit('quest:list', things) : socket.emit('quest:list', things);
		});		
	}

	var updateQuest = function (id) {
		quests.findById(id, {}, function(error, obj){
			if(obj.heros.length){
				for (var i = 0; i < obj.heros.length; i++) {
					if(io.sockets.sockets[obj.heros[i]]){
						io.sockets.sockets[obj.heros[i]].emit('quest:update', obj);
					} else {
						quests.update(obj, {'$pull' : { heros: obj.heros[i]}}, function(){});
					}
				};
			}
		})
	};

	socket.on('quest:create', function(obj){
		quests.insert({name: obj.name, heros: [], leader: socket.id}, null, function(error, obj){
			socket.emit('quest:create', obj[0]);
			sendQuests(true);
		});
	});

	//Join a quest
	socket.on('quest:join', function(obj){
		quests.findById(obj.id, {}, function(error, obj){
			socket.set('currentQuest', obj._id, function () {
				quests.update(obj, {'$push' : { heros: socket.id}}, function(){
					updateQuest(obj._id);
				});
				
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
				quests.findById(quest_id, {}, function(error, obj){
					
					if(error) console.log('bad error', error);
					
					else if(obj.heros){

						//pop off the leaving hero
						quests.update(obj, {'$pull' : { heros: socket.id}}, function(){

							if(!io.sockets.sockets[obj.leader] && obj.heros[0]){
								console.log('setting new leader', obj.heros[0]);
								quests.update(obj, {'$set' : { 'leader': obj.heros[0]}}, function(error){
									console.log('update errrrrrror', error)
								});
							} else {
								quests.update(obj, {'$set' : { 'leader': ''}}, function(){});
							}

							updateQuest(obj._id);

						});
						
					}
	
				});
			}
		})
	});

});


