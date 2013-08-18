angular.module('questApp').factory('RoomService', ['$q', '$rootScope', 'socket', function($q, $rootScope, socket) {

	return {
		get: function (name, obj) {
		
			var defer = $q.defer();

			socket.addListener(name,function(data){
			 	$rootScope.$apply(defer.resolve(data));
				socket.removeListener(name);
			})

			socket.emit(name, obj);

			return defer.promise;
		}
	};

}]);