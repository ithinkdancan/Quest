'use strict';

angular.module('questApp')
  .controller('Room', function ($scope, $stateParams, socket, RoomService) {

    $scope.room_id = $stateParams.id;
    $scope.room = RoomService.get('room:join', {id:$scope.room_id})

  });