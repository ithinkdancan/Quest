
var db = require('mongoskin').db('localhost:27017/quest?auto_reconnect', {w: 1})

exports.getQuests = function(callback){
	db.collection('quests').find({started:false}).sort([['_id', -1]]).toArray(callback);	
};

exports.getQuest = function(id, callback) {
	db.collection('quests').findById(id, {}, callback);
};

exports.createQuest = function (obj, leader, callback) {
	db.collection('quests').insert({
		name: obj.name, 
		heros: [],
		leader: leader,
		started: false,
		votes: [],
		champion: false
		}, 
		null, 
		callback
	);
}

exports.addHero = function(id, hero, callback) {
	db.collection('quests').update({_id:id}, {'$push' : { heros: hero}}, callback);
};

exports.removeHero = function (id, hero, callback) {
	db.collection('quests').update({_id:id}, {'$pull' : { heros: hero}}, callback);
};

exports.setLeader = function (id, leader, callback) {
	db.collection('quests').update({_id:id}, {'$set' : { 'leader': leader}}, callback);
};

exports.startQuest = function (id, callback) {
	db.collection('quests').update({_id:id}, {'$set' : { 'started': true}}, callback);
}

exports.saveVotes = function (id, votes, callback) {
	db.collection('quests').update({_id:id}, {'$push' : { votes: votes }}, callback);
}

exports.setChampion = function (id, grail_id, callback) {
	db.collection('quests').update({_id:id}, {'$set' : { 'champion': grail_id}}, callback);
}

exports.getGrails = function (callback) {
	db.collection('grails').find().sort({wins:-1,votes:-1}).skip(2).limit(30).toArray(function(error, grailsTop){
		db.collection('grails').find().sort({votes:1}).limit(5).toArray(function(error, grailsBottom){
			callback(error, grailsTop.concat(grailsBottom));
		});
	});
}

exports.getGrail = function (id, callback) {
	db.collection('grails').findById(id, {}, callback);
}

exports.updateGrailVotes = function (id, votes, callback){
	db.collection('grails').update({_id:id}, {'$inc' : { 'votes' : votes}}, callback);
}

exports.updateGrailWins = function (id, callback){
	db.collection('grails').update({_id:id}, {'$inc' : { 'wins' : 1}}, callback);
}


