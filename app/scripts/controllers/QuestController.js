'use strict';

angular.module('questApp')
  .controller('Quest', function ($scope, $stateParams, socket, QuestService) {

    $scope.quest_id = $stateParams.id;
    $scope.quest = QuestService.get('quest:join', {id:$scope.quest_id});
    $scope.lead = QuestService.get('quest:lead');
    // $scope.grails = QuestService.get('grails:list').then(function(obj){
    // 	return getRandomSubarray(obj,9);
    // })

    $scope.$on('socket:quest:update', function(event, obj){
  		$scope.quest = obj;
  	});

  	$scope.startQuest = function () {
  		socket.emit('quest:start');
  	}

 //    var getRandomSubarray = function (arr, size) {
	//     var shuffled = arr.slice(0), i = arr.length, temp, index;
	    
	//     while (i--) {
	//         index = Math.floor(i * Math.random());
	//         temp = shuffled[index];
	//         shuffled[index] = shuffled[i];
	//         shuffled[i] = temp;
	//     }
	    
	//     return shuffled.slice(0, size);
	// }

  });