  d3.chart("Plot").extend('MarginChart2', {

  modes: {
    mobile : function() {
      return Modernizr.mq("only all and (max-width: 480px)");
    },
    tablet: function() {
      return Modernizr.mq("only all and (min-width: 481px) and (max-width: 767px)");
    },
    web: function() {
      return Modernizr.mq("only all and (min-width: 768px)");
    }
  },
 
  initialize: function() {
 
    /**
      Private properties and methods
    */

    this._dateParse = d3.time.format.iso;
    this._dateDisplay = "%B %d, 20%y";
    this._yData = "y";
    this._yData = "r";
 
    },

  dateParse: function(newDateParse) {
    if (arguments.length === 0) {
      return this._dateParse;
    }

    var oldDateParse = this._dateParse;

    if ( oldDateParse !== newDateParse && newDateParse !== "iso" ) {
      this._dateParse = d3.time.format(newDateParse);
    }
 
    this.trigger('change:dateParse', newDateParse, oldDateParse);
 
    return this;
  },
  
  dateDisplay: function(newDateDisplay) {
    if (arguments.length === 0) {
      return d3.time.format(this._dateDisplay);
    }

    var oldDateDisplay = this._dateDisplay;

    if ( oldDateDisplay !== newDateDisplay) {
      this._dateDisplay = d3.time.format(newDateDisplay);
    }
 
    this.trigger('change:dateDisplay', newDateDisplay, oldDateDisplay);
 
    return this;
  },

  yData: function(newYData) {
    if (arguments.length === 0) {
      return this._yData;
    }

    var oldYData = this._yData;

    if ( oldYData !== newYData) {
      this._yData = newYData;
    }
 
    this.trigger('change:yData', newYData, oldYData);
 
    return this;
  },

  rData: function(newRData) {
    if (arguments.length === 0) {
      return this._rData;
    }

    var oldRData = this._rData;

    if ( oldRData !== newRData) {
      this._rData = newRData;
    }
 
    this.trigger('change:rData', newRData, oldRData);
 
    return this;
  }

 
});
