'use strict';

angular.module('questApp')
  .controller('Quest', function ($scope, $state, $stateParams, socket, QuestService) {

    $scope.quest_id = $stateParams.id;
    $scope.quest = QuestService.get('quest:join', {id:$scope.quest_id});
    $scope.lead = QuestService.get('quest:lead');
    $scope.winner = QuestService.get('quest:complete');

    $scope.selectedGrails = [];
    // $scope.grails = QuestService.get('grails:list').then(function(obj){
    // 	return getRandomSubarray(obj,9);
    // })

    $scope.$on('socket:quest:leave', function(){
        window.location = '/';
    });

    $scope.$on('socket:quest:update', function(event, obj){
  		$scope.quest = obj;
      if($scope.quest.started && !$scope.selectedGrails.length){
        QuestService.get('grails:list')
          .then(function(obj){ 
            $scope.grails = obj; 
          });;
        $state.transitionTo('quest.start', $stateParams);
      }
  	});

    var saveGrails = function () {
      socket.emit('quest:save', $scope.selectedGrails);
    }

  	$scope.startQuest = function () {
  		socket.emit('quest:start');
  	}

    $scope.pickGrail = function (_id) {
      
      //save the vote
      $scope.selectedGrails.push(_id);

      //remove the first set
      $scope.grails.shift();
      
      //If nothing left, save the votes
      if(!$scope.grails.length){
        saveGrails();
      }
    }

  });