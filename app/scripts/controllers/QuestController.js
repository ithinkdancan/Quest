'use strict';

angular.module('questApp')
  .controller('Quest', function ($scope, $stateParams, socket, QuestService) {

    $scope.quest_id = $stateParams.id;
    $scope.quest = QuestService.get('room:join', {id:$scope.quest_id})

  });