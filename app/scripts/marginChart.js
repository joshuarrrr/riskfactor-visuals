d3.chart("BaseChart").extend('MarginChart', {

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
    this._margin = {top: 20, right: 20, bottom: 20, left: 20};
    this._innerWidth  = this.base.attr('width') ? this.base.attr('width') - this._margin.left - this._margin.right : 200;
    this._innerHeight = this.base.attr('height') ? this.base.attr('height') - this._margin.top - this._margin.bottom : 200;
    this._asideWidth = 0;
    this._duration = 500;
    this._color = "#ddd";
    this._dateParse = d3.time.format.iso;
    this._dateDisplay = "%B %d, 20%y";
    this._yData = "y";
    this._yData = "r";
 
    // make sure container height and width are set.
    this.base.attr('width', this.outerWidth());
    this.base.attr('height', this.outerHeight());
 
    // Adjust the margins
    this.base.append('g').attr('transform', 'translate(' + this._margin.left + ',' + this._margin.top + ')');
  },
 
  /**
    Public methods
  */
  getOriginalData: function(d) {return d;},
  
  outerWidth: function() { return this._innerWidth + this._margin.left + this._margin.right; },
 
  outerHeight: function() { return this._innerHeight + this._margin.top + this._margin.bottom; },
 
  width: function(newWidth) {
    if (arguments.length === 0) {
      return this._innerWidth;
    }
 
    // only if the width actually changed:
    if (this._innerWidth !== newWidth) {
 
      var oldWidth = this._innerWidth;
 
      this._innerWidth = newWidth;
 
      // set higher container width
      this.base.attr('width', this.outerWidth());
 
      // trigger a change event
      this.trigger('change:width', newWidth, oldWidth);
    }
 
    // always return the chart, for chaining magic.
    return this;
  },
 
  height: function(newHeight) {
    if (arguments.length === 0) {
      return this._innerHeight;
    }
 
    if (this._innerHeight !== oldHeight) {
      
      var oldHeight = this._innerHeight;
 
      this._innerHeight = newHeight;
 
      this.base.attr('height', this.outerHeight());
 
      this.trigger('change:height', newHeight, oldHeight);
    }
 
    return this;
  },
 
  margin: function(newMargin) {
    if (arguments.length === 0) {
      return this._margin;
    }
 
    var oldMargin = this._margin;
    this._margin = newMargin;
 
    // Update the base
    this.base.select('g').attr('transform', 'translate(' + this._margin.left + ',' + this._margin.top + ')');
    this.base.attr('width', this.outerWidth());
    this.base.attr('height', this.outerHeight());
 
 
    this.trigger('change:margin', newMargin, oldMargin);
 
    return this;
  },
 
  chartWidth: function() {
    return this.width() - this._asideWidth;
  },
 
  chartHeight: function() {
    return this.height();
  },
 
  asideWidth: function(newAsideWidth) {
    if (arguments.length === 0) {
      return this._asideWidth;
    }
 
    var oldAsideWidth = this._asideWidth;
    this._asideWidth = newAsideWidth;
 
    this.trigger('change:asideWidth', newAsideWidth, oldAsideWidth);
 
    return this;
  },
 
  duration: function() {
    return this._duration;
  },
 
  color: function() {
    return this._color;
  },
 
  /**
    chart.colors(*colors*)
  
    Sets the range of colors used to paint the bars. *colors* can either be a
    single color (which will apply to all bars) or an array.
  */
  colors: function(newColors) {
    if (arguments.length === 0) {
      return this._color.range();
    }
 
    newColors = (typeof newColors === 'string') ? [newColors] : newColors;
    this._color.range(newColors);
 
    return this;
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
