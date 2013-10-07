
	var db = require('mongoskin').db(process.env.MONGOLAB_URI || 'localhost:27017/quest?auto_reconnect', {w: 1});
	
	var quests = db.collection('quests');
	var grails = db.collection('grails');

	var grailsObject = {};

	var champions = {};
	var arrayResults = [];


	//Get Top 5 Winners
	var topFive = function(){
		quests.find({'champion': {$ne : false} }).toArray(function(error, results){

			//tabulate the results
			results.forEach(function(e, i, a){
				if(e.champion){
					champions[e.champion] = champions[e.champion] ? champions[e.champion]+1 : 1;
				}
			});

			//sort the results
			for (o in champions){
				arrayResults.push({id:o, name: grailsObject[o], votes: champions[o]});
			}
			arrayResults = arrayResults.sort(function(a,b){ return b.votes - a.votes }).splice(0,5);

			console.log(arrayResults)

		});
	}
		

	grails.find().toArray(function(error, results){

		results.forEach(function(e){

			grailsObject[e._id] = e.name

		})

		topFive();

	});


