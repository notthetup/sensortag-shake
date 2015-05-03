var EventEmitter = require("events").EventEmitter;
var async = require('async');
var util = require('util');
var SensorTag = require('sensortag');

var prevSensorValue = [0,0];

function SensorTagShake (direction, options){

  this.options = options || {};
  this.options.sensitivity = this.options.hasOwnProperty('sensitivity') ? this.options.sensitivity : 0.8;
  this.options.sensorTag = this.options.hasOwnProperty('sensorTag') ? this.options.sensorTag : null;

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

  if (this.sensorTag){
    startListeningForShakes(this.sensorTag);
  }else{
    SensorTag.discover(function(sensorTag) {
      sensorTag.connectAndSetUp(function(){
        startListeningForShakes(sensorTag);
      });
    });
  }



  function startListeningForShakes(sensorTag){
    sensorTag.on('disconnect', function() {
      console.error('Disconnected from SensorTag!');
    });

    async.series([
      function(callback) {
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

            var diffA = prevSensorValue[1]-prevSensorValue[0];
            var diffB = value - prevSensorValue[1];


            if (((diffA < 0 && diffB > 0 && sign === '-')  ||
             (diffA > 0 && diffB < 0 && sign === '+') )
              && Math.abs(diffA-diffB) > self.options.sensitivity){
              // console.log(diffA, diffB);
            self.emit('shake', {
              value: value,
              time : new Date().getTime()
            });
          }
          prevSensorValue.push(value);
          prevSensorValue.shift();

        });
        sensorTag.setAccelerometerPeriod(100, function(error) {
          console.log("Starting Accelerometer");
          sensorTag.notifyAccelerometer();
        });
        callback();
      }
      ]);
}
}

util.inherits(SensorTagShake, EventEmitter);
module.exports = SensorTagShake;


