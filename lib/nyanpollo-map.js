var NyanpolloMap = function(element, options) {
  this.element = element;
  this.options = options || {};
  this.initialize();
};

// TODO : Would it be fun to update the zoom level with the altitude?
// TODO : Brandon suggested rotating the map based on orientation. Let's try!
// https://groups.google.com/forum/#!topic/google-maps-js-api-v3/Lssj5ZKwHKI
// http://webhelp.esri.com/arcgisserver/9.3/java/index.htm#designing_overlay_gm_mve.htm

NyanpolloMap.prototype.newPath = function(path) {
  if ( path.length > 0 ) {
    this.flightPath.setPath( path );
    this.currentPosition = path[ path.length - 1 ];
  } else {
    this.flightPath.setPath([]);
    this.currentPosition = this.options.startPosition || {};
  }
  this.map.panTo( this.currentPosition );
  this.marker.setPosition( this.currentPosition );
};

NyanpolloMap.prototype.initialize = function() {
  var mapOptions = {
    mapTypeId: google.maps.MapTypeId.SATELLITE,
    zoom: 12
  };
  if (this.options.startPosition) {
    mapOptions.center = this.options.startPosition;
  }
  this.map = new google.maps.Map( this.element, mapOptions );

  this.flightPath = new google.maps.Polyline({
    path: [],
    geodesic: true,
    strokeColor: '#FF0000',
    strokeOpacity: 1.0,
    strokeWeight: 3,
    map: this.map
  });

  var markerOptions = {
    map: this.map
  };
  if (this.options.icon) {
    markerOptions.icon = this.options.icon;
    // for gif animations to work
    markerOptions.optimized = false;
  };
  if (this.options.startPosition) {
    markerOptions.position = this.options.startPosition;
  }
  this.marker = new google.maps.Marker(markerOptions);
};