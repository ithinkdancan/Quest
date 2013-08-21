var io = require('socket.io').listen(1337);
var db = require('mongoskin').db('localhost:27017/quest?auto_reconnect', {w: 1});

var quests = db.collection('quests');

io.sockets.on('connection', function (socket) {

	var sendQuests = function (broadcast) {
		quests.find({started:false}).sort([['_id', -1]]).toArray(function(error, things){
			if(error) console.log('error in sendQuests')
			broadcast ? socket.broadcast.emit('quest:list', things) : socket.emit('quest:list', things);
		});		
	}

	var removeDeadHeros = function (obj) {

		for (var i = 0; i < obj.heros.length; i++) {
			if(!io.sockets.sockets[obj.heros[i]]){
				quests.updateById(obj._id, {'$pull' : { heros: obj.heros[i]}}, function(){});
			}
		}

	}

	var updateQuest = function (obj) {

		removeDeadHeros(obj);

		quests.findById(obj._id, {}, function(error, obj){

			if(obj.heros.length){

				if(obj.heros.indexOf(obj.leader) < 0){
					obj.leader = obj.heros[0]
					quests.updateById(obj._id, {'$set' : { 'leader': obj.heros[0]}}, function(){});
				}

				for (var i = 0; i < obj.heros.length; i++) {

					if(io.sockets.sockets[obj.heros[i]]){
						io.sockets.sockets[obj.heros[i]].emit('quest:update', obj);
					}

					if(obj.heros[i] === obj.leader){
						console.log('found my leader')
						io.sockets.sockets[obj.heros[i]].emit('quest:lead', true);
					} 

				};
			} else {
				console.log('room is empty!')
			}
		})
	};

	//send a list of quests
	socket.on('quest:list', sendQuests)

	socket.on('quest:create', function(obj){
		quests.insert({
				name: obj.name, 
				heros: [], 
				leader: socket.id,
				started: false
			}, 
			null, 
			function(error, obj){
				socket.emit('quest:create', obj[0]);
				sendQuests(true);
			}
		);
	});

	//Join a quest
	socket.on('quest:join', function(obj){
		quests.findById(obj.id, {}, function(error, obj){
			socket.set('currentQuest', obj._id, function () {
				quests.update(obj, {'$push' : { heros: socket.id}}, function(){
					updateQuest(obj);
				});
				
			});
		});
	})

	socket.on('quest:start', function(){
		socket.get('currentQuest', function (error, quest_id) {
			quests.findById(quest_id, {}, function(error, obj){
				if(socket.id === obj.leader){
					quests.updateById(obj._id, {'$set' : { 'started': true}}, function(){
						updateQuest(obj);
					});
				}
			});
		});
	})



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
					
					if(obj.heros){

						//pop off the leaving hero
						quests.update(obj, {'$pull' : { heros: socket.id}}, function(){
							updateQuest(obj);
						});
						
					}
	
				});
			}
		})
	});

});


