'use strict';

angular.module('questApp', ['ui.compat', 'btford.socket-io'])
.config(function ($stateProvider, socketProvider) {

    socketProvider.ioSocket(io.connect('socket://localhost:1337'));

    $stateProvider
    .state('index', {
        url: "", //root
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
    });

})
.run(function (socket) {

   socket.forward('news');

});
