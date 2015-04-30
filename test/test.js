var express = require('express')
var SensorTagShake = require('../index.js');

// var app = express();
// var server = app.listen(3000, function () {
//   console.log('Control the servo at http://localhost:' + server.address().port);
// })
// var io = require('socket.io').listen(server);
// var sockets = [];

// app.use(express.static(__dirname));

// io.on('connection', function (socket) {
//   sockets.push(socket);
// });

var sensortagshake = new SensorTagShake('+x');

sensortagshake.on('shake', function(){
	console.log("Shaken not stirred");
});
