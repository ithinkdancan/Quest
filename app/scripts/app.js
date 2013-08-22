'use strict';

angular.module('questApp', ['ui.compat', 'btford.socket-io'])
.config(function ($stateProvider, socketProvider) {

    socketProvider.ioSocket(io.connect('ws://'+window.location.hostname+':1337'));
    //Heroku Socket
    //socketProvider.ioSocket(io.connect('http://thawing-sierra-6634.herokuapp.com:80')); 

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
            'stage' : {
                controller: 'Quest',
                templateUrl: 'views/quest.html',
               
            },
            'field@quest': {
                  templateUrl: 'views/castle.html'
            }
        }
    }).state('quest.start', {
        views:{
            'field@quest': {
                  templateUrl: 'views/journey.html'
            }
        }
    });

})
.run(function (socket) {

   socket.forward(['quest:list','quest:join', 'quest:leave', 'quest:create', 'quest:update', 'quest:complete']);

});
