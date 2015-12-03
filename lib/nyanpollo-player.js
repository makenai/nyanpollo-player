var NyanpolloPlayer = function(dataSource, options) {
	this.dataSource = dataSource;
	this.options = options;
	this.lastUpdate = 0;
	this.initialPressure = this.dataSource.getFirst('pressure');
	this.launchTime = this.options.launchTime || this.dataSource.getFirst('time');
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
		this.updateDisplay(ms);
	},

	updateDisplay: function(currentMs) {
		var realTime = this.dataSource.getTime( currentMs );
		var data = dataSource.getData( realTime );
		var timeSinceLaunch = realTime - this.launchTime;

		updateData('time', new Date(realTime));
		updateData('flighttime', formatSeconds(timeSinceLaunch / 1000));
		if (data) {
			updateData('dataframe', data._index);
			updateData('compass', data.heading, '&deg;' );
			updateRotation('compass-needle', data.heading);
			updateData('temperature', data.temperature && data.temperature.toFixed(2), '&deg; F');
			updateChart('temperature-chart', data, 'temperature');
			updateData('pressure', data.pressure && parseFloat(data.pressure).toFixed(2), ' kPa');
			updateChart('pressure-chart', data, 'pressure');
			if (data.pressure) {
				updateData('altitudekPa', metersToFeet(
						kPaToAltitude( this.initialPressure, data.pressure )
					).toFixed(2), ' feet');
			} else {
				updateData('altutidekPa', null);
			}
			if (data.aprs) {
				updateData('altitude', metersToFeet(data.aprs.altitude).toFixed(2), ' feet');
				updateChart('altitude-chart', data, 'aprs.altitude');
				updateData('course', data.aprs.course, '&deg;');
				updateRotation('course-needle', data.aprs.course);
				updateData('speed', kilometersToMiles( data.aprs.speed ).toFixed(2), ' mph');
				updateChart('speed-chart', data, 'aprs.speed');
			}
			if (map) {
				updateMap( map, data );
			}
		}
	}

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