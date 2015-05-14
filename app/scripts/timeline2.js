d3.chart('BaseChart', {
 
  initialize: function() {
 
    /**
      Private properties and methods
    */
    this._margin = {top: 20, right: 20, bottom: 20, left: 20};
    this._innerWidth  = this.base.attr('width') ? this.base.attr('width') - this._margin.left - this._margin.right : 200;
    this._innerHeight = this.base.attr('height') ? this.base.attr('height') - this._margin.top - this._margin.bottom : 200;
    this._asideWidth = 0;
    this._duration = 500;
 
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
  }
 
 
});

// d3.chart("BaseChart", {
//   // handles sizing and margins for charts
//   initialize: function() {

//     // setup some reasonable defaults
//     this._margin = {top: 20, right: 20, bottom: 20, left: 20};
//     this._width  = this.base.attr("width") ? this.base.attr("width") - this._margin.left - this._margin.right : 200;
//     this._height = this.base.attr("height") ? this.base.attr("height") - this._margin.top - this._margin.bottom : 200;

//     this.base.append("g");

//     // make sure container height and width are set.
    
//     this.updateContainerWidth();
//     this.updateContainerHeight();
//     this.updateMargins();
    
//     // non data driven areas (as in not to be independatly drawn)
//     this.areas = {};

//     // cache for selections that are layer bases.
//     this.layers = {};
//   },

//   updateContainerWidth: function() { this.base.attr("width", this._width + this._margin.left + this._margin.right); },

//   updateContainerHeight: function() { this.base.attr("height", this._height + this._margin.top + this._margin.bottom); },

//   // Adjust the margins
//   updateMargins: function () { 
//     this.base.select("g").attr("transform", "translate(" + this._margin.left + "," + this._margin.top + ")"); 
//     this.updateContainerWidth();
//     this.updateContainerHeight();
//   },

//   width: function(newWidth) {
//     if (arguments.length === 0) {
//       return this._width;
//     }

//     // only if the width actually changed:
//     if (this._width !== newWidth) {

//       var oldWidth = this._width;

//       this._width = newWidth;

//       // set higher container width
//       this.updateContainerWidth();

//       // trigger a change event
//       this.trigger("change:width", newWidth, oldWidth);
//     }

//     // always return the chart, for chaining magic.
//     return this;
//   },

//   height: function(newHeight) {
//     if (arguments.length === 0) {
//       console.log("return height");
//       console.log(this._height);
//       return this._height;
//     }

//     var oldHeight = this._height;

//     this._height = newHeight;

//     if (this._height !== oldHeight) {

//       this.updateContainerHeight();

//       this.trigger("change:height", newHeight, oldHeight);
//     }

//     return this;
//   },

//   margin: function(newMargin) {
//     if (arguments.length === 0) {
//       return this._margin;
//     }

//     var oldMargin = this._margin;

//     this._margin = newMargin;

//     if (this._margin !== oldMargin) {

//       this.updateContainerHeight();
//       this.updateContainerWidth();
//       this.updateMargins();

//       this.trigger("change:margin", newMargin, oldMargin);
//     }

//     return this;
//   }
// });

// d3.chart("Circles", {

//   initialize: function() {
//     // create a base scale we will use later.
//     this.xScale = d3.scale.linear();
//     this.f = d3.time.format("%B %d, 20%y");

//     var circlesBase = this.base.append("g")
//         .classed("circles", true)
//         .attr("height", this.h)
//         .attr("width", this.w);

//     this.layer("circles", circlesBase, {
//       dataBind: function(data) {
//         var chart = this.chart();

//         // update the domain of the xScale since it depends on the data
//         chart.xScale.domain(d3.extent(data));

//         // return a data bound selection for the passed in data.
//         return this.selectAll("circle")
//           .data(data);

//       },
//       insert: function() {
//         var chart = this.chart();

//         // update the range of the xScale (account for radius width)
//         // on either side
//         chart.xScale.range([chart.r, chart.w - chart.r]);

//         // setup the elements that were just created
//         return this.append("circle")
//           .classed("circle", true)
//           .style("fill", "red")
//           .attr("cy", chart.h/2)
//           .attr("r", chart.r);
//       },

//       // setup an enter event for the data as it comes in:
//       events: {
//         "enter" : function() {
//           var chart = this.chart();

//           // position newly entering elements
//           return this.attr("cx", function(d) {
//             return chart.xScale(d);
//           });
//         }
//       }
//     });
//   },

//   // configures the width of the chart.
//   // when called without arguments, returns the
//   // current width.
//   width: function(newWidth) {
//     if (arguments.length === 0) {
//       return this.w;
//     }
//     this.w = newWidth;
//     return this;
//   },

//   // configures the height of the chart.
//   // when called without arguments, returns the
//   // current height.
//   height: function(newHeight) {
//     if (arguments.length === 0) {
//       return this.h;
//     }
//     this.h = newHeight;
//     return this;
//   },

//   // configures the radius of the circles in the chart.
//   // when called without arguments, returns the
//   // current radius.
//   radius: function(newRadius) {
//    if (arguments.length === 0) {
//       return this.r;
//     }
//     this.r = newRadius;
//     return this;
//   },

//   // configures the date format
//   // when called without arguments, returns
//   // current radius.
//   format: function(newFormat) {
//    if (arguments.length === 0) {
//       return this.f;
//     }
//     this.f = newFormat;
//     return this;
//   }

// });

/*
var data = [1,3,4,6,10];

var chart = d3.select("#chart2")
  .append("svg")
  .chart("Circles")
    .width(100)
    .height(50)
    .radius(5);

chart.draw(data);
*/

d3.chart("BaseChart").extend("BubbleTimeline", {
    
    modes: {
      mobile : function() {
        return Modernizr.mq("only all and (max-width: 480px)");
      },
      tablet: function() {
        return Modernizr.mq("only all and (min-width: 481px) and (max-width: 768px)");
      },
      web: function() {
        return Modernizr.mq("only all and (min-width: 769px)");
      }
    },

    transform: function(data) {
      var chart = this;

      chart.data = data;

      console.log(data);

      var format = d3.time.format("%B %d, 20%y");
      var formatString = d3.time.format.iso;

      data.forEach(function(d) {
        d.dateOriginal = d.date;
        d.formattedDate = formatString.parse(d.date);
        d.dateObject = new Date(d.date);
        d.date = format(d.dateObject);
        d.impact_qty = +d.impact_qty;
        // d.impact_qty = (parseInt(d.impact_qty) > 0) ? parseInt(d.impact_qty) : 0;
      });

      // var sorted = data.sort(function(a,b){ return b.impact_qty - a.impact_qty; });
      // var topten = [];
      // var toptenKeys = [];
      // sorted.forEach(function(d,i){
      //   if (i <= 9) {
      //     topten.push(d);
      //     toptenKeys.push(d.org)
      //   }
      // });

      var org_types = [
        "other",
        "gov",
        "com",
      ];
      
      var sums = d3.nest()
        .key(function(d) { return d.org_type; })
        .rollup(function(values) { return d3.sum(values, function(d) {return parseInt(d.impact_qty); }) })
        .map(data);

      //update x scale domain
      var sortedByDate = data.sort(function(a,b){return a.dateObject.getTime() - b.dateObject.getTime();});
      var mindate = formatString.parse(sortedByDate[0].dateOriginal);
      var maxdate = formatString.parse(sortedByDate[data.length-1].dateOriginal);
      console.log(sortedByDate[0].dateOriginal);
      console.log(sortedByDate[0].dateFormatted);
      console.log(formatString.parse(sortedByDate[0].dateOriginal));
      chart.xScale.domain([mindate,maxdate]).nice();

      //update y scale domain
      chart.yScale.domain(org_types);

      //update r scale domain
      var min = d3.min(data, function(d) { return d.impact_qty; });
      var max = d3.max(data, function(d) { return d.impact_qty; });

      console.log(min);
      console.log(max);

      chart.rScale.domain([0, max]);

      return data;
    },

    initialize: function() {

      var chart = this;

      console.log(chart);
      // console.log(chart.margin);
      // console.log(chart.margin());
      console.log(chart.outerWidth());
      console.log(chart.width());

      // chart.width(chart.width - chart.margin().left - chart.margin().right);
      // chart.height(chart.height - chart.margin().top - chart.margin().bottom);

      console.log(chart.width());
      console.log(chart.height());

      var xAxisBase = chart.base.select("g").append("g")
        .classed("axes", true);

      var linesBase = chart.base.select("g").append("g")
        .classed("lines", true);

      var circlesBase = this.base.select("g").append("g")
        .classed("circles", true);

      var types = [
        "Malicious Outsider",
        "Accidental Data Loss",
        "Physical Loss",
        "Malicious Insider",
        "Payment Card Fraud",
        "State Sponsored",
        "Hacktivist",
        "Unknown"
      ];

      var org_types = [
        "other",
        "gov",
        "com",
      ];

      // create an xScale
      this.xScale = d3.time.scale()
        .range([0, chart.width()]);

      // when the width changes, update the x scale range
      chart.on("change:width", function(newWidth) {
        chart.xScale.range([0, newWidth]);
      });

      // create a yScale
      this.yScale = d3.scale.ordinal()
        .rangeRoundBands([0, chart.height()], 0);

      // when the height changes, update the y scale range
      chart.on("change:height", function(newHeight) {
        chart.yScale.rangeRoundBands([30, chart.height() + 30], 0);
      });

      console.log("height");
      console.log(chart.height());

      // create a rScale
      this.rScale = d3.scale.sqrt()
        .range([0, 70]);


      // add lines layer
      this.layer("grid-lines", linesBase, {
        modes : ["web", "tablet"],
        dataBind: function(data) {
          var chart = this.chart();

          return this.selectAll(".lines")
            .data(org_types);
        },

        // insert lines
        insert: function() {
          var chart = this.chart();
          var selection =  this.append("line");

          return selection;
        },

        events: {
          "merge" : function() {
            var chart = this.chart();
            var selection = this;

            // draw lines
            selection
            .attr("class","lines")
              .attr("x1",0)
              .attr("x2",chart.width())
              .attr("y1",function(d) { return chart.yScale(d); })
              .attr("y2",function(d) { return chart.yScale(d); })
              .attr("stroke","black")
              .attr("stroke-width", 1);


            return selection;
          }
        }

      });

      // add x-axis layer 
      this.layer("x-axis", xAxisBase, {
        modes : ["web", "tablet"],
        dataBind: function(data) {
          var chart = this.chart();

          return this.selectAll(".x")
            .data(data);
        },

        // insert x-axis
        insert: function() {
          var chart = this.chart();
          var selection = this.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + chart.height() + ")");

          return selection;
        },

        events: {
          "merge" : function() {
            var chart = this.chart();
            var selection = this;
            // draw xaxis
            var xAxis = d3.svg.axis()
              .scale(chart.xScale)
              .orient("bottom")
              .ticks(6)
              .tickFormat(chart._xformat || d3.time.format("%Y"));

            chart.base.select(".x.axis")
            .transition()
              .duration(300)
              .call(xAxis);

            return selection;
          },

          "exit" : function() {
            var chart = this.chart();
            var selection = this;
            // draw xaxis
            var xAxis = d3.svg.axis()
              .scale(chart.xScale)
              .orient("bottom")
              .ticks(5)
              .outerTickSize(0)
              .tickFormat(chart._xformat || d3.time.format("%Y"));

            chart.base.select(".x.axis")
            .transition()
              .duration(300)
              .call(xAxis);
          }
        }

      });

      // add a circle layer
      this.layer("breach-dots", circlesBase, {
        modes : ["web", "tablet"],
        dataBind: function(data) {
          var chart = this.chart();

          return this.selectAll("circle")
            .data(data.sort(function(a,b) {
              return b.impact_qty - a.impact_qty;
            }));
        },

        // insert circles
        insert: function() {
          var chart = this.chart();
          var selection =  this.append("circle");

          return selection;
        },

        // for new and updating elements, reposition
        // them according to the updated scale.
        events: {
          "merge" : function() {
            var chart = this.chart();
            var selection = this;
            var el = d3.select(this);
            /*
            if (chart.mode() === "tablet") {
              selection.attr("width", chart.width()/10)
                .attr("height", 10);
            } else  if (chart.mode() === "web") {
              selection.attr("width", chart.width()/50)
                .attr("height", 50);
            }
            */

            


            selection
              .style("fill", "blue")
              .style("opacity", "0.2");

            selection
              .attr("cx",function(d) { return chart.xScale(d.formattedDate); })
              .attr("cy",function(d) { return chart.yScale(d.org_type); })
              .attr("r", function(d) { return chart.rScale(d.impact_qty); });

            
            // add a mouseover listener to our circles
            // and change their color and broadcast a chart
            // brush event to any listeners.
            selection
            .on("mouseover", function() {
              var el = d3.select(this);
              // el.selectAll("circle")

              el
                .style("opacity",".8")
                .style("stroke", "gray")
                .style("stroke-width","2");

              el
                .append("g")
                  .attr("class","tt")
                .append("text")
                  .attr("y", function(d) { return chart.yScale(d.org_type); })
                  .attr("x", function(d) { return chart.xScale(d.formattedDate); })
                  .attr("dy", "-.5em")
                  .attr("dx", ".5em")
                  .attr("class", "ttText")
                  .text(function(d) { return d.hed; });

              el.select(".tt")
                .append("text")
                  .attr("y", function(d) { return chart.yScale(d.org_type); })
                  .attr("x", function(d) { return chart.xScale(d.formattedDate); })
                  .attr("dy", "-1.7em")
                  .attr("dx", ".5em")
                  .attr("class", "ttText")
                  .attr("color", "red")
                  .text(function(d) { return d.impact_qty / 1000000; });

              console.log(el.selectAll(".tt")[0][0].parentNode.parentNode);
              var tooltip = el.selectAll(".tt")[0][0];
              tooltip.parentNode.parentNode.appendChild(tooltip);

              var ttText = d3.selectAll("text.ttText");
              if (ttText.attr("x") > chart.width() * .5 ) {
                ttText
                  .attr("text-anchor","end")
                  .attr("dx", "-.5em");
              }
            });

            selection.on("mouseout", function() {
              var el = d3.select(this);

              el
                .style("opacity","0.2")
                .style("stroke", "none");

              d3.select(".tt").remove();

              chart.trigger("unbrush", this);
            });


            return selection;
          }
        }

      });

/*

      // add a boxes layer
      this.layer("boxes", this.base.append("g"), {
        modes : ["web", "tablet"],
        dataBind: function(data) {
          var chart = this.chart();

          // update the x scale domain when 
          // new data comes in
          chart.xScale.domain([
            Math.min.apply(null, data),
            Math.max.apply(null, data)
          ]);

          return this.selectAll("rect")
            .data(data);
        },

        // insert semi transparent blue rectangles
        // of height and width 10.
        insert: function() {
          var chart = this.chart();
          var selection =  this.append("rect");

          return selection;
        },

        // for new and updating elements, reposition
        // them according to the updated scale.
        events: {
          "merge" : function() {
            var chart = this.chart();
            var selection = this;
            if (chart.mode() === "tablet") {
              selection.attr("width", chart.width()/10)
                .attr("height", 10);
            } else  if (chart.mode() === "web") {
              selection.attr("width", chart.width()/50)
                .attr("height", 50);
            }
            selection.style("fill", "blue")
              .style("opacity", "0.5");

            selection.attr("x", function(d) {
              return chart.xScale(d);
            }).attr("y", chart.height()/2);

            return selection;
          }
        }
      });

*/

      // // for mobile, add a small text layer
      // this.layer("mobile-text", this.base.append("g"), {
      //   modes: ["mobile"],
      //   dataBind: function(data) {
      //     return this.selectAll("text")
      //       .data([data.length]);
      //   },

      //   insert: function() {
      //     var chart = this.chart();
      //     return this.append("text")
      //       .style("fill", "blue")
      //       .attr("y", "10%")
      //       .attr("x", 10);
      //   },
      //   events: {
      //     merge : function() {
      //       return this.text(function(d) {
      //         return "There are " + d + " boxes painted on the screen";
      //       });
      //     }
      //   }
      // });
    },
});

var data = d3.csv("RiskFactor-monetary-test.csv", function (data) {
  var bubbles = d3.select("#chart")
    .append("svg")
    .chart("BubbleTimeline")
    .width(760)
    .height(400)
    .margin({top: 20, bottom: 70, right: 90, left: 90});

    // .margins([20,90,70,90])

  bubbles.draw(data);
});