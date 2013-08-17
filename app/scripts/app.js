'use strict';

angular.module('questApp', ['btford.socket-io'])
  .config(function ($routeProvider, socketProvider) {
    
    socketProvider.ioSocket(io.connect('socket://localhost:1337'));

    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  })
  .run(function (socket) {

     socket.forward('news');

  });
