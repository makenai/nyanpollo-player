var jsonfile = require('jsonfile'),
  sensorData = require('./data/sensors.json'),
  aprsData = require('./data/aprsfi.json');

// Sort the timestamps;
var combinedData = sensorData.sort(function(x,y) {
  return Date.parse( x.timestamp ) -  Date.parse( y.timestamp );
});

// for (var i=aprsData.length-1; i>=0; i--) {
for (var i=0; i<aprsData.length; i++) {
  delete aprsData[i].comment;
  var aprsTime = parseInt( aprsData[i].time ) * 1000;
  for (var j=0; j<combinedData.length; j++) {
    var dataTime = Date.parse( combinedData[j].timestamp );
    if ( dataTime >= aprsTime ) {
      combinedData[j].aprs = aprsData[i];
    }
    combinedData[j].time = dataTime;
  }
}

console.log( combinedData );