'use strict';

angular.module('questApp', ['ui.compat', 'btford.socket-io'])
.config(function ($stateProvider, socketProvider) {

    socketProvider.ioSocket(io.connect('ws://'+window.location.hostname+':1337'));

    $stateProvider
    .state('index', {
        url: "", //root
        
        views:{
            stage : {
                controller: 'List',
                templateUrl: 'views/list.html',
            }
        } 
    }).state('room', {
        url: "/room/{id}",
        views:{
            stage : {
                controller: 'Room',
                templateUrl: 'views/room.html'
            }
        }
    });

})
.run(function (socket) {

   socket.forward(['room:list','room:join', 'room:create']);

});
