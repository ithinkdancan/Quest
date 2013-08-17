var io = require('socket.io').listen(1337);
var AwesomeThingsProvider = require('./awesomethingsprovider').AwesomeThingsProvider;


var awesomeThingsProvider = new AwesomeThingsProvider('localhost', 27017);

io.sockets.on('connection', function (socket) {
  
  socket.on('getThings', function (data) {
    
  	awesomeThingsProvider.findAll(function(error, things){
		console.log(things)
		console.log('EMMITTTING!!??');
		socket.emit('news', things);
	})

  });
});


