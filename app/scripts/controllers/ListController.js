'use strict';

angular.module('questApp')
  .controller('List', function ($scope, $state, $location, socket, QuestService) {

    $scope.list = {};
    $scope.quest = {};

  	$scope.createQuest = function () {
      if(!$scope.quest.name){
        $scope.list.creating = false;
      } else {
        QuestService.get('quest:create', {name: $scope.quest.name}, true).then(function(obj) {
          $location.path('/quest/' + obj._id);
        });
      }
  
  	};

    $scope.onKeyPress = function ($event) {
      if($event.which == 13){
        $scope.createQuest();
      }
    }

  	$scope.$on('socket:quest:list', function(event, obj){
  		$scope.quests = obj;
  	});

  	$scope.quests = QuestService.get('quest:list', null, true);


  });