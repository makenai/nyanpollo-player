var NyanpolloPlayer = function(dataSource, options) {
	this.dataSource = dataSource;
	this.options = options;
	this.lastUpdate = 0;
}

NyanpolloPlayer.prototype = {

	// Debounce call
	isDuplicateUpdate: function(ms) {
		if ( this.lastUpdate == ms ) {
			return true;
		} else {
			this.lastUpdate = ms;
			return false;	
		}
	},

	updateTime: function(ms) {
		if (this.isDuplicateUpdate(ms)) {
			return;
		}
	},


};

function updateRotation(name, degrees) {
	$('#' + name).css({ transform: 'rotate(' + degrees + 'deg)' });
}

// Convert seconds into hours, minutes, seconds
function formatSeconds(seconds) {
	if (seconds > 0) {
		return moment().startOf('day').seconds(seconds).format('H:mm:ss');
	} else {
		return 0;
	}
}

// Update a data field
function updateData(name, value, units) {
	// Get trend lines from history
	if (typeof value !== 'undefined' && value !== null) {
		$('#' + name).html( value + (units || '') ).css({ color: 'black' }).show();
	} else {
		$('#' + name).css({ color: 'red' });
	}
}

// Update a sparkline chart with historical data
// take big steps to show the trend, not the time series
var minMaxCache = {};
function updateChart(name, data, path, steps) {
	steps = steps || 25;
	var series = [];
	var lastValue = null;
	for (var i=data._index;i>=0;i--) {
		var datum = _.get( sensorData[ i ], path );
		if ( datum && lastValue !== datum ) {
			series.unshift( parseFloat( datum ) );
			lastValue = datum;
		}
		if (series.length>=steps) {
			break;
		}
	}
	// console.log( name, series );
	var options = {};
	var minMax = minMaxCache[ name ];
	if (!minMax) {
		minMax = minMaxCache[ name ] = dataSource.getRange( path );
	}
	if (minMax) {
		options.chartRangeMin = minMax[0];
		options.chartRangeMax = minMax[1];
	}
	$('#' + name).sparkline( series, options );
}

// Update the map with the latest indianna jones trail and position
function updateMap( map, data ) {
	var path = [],
		seenTime = {};
	for (var i=0;i<=data._index;i++) {
		if ( sensorData[i].aprs ) {
				if (!seenTime[ sensorData[i].aprs.time ]) {
					var latLng = new google.maps.LatLng(sensorData[i].aprs.lat, sensorData[i].aprs.lng);
					path.push( latLng );
					seenTime[ sensorData[i].aprs.time ] = true;
				}
		}
	}
  map.newPath( path );
}