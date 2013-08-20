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
    }).state('quest', {
        url: "/quest/{id}",
        views:{
            stage : {
                controller: 'Quest',
                templateUrl: 'views/quest.html'
            }
        }
    });

})
.run(function (socket) {

   socket.forward(['quest:list','quest:join', 'quest:create', 'quest:update']);

});
