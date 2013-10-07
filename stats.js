
	var db = require('mongoskin').db(process.env.MONGOLAB_URI || 'localhost:27017/quest?auto_reconnect', {w: 1});
	
	var quests = db.collection('quests');
	var grails = db.collection('grails');

	var grailsObject = {};

	var champions = {};
	var votes = {};
	var arrayResults = [];
	var arrayVotesResults = [];


	//Get Top 5 Winners
	var topFive = function(){
		quests.find({'champion': {$ne : false} }).toArray(function(error, results){

			//tabulate the winner results
			results.forEach(function(e, i, a){
				
				if(e.champion){
					champions[e.champion] = champions[e.champion] ? champions[e.champion]+1 : 1;
				}

				if(e.votes){
					e.votes.forEach(function(e1){
						e1.forEach(function(e2){
							votes[e2] = votes[e2] ? votes[e2]+1 : 1;
						})
					})
				}
			});


			//sort the champion results
			for (o in champions){
				arrayResults.push({id:o, name: grailsObject[o], votes: champions[o]});
			}
			arrayResults = arrayResults.sort(function(a,b){ return b.votes - a.votes });

			//sort the votes results
			for (o in votes){
				arrayVotesResults.push({id:o, name: grailsObject[o], votes: votes[o]});
			}
			arrayVotesResults = arrayVotesResults.sort(function(a,b){ return b.votes - a.votes });

			console.log("\n\nGrails By Wins\n-----------");
			arrayResults.forEach(function(e){
				console.log(e.name + ': ' + e.votes);
			})

			console.log("\n\nGrails By Votes\n-----------");
			arrayVotesResults.forEach(function(e){
				console.log(e.name + ': ' + e.votes);
			})

			console.log("\n\n");

			// console.log(arrayResults);
			// console.log(arrayVotesResults)

			process.exit();

		});
	}

	var totalVotes = function () {
		quests.find({'champion': {$ne : false} }).toArray(function(error, results){

		})
	}
		

	grails.find().toArray(function(error, results){

		results.forEach(function(e){

			grailsObject[e._id] = e.name

		})

		topFive();

	});


