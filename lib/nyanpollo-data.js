var NyanpolloData = function( data, options ) {
  this.data = data;
  this.options = options || {};
  this.initializeData();
};

NyanpolloData.prototype = {

  // TODO : Create a function that returns the averaged data for a given timestamp
  // in between frames

  /**
   * Add index and numberic times to data
   */
  initializeData: function() {
    for (var i=0;i<this.data.length;i++) {
      this.data[i]._index = i;
      this.data[i]._timestamp = Date.parse( this.data[i].timestamp );
    }
  },

  /**
   * Retrieve a time adjustment for a given timestamp.
   * @param  {number} ms - ms relative to start of video source
   * @return {object} adjustment
   */
  getTimeAdjustment: function(ms) {
    if ( this.options.timeAdjustments ) {
      var lastAdjustment = this.options.timeAdjustments[0];
      for (var i=0;i<this.options.timeAdjustments.length;i++) {
        var adjustment = this.options.timeAdjustments[ i ];
        if (ms < adjustment.videoTime) {
          break;
        } else {
          lastAdjustment = adjustment;
        }
      }
      return lastAdjustment;
    } else {
      return null;
    }
  },

  /**
   * Give a relative timestamp in ms, get an absoulute timestamp based on
   * timings in the data
   * @param  {number} ms - relative time (such as from a video source)
   * @return {number} adjustedMs - absolute and adjusted time in ms
   */
  getTime: function( ms ) {
    if (this.options.timeAdjustments) {
      var adjustment = this.getTimeAdjustment( ms );
      var difference = ms - adjustment.videoTime;
      return adjustment.timestamp + difference;
    } else {
      var startTime = this.getFirstValue('_timestamp') || 0;
      return startTime + ms;
    }
  },

  /**
   * Retrieve the data packet for a given timestamp
   * @param  {timestamp} timestamp - unix timestamp in ms
   */
  getData: function( timestamp ) {
    var lastData = this.data[0];
  	for (var i=0;i<this.data.length;i++) {
  		var data = this.data[i];
  		if ( timestamp < data._timestamp ) {
  			break;
  		} else {
        lastData = data;
      }
  	}
  	return lastData;
  },

  /**
   * Returns the min and max for a give path in the series of data
   * packets.
   * @param  {string} path - ex. 'gyro.x'
   * @return {array} [min,max]
   */
  getRange: function( path ) {
    var min = null,
        max = null;
  	for (var i=0;i<this.data.length;i++) {
  		var value = _.get( this.data[i], path );
  		if (value) {
  			if (min === null || value < min) {
  				min = value;
  			}
  			if (max === null || value > max) {
  				max = value;
  			}
  		}
  	}
  	return [ min, max ];
  },

  /**
   * Get the first non-null occurence of a value in a series of data packets
   * @param  {string} path [description]
   * @return {mixed} value
   */
  getFirst: function( path ) {
    for (var i=0;i<this.data.length;i++) {
  		var datum = _.get( this.data[i], path );
  		if (datum !== undefined && datum !== null) {
  			return datum;
  		}
  	}
  },

};