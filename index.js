var util = require('util');
var async = require('async');
var SensorTag = require('sensortag');
var express = require('express')
var app = express();

var server = app.listen(3000, function () {
  console.log('Control the servo at http://localhost:' + server.address().port);
})
var io = require('socket.io').listen(server);
var sockets = [];

app.use(express.static(__dirname));

io.on('connection', function (socket) {
  sockets.push(socket);
})


var prev = 0;
var shakeX = [];
var shakeXDiff = [];
var prevTime = new Date().getTime();
var prevSpeed = 0;
var alpha = 0.7;

SensorTag.discover(function(sensorTag) {
  console.log('discovered: ' + sensorTag);

  sensorTag.on('disconnect', function() {
    console.log('disconnected!');
    process.exit(0);
  });

  async.series([
      function(callback) {
        console.log('connected!');
        sensorTag.connectAndSetUp(callback);
      },

      function(callback) {
        // console.log('enableAccelerometer');
        sensorTag.enableAccelerometer(callback);
      },

      function(callback) {
         sensorTag.on('accelerometerChange', function(x, y, z) {
          var diff = x - prev;
          prev = x;
          if (diff > 0.7){
            var currTime = new Date().getTime();
            var tDiff = currTime - prevTime;
            if (tDiff < 190){
              tDiff = 190;
            }
            var speed = 250/tDiff;
            var smoothenedSpeed = ((1-alpha)*speed)+(alpha*prevSpeed);
            prevSpeed = smoothenedSpeed;
            prevTime = currTime;
            console.log(smoothenedSpeed, speed,diff, tDiff);
            sockets.forEach(function(eachSocket) {
              eachSocket.emit('speedChange', {speed:smoothenedSpeed});
            })
          }
        });
        sensorTag.setAccelerometerPeriod(200, function(error) {
          console.log('notifyAccelerometer');
          sensorTag.notifyAccelerometer();
        });
      }
    ]
  );
});
