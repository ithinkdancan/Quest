var http = require("http"),
	static = require('node-static'),
	io = require('socket.io').listen(1337),
	db = require('mongoskin').db(process.env.MONGOLAB_URI || 'localhost:27017/quest?auto_reconnect', {w: 1}),
	folder = new(static.Server)('./app');

//reduce Socket.IO logging
io.set('log level', 1);

http.createServer(function (req, res) {
    folder.serve(req, res);
}).listen(8080);

var quests = db.collection('quests');

    var getRandomSubarray = function (arr, size, groupSize) {
	    var shuffled = arr.slice(0), i = arr.length, temp, index;
	    var grouped = [];
	    
	    while (i--) {
	        index = Math.floor(i * Math.random());
	        temp = shuffled[index];
	        shuffled[index] = shuffled[i];
	        shuffled[i] = temp;
	    }
	    
	    shuffled = shuffled.slice(0, size);


	   while(shuffled.length){
	   	 grouped.push(shuffled.splice(0, groupSize)); 
	   }

	   return grouped;

	}

io.sockets.on('connection', function (socket) {

	var sendQuests = function (broadcast) {
		quests.find({started:false}).sort([['_id', -1]]).toArray(function(error, things){
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
						io.sockets.sockets[obj.heros[i]].emit('quest:lead', true);
					} 

				};
			} else {
				console.log('room is empty!')
			}
		})	
	};

	var champion = function (quest, grail_id) {

		db.collection('grails').findById(grail_id, {}, function (error, grail) {
			quests.updateById(quest._id, {'$set' : { 'champion': grail._id}}, function(){});
			db.collection('grails').updateById(grail._id, {'$inc' : { 'wins' : 1}}, function(){});
			for (var i = 0; i < quest.heros.length; i++) {
				io.sockets.sockets[quest.heros[i]].emit('quest:complete', grail);
			}
		})

	}

	var fight = function (quest_id) {

		var results = {};
		var arrayResults = []
		var id;

		quests.findById(quest_id, {}, function(error, obj){
			for (var i = 0; i < obj.votes.length; i++) {
				for (var j = 0; j < obj.votes[i].length; j++) {
					id = obj.votes[i][j];
					results[id] = results[id] ? results[id]+1 : 1;
				};
			};

		//store the votes in a sortable format
		for (o in results){
			arrayResults.push({id:o, votes: results[o]});

			db.collection('grails').updateById(o, {'$inc' : { 'votes' : results[o]}}, function(error){
				if(error) { console.log('Error Incrementing Grail Votes'); }
			});
		}

		var grail = arrayResults.sort(function(a,b){ return b.votes - a.votes })[0];

		champion(obj, grail.id)

		});

		
	};

	//send a list of quests
	socket.on('quest:list', sendQuests)

	socket.on('quest:create', function(obj){
		quests.insert({
				name: obj.name, 
				heros: [], 
				leader: socket.id,
				started: false,
				votes: [],
				champion: false
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
			if(obj.started){
				socket.emit('quest:leave');
			} else {
				socket.set('currentQuest', obj._id, function () {
					quests.update(obj, {'$push' : { heros: socket.id}}, function(){
						updateQuest(obj);
						sendQuests(true);
					});
					
				});
			}
				
		});
	})

	socket.on('quest:start', function(){
		socket.get('currentQuest', function (error, quest_id) {
			quests.findById(quest_id, {}, function(error, obj){
				if(socket.id === obj.leader){
					quests.updateById(obj._id, {'$set' : { 'started': true}}, function(){
						updateQuest(obj);
						sendQuests(true);
					});
				}
			});
		});
	})

	socket.on('quest:save', function (votes) {
		socket.get('currentQuest', function (error, quest_id) {
			quests.findById(quest_id, {}, function(error, obj){

				quests.update(obj, {'$push' : { votes: votes }}, function(){});

				if(obj.votes.length+1 >= obj.heros.length){
					fight(obj._id);
				}

			});
			

		});
	});

	socket.on('quest:leave', function(){
		socket.get('currentQuest', function (error, quest_id) {
			if(quest_id){
				quests.updateById(quest_id, {'$pull' : { heros: socket.id}}, function(){
					sendQuests(true);
				});
			}
		})
	})

	//sent a list of grails
	socket.on('grails:list', function(){
		db.collection('grails').find().toArray(function(error, grails){
			socket.emit('grails:list', getRandomSubarray(grails,25,5));
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
							sendQuests(true);
						});
						
					}
	
				});
			}
		})
	});

});


