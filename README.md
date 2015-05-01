# SensorTag-Shake

Simple shake detection library for the TI SensorTag based on the popular [SensorTag](https://www.npmjs.com/package/sensortag) package.

# Install

```
npm install --save sensortag-shake
```

# Usage

```
var SensorTagShake = require('sensortag-shake');

var sensortagshake = new SensorTagShake('+x');

sensortagshake.on('shake', function(data){
	console.log("Shook with ", data.value, "at", data.time);
});
```

# API

## Constructor

eg : `var sensortagshake = new SensorTagShake(direction, {sensorTag : sensorTagObj});`

- `direction`: __String__ - The direction of shake to detect. This is a string with sign (+,-) and a coordinate (x,y,z). For eg. `'+x'`.
- `options` : __Object__ - An options object with the folloing optional properties.
	- `sensorTag` : __Object__ - A [SensorTag](https://www.npmjs.com/package/sensortag) object, which has already discovered and connected to a SensorTag hardware. This allows a SensorTag object to be used with multiple libraries. If this optional value is not specified, this constructor will re-discover and re-connect to the SensorTag.

## Events

eg : `sensortagshake.on('shake', function(data){}`

- The SensorTag object emits a `shake` event, which contains a data object as defined below.
- `data` : __Object__ - Has the following properties.
	- `value` : __Number__ - Number indicating the final accelerometer value when the shake was detected.
	- `time` : __Number__ - Timestamp (msec) of the detection of the shake. This has (based on the SensorTag HW) minimum granularity of 200msec.



