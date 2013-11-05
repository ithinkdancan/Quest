'use strict';

var http = require('http'),
	nstatic = require('node-static'),
	io = require('socket.io').listen(1337),
	folder = new(nstatic.Server)('./app'),
	qs = require('./QuestService');

//reduce Socket.IO logging
io.set('log level', 1);

http.createServer(function (req, res) {
	folder.serve(req, res);
}).listen(8080);

	// var quests = db.collection('quests');

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

};

io.sockets.on('connection', function (socket) {

	var sendQuests = function (broadcast) {
		
		qs.getQuests(function(error, things){
			broadcast ? socket.broadcast.emit('quest:list', things) : socket.emit('quest:list', things);
		});
	
	};

	var removeDeadHeros = function (obj) {
		//console.log('some obj', obj);
		for (var i = 0; i < obj.heros.length; i++) {
			if(!io.sockets.sockets[obj.heros[i]]){
				qs.removeHero(obj._id, obj.heros[i], function(){});
			}
		}

	};

	var updateQuest = function (obj) {

		removeDeadHeros(obj);

		qs.getQuest(obj._id, function(error, obj){

			if(obj.heros.length){

				if(obj.heros.indexOf(obj.leader) < 0){
					obj.leader = obj.heros[0];
					qs.setLeader(obj._id, obj.heros[0], function(){});
				}

				for (var i = 0; i < obj.heros.length; i++) {

					if(io.sockets.sockets[obj.heros[i]]){
						io.sockets.sockets[obj.heros[i]].emit('quest:update', obj);
					}

					if(obj.heros[i] === obj.leader){
						io.sockets.sockets[obj.heros[i]].emit('quest:lead', true);
					}

				}

			} else {
				console.log('room is empty!');
			}
		});

	};

	var champion = function (quest, grail_id) {

		qs.getGrail(grail_id, function (error, grail) {
			
			qs.setChampion(quest._id, grail._id, function(){});
			qs.updateGrailWins(grail._id, function(){});

			for (var i = 0; i < quest.heros.length; i++) {
				io.sockets.sockets[quest.heros[i]].emit('quest:complete', grail);
			}
		});
		

	};

	var fight = function (quest_id) {

		var results = {};
		var arrayResults = [];
		var id;

		qs.getQuest(quest_id, function(error, obj){
			for (var i = 0; i < obj.votes.length; i++) {
				for (var j = 0; j < obj.votes[i].length; j++) {
					id = obj.votes[i][j];
					results[id] = results[id] ? results[id]+1 : 1;
				}
			}

			//store the votes in a sortable format
			for (var o in results){
				arrayResults.push({id:o, votes: results[o]});
				qs.updateGrailVotes(o, results[o], function(){});
			}

			var sortedResults = arrayResults.sort(function(a,b){ return b.votes - a.votes; });

			var grail = sortedResults[0];

			champion(obj, grail.id);

		});

	};

	//send a list of quests
	socket.on('quest:list', sendQuests);

	socket.on('quest:create', function(newQuest){
		qs.createQuest(newQuest, socket.id, function(error, obj){
			socket.emit('quest:create', obj[0]);
			sendQuests(true);
		});
	});

	//Join a quest
	socket.on('quest:join', function(obj){
		qs.getQuest(obj.id, function(error, obj){

			if(obj.started){
				socket.emit('quest:leave');
			} else {
				socket.set('currentQuest', obj._id, function () {
					qs.addHero(obj._id, socket.id, function(){
						updateQuest(obj);
						sendQuests(true);
					});
				});
			}
		});
	});

	//Start a Quest
	socket.on('quest:start', function(){
		socket.get('currentQuest', function (error, quest_id) {
			qs.getQuest(quest_id, function(error, obj){
				if(socket.id === obj.leader){
					qs.startQuest(obj._id,function(){
						updateQuest(obj);
						sendQuests(true);
					});
				}
			});
		});
	});

	//Save Quest Selections
	socket.on('quest:save', function (votes) {
		socket.get('currentQuest', function (error, quest_id) {
			qs.getQuest(quest_id, function(error, obj){
				qs.saveVotes(obj._id, votes, function(){});
				if(obj.votes.length+1 >= obj.heros.length){
					fight(obj._id);
				}
			});
		});
	});

	//Leave a quest
	socket.on('quest:leave', function(){
		socket.get('currentQuest', function (error, quest_id) {
			if(quest_id){
				qs.removeHero(quest_id, socket.id, function(){
					sendQuests(true);
				});
			}
		});
	});

	//sent a list of grails
	socket.on('grails:list', function(){
		//get the top voted grails
		qs.getGrails(function(error, grails){
			socket.emit('grails:list', getRandomSubarray(grails,20,5));
		});
				
	});

	//remove her on disconnect
	socket.on('disconnect',function(){

		//get the users current quest
		socket.get('currentQuest', function(err, quest_id){
			if(quest_id){

				//get the quest record from the DB
				qs.getQuest(quest_id, function(error, obj){
					
					if(obj.heros){
						
						//pop off the leaving hero
						qs.removeHero(obj._id, socket.id, function(){
							updateQuest(obj);
							sendQuests(true);
						});
						
					}
	
				});

			}
		});
	});

});


