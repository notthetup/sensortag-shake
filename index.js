var EventEmitter = require("events").EventEmitter;
var async = require('async');
var util = require('util');
var SensorTag = require('SensorTag');


function SensorTagShake (){

  var prev = 0;
  var shakeX = [];
  var shakeXDiff = [];
  var prevTime = new Date().getTime();
  var prevSpeed = 0;
  var alpha = 0.7;
  var self = this;

  EventEmitter.call(this);

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
              // console.log(smoothenedSpeed, speed,diff, tDiff);
              self.emit('shake', smoothenedSpeed);
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
}

util.inherits(SensorTagShake, EventEmitter);
module.exports = SensorTagShake;


