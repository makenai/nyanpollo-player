// Convert kilopascals to altutide - cribbed from https://github.com/sparkfun/BMP180_Breakout
function kPaToAltitude( initialPressure, pressure ) {
	var altitude = 44330.0 * ( 1 - Math.pow( pressure / initialPressure, 1/5.255 ) );
	return altitude;
}

function metersToFeet(meters) {
	return meters * 3.280839895;
}

function kilometersToMiles(kilometers) {
	return kilometers * 0.6213711922;
}