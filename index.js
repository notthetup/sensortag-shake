var EventEmitter = require("events").EventEmitter;
var async = require('async');
var util = require('util');
var SensorTag = require('SensorTag');

var prevSensorValue = 0;

function SensorTagShake (direction){

  if (typeof direction !== 'string'){
    console.error('First argument of SensorTagShake should be a direction string.');
    return;
  }

  if (direction.length !== 1 && direction.length !==2 ){
    console.error('Direction string must be 1 or 2 character long');
    return;
  }

  var cordinate = direction[direction.length-1];

  if (cordinate !== 'x' && cordinate !== 'y' && cordinate !== 'z' ){
    console.error('Direction string include a direction, x,y,z');
    return;
  }

  var sign = '+';

  if (direction.length == 2){
    sign = direction[0];
    if (sign !== '+' && sign !== '-' ){
      console.error('Direction can include a sign, +/-');
      return;
    }
  }

  var self = this;

  EventEmitter.call(this);

  SensorTag.discover(function(sensorTag) {
    sensorTag.on('disconnect', function() {
      console.log('Disconnected from SensorTag!');
      process.exit(0);
    });

    async.series([
        function(callback) {
          sensorTag.connectAndSetUp(callback);
        },

        function(callback) {
          console.log('Connected to SensorTag!');
          sensorTag.enableAccelerometer(callback);
        },
        function(callback) {
          sensorTag.on('accelerometerChange', function(x, y, z) {

            // console.log(x.toFixed(2));

            var value = 0;
            if (cordinate === 'x'){
              value = x;
            }else if(cordinate === 'y'){
              value = y;
            }else if (cordinate === 'z'){
              value = z;
            }

            if ( (prevSensorValue < 0 && value > 0 && sign === '-')  ||
                 (prevSensorValue > 0 && value < 0 && sign === '+') ){
              // console.log(prevSensorValue, value, Math.abs(value-prevSensorValue));
              self.emit('shake', {
                value: value,
                time : new Date().getTime()
              });
            }
            prevSensorValue = value;

          });
          sensorTag.setAccelerometerPeriod(200, function(error) {
            console.log("Starting Accelerometer");
            sensorTag.notifyAccelerometer();
          });
          callback();
        }
    ]);
  });
}

util.inherits(SensorTagShake, EventEmitter);
module.exports = SensorTagShake;


