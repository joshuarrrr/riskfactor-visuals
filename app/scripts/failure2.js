d3.chart("BaseChart", {
  initialize: function() {

    // setup some reasonable defaults
    this._margin = {top: 20, right: 20, bottom: 20, left: 20};
    this._width  = this.base.attr("width") ? this.base.attr("width") - this._margin.left - this._margin.right : 200;
    this._height = this.base.attr("height") ? this.base.attr("height") - this._margin.top - this._margin.bottom : 200;

    this.base.append("g");

    // make sure container height and width are set.
    
    this.updateContainerWidth();
    this.updateContainerHeight();
    this.updateMargins();
    
    // non data driven areas (as in not to be independatly drawn)
    this.areas = {};

    // cache for selections that are layer bases.
    this.layers = {};
  },

  updateContainerWidth: function() { this.base.attr("width", this._width + this._margin.left + this._margin.right); },

  updateContainerHeight: function() { this.base.attr("height", this._height + this._margin.top + this._margin.bottom); },

  // Adjust the margins
  updateMargins: function () { 
    this.base.select("g").attr("transform", "translate(" + this._margin.left + "," + this._margin.top + ")"); 
    this.updateContainerWidth();
    this.updateContainerHeight();
  },

  width: function(newWidth) {
    if (arguments.length === 0) {
      return this._width;
    }

    // only if the width actually changed:
    if (this._width !== newWidth) {

      var oldWidth = this._width;

      this._width = newWidth;

      // set higher container width
      this.updateContainerWidth();

      // trigger a change event
      this.trigger("change:width", newWidth, oldWidth);
    }

    // always return the chart, for chaining magic.
    return this;
  },

  height: function(newHeight) {
    if (arguments.length === 0) {
      console.log("return height");
      console.log(this._height);
      return this._height;
    }

    var oldHeight = this._height;

    this._height = newHeight;

    if (this._height !== oldHeight) {

      this.updateContainerHeight();

      this.trigger("change:height", newHeight, oldHeight);
    }

    return this;
  },

  margin: function(newMargin) {
    if (arguments.length === 0) {
      return this._margin;
    }

    var oldMargin = this._margin;

    this._margin = newMargin;

    if (this._margin !== oldMargin) {

      this.updateContainerHeight();
      this.updateContainerWidth();
      this.updateMargins();

      this.trigger("change:margin", newMargin, oldMargin)
    }

    return this;
  }
});

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

d3.chart("BaseChart").extend("FailureChart", {
    
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

      var format = d3.time.format("%B 20%y");
      var formatString = d3.time.format("%-d-%b-%Y");
      var bisectDate = d3.bisector(function(d) { return d.dateObject; }).left; 

      chart.data = data;

      data.forEach(function(d) {
        d.dateOriginal = d.date;
        d.formattedDate = formatString.parse(d.date);
        d.dateObject = new Date(d.date);
        //d.date = format(d.dateObject);
        
        d.schedOriginal = d.estSchedule;
        d.formattedDate = formatString.parse(d.estSchedule);
        d.schedObject = new Date(d.estSchedule);
        //d.sched = format(d.schedObject);
        

        d.estMillions = (parseInt(d.estMillions) > 0) ? parseInt(d.estMillions) : 0;
        d.totMillions = (parseInt(d.totMillions) > 0) ? parseInt(d.totMillions) : 0;
        d.spentMillions = (parseInt(d.spentMillions) > 0) ? parseInt(d.spentMillions) : 0;
        console.log("data point processed");
      });

      var sorted = data.sort(function(a,b){ return b.date - a.date; });

      //update x scale domain
      var sortedByDate = data.sort(function(a,b){return a.dateObject.getTime() - b.dateObject.getTime();});
      var mindate = formatString.parse(sortedByDate[0].dateOriginal);
      var maxdate = formatString.parse(sortedByDate[data.length-1].schedOriginal);

      var maxTot = d3.max(data, function (d) { 
        return d.totMillions;
      });
      
      chart.xScale.domain([mindate,maxdate]);

      console.log(mindate);
      console.log(maxdate);

      //update y scale domain
      chart.yScale.domain([0,maxTot]);

      return data;
    },

    initialize: function() {

      var chart = this;

      console.log(chart);
      console.log(chart.margin);
      console.log(chart.margin());
      console.log(chart.width());

      // chart.width(chart.width - chart.margin().left - chart.margin().right);
      // chart.height(chart.height - chart.margin().top - chart.margin().bottom);

      // console.log(chart.width());
      // console.log(chart.height());

      // var circlesBase = chart.base.select("g").append("g")
      //   .classed("circles", true);

      var yAxisBase = chart.base.select("g").append("g")
        .classed("axes", true);

      var xAxisBase = chart.base.select("g").append("g")
        .classed("axes", true);

      var areaBase1 = chart.base.select("g").append("g")
        .classed("area1", true);

      var lineBase1 = chart.base.select("g").append("g")
        .classed("line1", true);

      var areaBase2 = chart.base.select("g").append("g")
        .classed("area2", true);

      var lineBase2 = chart.base.select("g").append("g")
        .classed("line2", true);

      var areaBase3 = chart.base.select("g").append("g")
        .classed("area3", true);

      var lineBase3 = chart.base.select("g").append("g")
        .classed("line3", true);

      var initLine = chart.base.select("g").append("g")
        .classed("initline", true);

      var ylabels = chart.base.select("g").append("g")
        .classed("y-labels", true);


      var format = d3.time.format("%B 20%y");
      var formatString = d3.time.format("%-d-%b-%Y");
      var bisectDate = d3.bisector(function(d) { return d.dateObject; }).left; 

      console.log(data);

      // data.forEach(function(d) {
      //   d.dateOriginal = d.date;
      //   d.formattedDate = formatString.parse(d.date);
      //   d.dateObject = new Date(d.date);
      //   d.date = format(d.dateObject);
        
      //   d.schedOriginal = d.estSchedule;
      //   d.formattedDate = formatString.parse(d.estSchedule);
      //   d.schedObject = new Date(d.estSchedule);
      //   d.sched = format(d.schedObject);
        

      //   d.estMillions = (parseInt(d.estMillions) > 0) ? parseInt(d.estMillions) : 0;
      //   d.totMillions = (parseInt(d.totMillions) > 0) ? parseInt(d.totMillions) : 0;
      //   d.spentMillions = (parseInt(d.spentMillions) > 0) ? parseInt(d.spentMillions) : 0;
      //   console.log("data point processed");
      // });

      // var sorted = data.sort(function(a,b){ return b.date - a.date; });

      // create an xScale
      this.xScale = d3.time.scale()
        .range([0, chart.width()]);

      // when the width changes, update the x scale range
      chart.on("change:width", function(newWidth) {
        chart.xScale.range([0, newWidth]);
      });

      // create a yScale
      this.yScale = d3.scale.linear()
        .range([chart.height(),0]);

      // when the height changes, update the y scale range
      chart.on("change:height", function(newHeight) {
        chart.yScale.range([newHeight, 0]);
      });

      console.log("height");
      console.log(chart.height());

      // create a rScale
      this.rScale = d3.scale.sqrt()
        .range([2, 30]);

      ylabels
        .attr("class", "y axis-label")
        .append("text")
          .attr("y", 0)
          .attr("x",0)
          .attr("dy", ".3em")
          .attr("dx", ".3em")
          .text("Cost, US$ Millions");

      // add axes layer 
      this.layer("x-axis", xAxisBase, {
        modes : ["web", "tablet"],
        dataBind: function(data) {
          var chart = this.chart();

          return this.selectAll(".x")
            .data([data]);
        },

        // insert area 1
        insert: function() {
          var chart = this.chart();
          var selection = this.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + chart.height() + ")")

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
              .ticks(5)
              .tickFormat(chart._xformat || d3.time.format("%Y"));

            chart.base.select(".x.axis")
              .call(xAxis);

            return selection;
          }
        }

      });

      this.layer("y-axis", yAxisBase, {
        modes : ["web", "tablet"],
        dataBind: function(data) {
          var chart = this.chart();

          return this.selectAll(".y")
            .data([data]);
        },

        // insert area 1
        insert: function() {
          var chart = this.chart();
          var selection = this.append("g")
            .attr("class", "y axis");

          return selection;
        },

        events: {
          "merge" : function() {
            var chart = this.chart();
            var selection = this;
            // draw yaxis
            var yAxis = d3.svg.axis()
              .scale(chart.yScale)
              .orient("left")
              .ticks(5)
              .tickFormat(chart._yformat || d3.format(","));

            chart.base.select(".y.axis")
              .call(yAxis);

            return selection;
          }
        }

      });

      // add area layer 1
      this.layer("totarea", areaBase1, {
        modes : ["web", "tablet"],
        dataBind: function(data) {
          var chart = this.chart();

          // data.forEach(function(d) {
          //   d.dateOriginal = d.date;
          //   d.formattedDate = formatString.parse(d.date);
          //   d.dateObject = new Date(d.date);
          //   d.date = format(d.dateObject);
            
          //   d.schedOriginal = d.estSchedule;
          //   d.formattedDate = formatString.parse(d.estSchedule);
          //   d.schedObject = new Date(d.estSchedule);
          //   d.sched = format(d.schedObject);
            

          //   d.estMillions = (parseInt(d.estMillions) > 0) ? parseInt(d.estMillions) : 0;
          //   d.totMillions = (parseInt(d.totMillions) > 0) ? parseInt(d.totMillions) : 0;
          //   d.spentMillions = (parseInt(d.spentMillions) > 0) ? parseInt(d.spentMillions) : 0;
          //   console.log("data point processed");
          // });

          // var sorted = data.sort(function(a,b){ return b.date - a.date; });

          // //update x scale domain
          // var sortedByDate = data.sort(function(a,b){return a.dateObject.getTime() - b.dateObject.getTime();});
          // var mindate = formatString.parse(sortedByDate[0].dateOriginal);
          // var maxdate = formatString.parse(sortedByDate[data.length-1].schedOriginal);

          // var maxTot = d3.max(data, function (d) { 
          //   return d.totMillions;
          // });
          
          // chart.xScale.domain([mindate,maxdate]);

          // console.log(mindate);
          // console.log(maxdate);

          // //update y scale domain
          // chart.yScale.domain([0,maxTot]);

          // // draw yaxis
          // var yAxis = d3.svg.axis()
          //   .scale(chart.yScale)
          //   .orient("left")
          //   .ticks(5)
          //   .tickFormat(chart._yformat || d3.format(","));

          // chart.base.select("g").append("g")
          //   .attr("class", "y axis")
          //   .call(yAxis);

          // chart.base.select("g").append("g")
          //   .attr("class", "y axis-label")
          //   .append("text")
          //     .attr("y", 0)
          //     .attr("x",0)
          //     .attr("dy", ".3em")
          //     .attr("dx", ".3em")
          //     .text("Cost, US$ Millions");

          // var lineSvg = chart.base.select("g").append("g");

          // var focus = chart.base.select("g").append("g")
          //   .style("display", "none");

          // // append the tooltip at the intersection 
          // focus.append("path")
          //   .attr("class", "tooltip x-line")
          //   .style("fill", "none")
          //   .style("stroke-width", "2")
          //   .style("stroke", "black");

          // focus.append("path")
          //   .attr("class", "tooltip pointer")
          //   .style("fill", "none")
          //   .style("stroke-width", "2")
          //   .style("stroke", "black");

          // focus.append("rect")
          //   .attr("class", "tt-bg");

          // var ttText = focus.append("text")
          //   .attr("class", "tooltip text")
          //   .attr("text-anchor", "middle");
            
          // ttText.append("tspan")
          //       .attr("class", "tt-text1")
          //       .attr("x", 0)
          //       .attr("y", "1.4em")
          // ttText.append("tspan")
          //       .attr("class", "tt-text2")
          //       .attr("x", 0)
          //       .attr("y", "2.8em")
          // ttText.append("tspan")
          //       .attr("class", "tt-text3")
          //       .attr("x", 0)
          //       .attr("y", "4.2em")
          // ttText.append("tspan")
          //       .attr("class", "tt-text4")
          //       .attr("x", 0)
          //       .attr("y", "5.6em")
          // ttText.append("tspan")
          //       .attr("class", "tt-text5")
          //       .attr("x", 0)
          //       .attr("y", "7.0em")

          // // focus.append("circle")
          // //   .attr("class", "tooltip circle")
          // //   .style("fill", "none")
          // //   .style("stroke", "red")
          // //   .attr("r", 4);
        
          // // append the rectangle to capture mouse
          // chart.base.select("g").append("rect")
          //   .attr("width", chart.width())
          //   .attr("height", chart.height())
          //   .style("fill", "none")
          //   .style("pointer-events", "all")
          //   .on("mouseover", function() { focus.style("display", null); })
          //   .on("mouseout", function() { focus.style("display", "none"); })
          //   .on("mousemove", mousemove);

          // function mousemove() {
          //   var x0 = chart.xScale.invert(d3.mouse(this)[0]),
          //     i = bisectDate(data, x0, 1),
          //     d0 = data[i - 1],
          //     d1 = data[i],
          //     d = x0 - d0.dateObject > d1.dateObject - x0 ? d1 : d0;

          //   console.log(i);

          //   // focus.select("circle.circle")
          //   //   .attr("transform",
          //   //     "translate(" + chart.xScale(d.dateObject) + "," +
          //   //                    chart.yScale(d.spentMillions) + ")");

          //   focus.select("path.x-line")
          //     .attr("transform",
          //       "translate(" + chart.xScale(d.dateObject) + ",0)")
          //     .attr("d", "M 0 " + chart.height() +" L 0 " + chart.yScale(d.totMillions));

          //   focus.select("path.pointer")
          //     .attr("transform",
          //       "translate(" + chart.xScale(d.dateObject) + ",0)")
          //     .attr("d", "M 0 " + chart.yScale(d.totMillions) +
          //                 " L " + ((chart.width() / 2) - chart.xScale(d.dateObject)) +
          //                 " " + (chart.height() / 5));

          //   focus.select(".tt-bg")
          //     .attr("transform", "translate(" + chart.width() / 2 + ",0)")
          //     .attr("width", chart.width() / 3.3)
          //     .attr("height", function() { return d.notes === "" ? "6.6em" : "8.0em" })
          //     .attr("x", - chart.width() / 3.3 / 2)
          //     .attr("y", 0)
          //     .style("fill", "white")
          //     .style("stroke", "black")
          //     .style("stroke-width", "2");

          //   ttText
          //     .attr("transform",
          //       "translate(" + (chart.width() / 2) + ",0)")
          //     .attr("x", 0)
          //     .attr("y", 0);

          //   ttText.select("tspan.tt-text1")
          //       .text("Project Update: " + d.date);
          //   ttText.select("tspan.tt-text2")
          //       .text("Spent so far (US$ Millions): " + d.spentMillions)
          //   ttText.select("tspan.tt-text3")
          //       .text("Estimated development cost: " + d.estMillions)
          //   ttText.select("tspan.tt-text4")
          //       .text("Estimated total lifecycle cost: " + d.totMillions)
          //   ttText.select("tspan.tt-text5")
          //       .text(d.notes);
          // }


          // // draw xaxis
          // var xAxis = d3.svg.axis()
          //   .scale(chart.xScale)
          //   .orient("bottom")
          //   .ticks(5)
          //   .tickFormat(chart._xformat || d3.time.format("%Y"));

          // chart.base.select("g").append("g")
          //   .attr("class", "x axis")
          //   .attr("transform", "translate(0," + chart.height() + ")")
          //   .call(xAxis);

          return this.selectAll("path")
            .data(data);
                
        },

        // insert area 1
        insert: function() {
          var chart = this.chart();
          var selection = this.append("path")
            .classed("area",true);

          return selection;
        },

        events: {
          "merge" : function() {
            var chart = this.chart();
            var selection = this;

            console.log(selection);

            selection
              .style("stroke", "none");

            selection
              .attr("class", "area total")
              .attr("d", function(d) {
                return "M " +
                chart.xScale(d.dateObject) +
                " " +
                chart.yScale(d.spentMillions) +
                " L " + 
                chart.xScale(d.schedObject) + 
                " " + 
                chart.yScale(d.totMillions) +
                " V " +
                chart.yScale(d.spentMillions) + 
                " Z ";
              });
            // .transition()
            //   .duration(2000)
            //   .attrTween("d", pathTween);
          
            // function pathTween() {
            //   var interpolate = d3.scale.quantile()
            //     .domain([0,1])
            //     .range(d3.range(1, data.length + 1));
            //   return function(t) {
            //     return area(data.slice(0, interpolate(t)));
            //   };
            // }

            // chart.base.select("g").select(".x.axis")
            //   .call(xAxis);
      

            return selection;
          }
        }

      });



      // // add line layer 1
      // this.layer("totline", lineBase1, {
      //   modes : ["web", "tablet"],
      //   dataBind: function(data) {
      //     var chart = this.chart();

      //     return this.selectAll("path.line")
      //       .data([data]);
                
      //   },

      //   // insert line 1
      //    insert: function() {
      //     var chart = this.chart();
      //     var selection = this.append("path");

      //     return selection;
      //   },

      //   events: {
      //     "merge" : function() {
      //       var chart = this.chart();
      //       var selection = this;
      //       var line = d3.svg.line()
      //         .x(function(d) {
      //           return chart.xScale(d.dateObject);
      //         })
      //         .y(function(d) {
      //           return chart.yScale(d.totMillions);
      //         })
      //         .interpolate("linear");

      //       selection
      //         .style("fill", "none")
      //         .style("opacity", ".7")
      //         .style("stroke-width", "2")
      //         .style("stroke", "black");

      //       selection
      //         .attr("class", "line")
      //         .attr("d", line)    
      //       .transition()
      //         .duration(2000)
      //         .attrTween("d", pathTween);
          
      //       function pathTween() {
      //         var interpolate = d3.scale.quantile()
      //           .domain([0,1])
      //           .range(d3.range(1, data.length + 1));
      //         return function(t) {
      //           return line(data.slice(0, interpolate(t)));
      //         };
      //       }
              

      //       return selection;
      //     }
      //   }

      // });

      // add area layer 2
      this.layer("estarea", areaBase2, {
        modes : ["web", "tablet"],
        dataBind: function(data) {
          var chart = this.chart();

          return this.selectAll("path")
            .data(data);
                
        },

        // insert area 2
        insert: function() {
          var chart = this.chart();
          var selection = this.append("path");

          return selection;
        },

        events: {
          "merge" : function() {
            var chart = this.chart();
            var selection = this;

            console.log(selection);

            selection
              .style("stroke", "none");

            selection
              .attr("class", "area total")
              .attr("d", function(d) {
                return "M " +
                chart.xScale(d.dateObject) +
                " " +
                chart.yScale(d.spentMillions) +
                " L " + 
                chart.xScale(d.schedObject) + 
                " " + 
                chart.yScale(d.estMillions) +
                " V " +
                chart.yScale(d.spentMillions) + 
                " Z ";
              });
            // .transition()
            //   .duration(2000)
            //   .attrTween("d", pathTween);
          
            // function pathTween() {
            //   var interpolate = d3.scale.quantile()
            //     .domain([0,1])
            //     .range(d3.range(1, data.length + 1));
            //   return function(t) {
            //     return area(data.slice(0, interpolate(t)));
            //   };
            // }
      

            return selection;
          }
        }

      });

      // // add line layer 2
      // this.layer("estline", lineBase2, {
      //   modes : ["web", "tablet"],
      //   dataBind: function(data) {
      //     var chart = this.chart();

      //     return this.selectAll("path.line")
      //       .data([data]);
                
      //   },

      //   // insert line 2
      //   insert: function() {
      //     var chart = this.chart();
      //     var selection = this.append("path");

      //     return selection;
      //   },

      //   events: {
      //     "merge" : function() {
      //       var chart = this.chart();
      //       var selection = this;
      //       var line = d3.svg.line()
      //         .x(function(d) {
      //           return chart.xScale(d.dateObject);
      //         })
      //         .y(function(d) {
      //           return chart.yScale(d.estMillions);
      //         })
      //         .interpolate("linear");

      //       selection
      //         .style("fill", "none")
      //         .style("opacity", ".7")
      //         .style("stroke-width", "2")
      //         .style("stroke", "black");

      //       selection
      //         .attr("class", "line")
      //         .attr("d", line)    
      //       .transition()
      //         .duration(2000)
      //         .attrTween("d", pathTween);
          
      //       function pathTween() {
      //         var interpolate = d3.scale.quantile()
      //           .domain([0,1])
      //           .range(d3.range(1, data.length + 1));
      //         return function(t) {
      //           return line(data.slice(0, interpolate(t)));
      //         };
      //       }
              

      //       return selection;
      //     }
      //   }

      // });

      // add area layer 3
      this.layer("spentarea", areaBase3, {
        modes : ["web", "tablet"],
        dataBind: function(data) {
          var chart = this.chart();

          return this.selectAll("path.area")
            .data([data]);
                
        },

        // insert area 2
        insert: function() {
          var chart = this.chart();
          var selection = this.append("path");

          return selection;
        },

        events: {
          "merge" : function() {
            var chart = this.chart();
            var selection = this;
            var line = d3.svg.line()
              .x(function(d) {
                return chart.xScale(d.dateObject);
              })
              .y(function(d) {
                return chart.yScale(d.spentMillions);
              });

            var area = d3.svg.area()
              .x(function(d) { return chart.xScale(d.dateObject); })
              .y0(chart.height())
              .y1(function(d) { return chart.yScale(d.spentMillions); });

            selection
              .style("fill", "red")
              .style("opacity", ".7")
              .style("stroke", "none");

            selection
              .attr("class", "area spent")
              .attr("d", area)
            .transition()
              .duration(300)
              .attrTween("d", pathTween);
          
            function pathTween() {
              var interpolate = d3.scale.quantile()
                .domain([0,1])
                .range(d3.range(1, data.length + 1));
              return function(t) {
                return area(data.slice(0, interpolate(t)));
              };
            }

            return selection;
          }
        }

      });

      // // add line layer 3
      // this.layer("spentline", lineBase3, {
      //   modes : ["web", "tablet"],
      //   dataBind: function(data) {
      //     var chart = this.chart();

      //     return this.selectAll("path.line")
      //       .data([data]);
                
      //   },

      //   // insert line 3
      //   insert: function() {
      //     var chart = this.chart();
      //     var selection = this.append("path");

      //     return selection;
      //   },

      //   events: {
      //     "merge" : function() {
      //       var chart = this.chart();
      //       var selection = this;
      //       var line = d3.svg.line()
      //         .x(function(d) {
      //           return chart.xScale(d.dateObject);
      //         })
      //         .y(function(d) {
      //           return chart.yScale(d.spentMillions);
      //         })
      //         .interpolate("linear");

      //       selection
      //         .style("fill", "none")
      //         .style("opacity", ".7")
      //         .style("stroke-width", "2")
      //         .style("stroke", "black");

      //       selection
      //         .attr("class", "line")
      //         .attr("d", line)    
      //       .transition()
      //         .duration(2000)
      //         .attrTween("d", pathTween);
          
      //       function pathTween() {
      //         var interpolate = d3.scale.quantile()
      //           .domain([0,1])
      //           .range(d3.range(1, data.length + 1));
      //         return function(t) {
      //           return line(data.slice(0, interpolate(t)));
      //         };
      //       }

      //       return selection;
      //     }
      //   }

      // });

      // add initial estimate line
      this.layer("initline", initLine, {
        modes : ["web", "tablet"],
        dataBind: function(data) {
          var chart = this.chart();

          return this.selectAll("path.line")
            .data([data]);
                
        },

        // insert line
        insert: function() {
          var chart = this.chart();
          var selection = this.append("path");

          return selection;
        },

        events: {
          "merge" : function() {
            var chart = this.chart();
            var selection = this;
            var lineY = chart.yScale(data[0].estMillions);
            var line = d3.svg.line()
              .x(function(d, i) {
                if ( i === 0 ) {
                  return chart.xScale(d.dateObject);
                }
                else {
                  return chart.xScale(d.schedObject);
                }
              })
              .y(function(d) {
                return chart.yScale(data[0].estMillions);
              });

            selection
              .style("fill", "none")
              .style("opacity", ".7")
              .style("stroke-width", "4")
              .style("stroke", "black")
              .style("stroke-dasharray","10,10");

            selection
              .attr("class", "line")
              .attr("d", line);
            // .transition()
            //   .duration(1000)
            //   .delay(1000)
            //   .attrTween("d", pathTween);

            // function pathTween() {
            //   var interpolate = d3.scale.quantile()
            //     .domain([0,1])
            //     .range(d3.range(1, data.length + 1));
            //   return function(t) {
            //     return line(data.slice(0, interpolate(t)));
            //   };
            // }
              

            return selection;
          }
        }

      });

    }
      
      // // add a circle layer
      // this.layer("breach-dots", circlesBase, {
      //   modes : ["web", "tablet"],
      //   dataBind: function(data) {
      //     var chart = this.chart();

      //     //update x scale domain
      //     var sortedByDate = data.sort(function(a,b){return a.dateObject.getTime() - b.dateObject.getTime();});
      //     var mindate = formatString.parse(sortedByDate[0].dateOriginal);
      //     var maxdate = formatString.parse(sortedByDate[data.length-1].dateOriginal);

      //     chart.xScale.domain([mindate,maxdate]);

      //     //update y scale domain
      //     chart.yScale.domain([0,d.estMillions]);

      //     //update r scale domain
      //     var min = d3.min(data, function(d) { return d.records; });
      //     var max = d3.max(data, function(d) { return d.records; });

      //     chart.rScale.domain([min, max]);

      //     return this.selectAll("circle")
      //       .data(data.sort(function(a,b) {
      //         return b.records - a.records;
      //       }));
      //   },

      //   // insert circles
      //   insert: function() {
      //     var chart = this.chart();
      //     var selection =  this.append("circle");

      //     return selection;
      //   },

      //   // for new and updating elements, reposition
      //   // them according to the updated scale.
      //   events: {
      //     "merge" : function() {
      //       var chart = this.chart();
      //       var selection = this;
      //       /*
      //       if (chart.mode() === "tablet") {
      //         selection.attr("width", chart.width()/10)
      //           .attr("height", 10);
      //       } else  if (chart.mode() === "web") {
      //         selection.attr("width", chart.width()/50)
      //           .attr("height", 50);
      //       }
      //       */


      //       selection
      //         .style("fill", "blue")
      //         .style("opacity", "0.7");

      //       selection
      //         .attr("cx",function(d) { return chart.xScale(d.formattedDate); })
      //         .attr("cy",function(d) { return chart.yScale(d.industry); })
      //         .attr("r", function(d) { return chart.rScale(d.records); });

      //       return selection;
      //     }
      //   }

      // });

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

      // for mobile, add a small text layer
    //   this.layer("mobile-text", this.base.append("g"), {
    //     modes: ["mobile"],
    //     dataBind: function(data) {
    //       return this.selectAll("text")
    //         .data([data.length]);
    //     },

    //     insert: function() {
    //       var chart = this.chart();
    //       return this.append("text")
    //         .style("fill", "blue")
    //         .attr("y", "10%")
    //         .attr("x", 10);
    //     },
    //     events: {
    //       merge : function() {
    //         return this.text(function(d) {
    //           return "There are " + d + " boxes painted on the screen";
    //         });
    //       }
    //     }
    //   });
    // },

    // configures the date format
    // when called without arguments, returns
    // current radius.
  // margin: function(newMargin) {
  //  if (arguments.length === 0) {
  //     return this.margin;
  //   }
  //   this.margin = newMargin;
  //   return this;
  // },

  // // configures the width of the chart.
  // // when called without arguments, returns the
  // // current width.
  // width: function(newWidth) {
  //   if (arguments.length === 0) {
  //     return this.w;
  //   }
  //   this.w = newWidth;
  //   return this;
  // },

  // // configures the height of the chart.
  // // when called without arguments, returns the
  // // current height.
  // height: function(newHeight) {
  //   if (arguments.length === 0) {
  //     return this.h;
  //   }
  //   this.h = newHeight;
  //   return this;
  // },

});

//var data = d3.csv.parse('org,date,industry,location,records,source,type,action,data_type,record_type,pct_encrypted,data_recovered,lawful_action,source_1,source_2,data_source,featured\nCommunity Health Systems,8/20/14,Healthcare & Medical Providers,"Franklin, Tennessee",4500000,Malicious Outsider,,,,,,,,,,Privacy Rights Clearinghouse,\nCourt Ventures,10/21/13,Other,"Anaheim, California",200000000,Accidental Data Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nAdobe,9/18/13,Technology,California,152000000,Malicious Outsider,Financial Access,Yes,Digital,"PI,LOG,PSS,CCN,NAM,",45%,,Yes,http://www.hindustantimes.com/technology/Chunk-HT-UI-Technology-OtherStories/Source-code-customer-data-stolen-by-hackers-Adobe/SP-Article1-1130856.aspx,http://techland.time.com/2013/10/04/8-things-we-know-so-far-about-adobes-customer-data-breach/,Breach Level Index,\neBay,5/21/14,Retail & Merchant,California,145000000,Malicious Outsider,Identity Theft,Yes,Digital,"PSS,NAM,EMA,PHO,DOB",20%,,No,http://www.theverge.com/2014/5/21/5737914/ebay-will-ask-all-customers-to-change-passwords-after-massive-breach,https://community.ebay.com/t5/eBay-Cafe/Ebay-Security-has-been-breached-by-hackers/td-p/2749695,Breach Level Index,\nHeartland Payment Systems,1/20/09,Financial and Insurance Services,"Princeton, New Jersey",130000000,Malicious Outsider,,,,,,,,,,Privacy Rights Clearinghouse,\nTarget,11/4/13,Retail & Merchant,"Minneapolis, Minnesota",110000000,Malicious Outsider,Financial Access,Yes,Digital,CCN,0%,,No,http://nypost.com/2013/12/22/chase-bank-opens-after-target-security-breach/,http://nypost.com/2013/12/22/chase-limits-withdrawals-purchases-after-target-security-breach/,Breach Level Index,\nTJX retail stores,1/17/07,Retail & Merchant,"Framingham, Massachusetts",100000000,Malicious Outsider,,,,,,,,,,Privacy Rights Clearinghouse,\nU.S. Military Veterans,10/2/09,Government & Military,"Washington, District Of Columbia",76000000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nEvernote,2/13/13,Technology,California,50000000,Malicious Outsider,Account Access,No,Digital,"PSS,EMA,LOG",33%,yes,No,http://www.nbcnews.com/technology/technolog/evernote-resets-50-million-passwords-after-hackers-access-user-data-1C8659106,,Breach Level Index,\nLivingSocial,4/4/13,Retail & Merchant,"Washington, District Of Columbia",50000000,Malicious Outsider,Account Access,Unknown,Digital,PSS,100%,unknown,No,http://www.usatoday.com/story/news/nation/2013/04/26/liviing-social-hacked-passwords-amazon/2116485/,http://securitywatch.pcmag.com/news-events/310828-livingsocial-password-breach-affects-50-million-accounts,Breach Level Index,\nCardSystems,6/16/05,Financial and Insurance Services,"Tucson, Arizona",40000000,Malicious Outsider,,,,,,,,,,Privacy Rights Clearinghouse,\nSteam (The Valve Corporation),11/10/11,Retail & Merchant,"Bellevue, Washington",35000000,Malicious Outsider,,,,,,,,,,Privacy Rights Clearinghouse,\nU.S.  Department of Veterans Affairs,5/22/06,Government & Military,"Washington, District Of Columbia",26500000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nCountrywide Financial Corp.,8/2/08,Financial and Insurance Services,"Calabasas, California",17000000,Malicious Insider,,,,,,,,,,Privacy Rights Clearinghouse,\nBank of New York Mellon,3/26/08,Financial and Insurance Services,"Pittsburgh, Pennsylvania",12500000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\n"Sony, PlayStation Network (PSN), Sony Online Entertainment (SOE)",4/27/11,Retail & Merchant,"New York, New York",12000000,Malicious Outsider,,,,,,,,,,Privacy Rights Clearinghouse,\nFidelity National Information Services/Certegy Check Services Inc.,7/3/07,Financial and Insurance Services,"Jacksonville, Florida",8500000,Malicious Insider,,,,,,,,,,Privacy Rights Clearinghouse,\nGlobal Payments Inc.,3/30/12,Financial and Insurance Services,"Atlanta, Georgia",7000000,Payment Card Fraud,,,,,,,,,,Privacy Rights Clearinghouse,\nOffice of the Texas Attorney General,4/27/12,Government & Military,"Austin, Texas",6500000,Accidental Data Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nSouth Carolina Department of Revenue,10/26/12,Government & Military,"Columbia, South Carolina",6400000,Malicious Outsider,,,,,,,,,,Privacy Rights Clearinghouse,\nTD Ameritrade Holding Corp.,9/14/07,Financial and Insurance Services,"Omaha, Nebraska",6300000,Malicious Outsider,,,,,,,,,,Privacy Rights Clearinghouse,\nFacebook,6/2/13,Technology,California,6000000,Accidental Data Loss,Account Access,Unknown,Digital,"PHO,EMA",0%,yes,No,http://www.morningstar.com/topics/t/76861969/facebook-admits-year-long-data-breach-exposed-6-million-users.htm,http://www.reuters.com/article/2013/06/21/facebook-security-idUSL2N0EX1RI20130621,Breach Level Index,\n"TRICARE Management Activity (formerly Civilian Health and Medical Program of the Uniformed Services, CHAMPUS), Science Applications International Corporation (SAIC)",9/30/11,Other,,5117799,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nCheckFree Corp.,1/6/09,Financial and Insurance Services,"Atlanta, Georgia",5000000,Malicious Outsider,,,,,,,,,,Privacy Rights Clearinghouse,\nSnapchat,12/25/13,Technology,Florida,4600000,Malicious Outsider,Account Access,Exposed,Digital,"LOG,PHO",0%,,No,http://gibsonsec.org/snapchat/fulldisclosure/#foreword-and-notes,http://www.businessinsider.com/security-folks-share-snapchat-hack-2013-12,Breach Level Index,\nHannaford Bros. Supermarket chain,3/17/08,Financial and Insurance Services,"Portland, Maine",4200000,Malicious Outsider,,,,,,,,,,Privacy Rights Clearinghouse,\nAdvocate Health Care,7/18/13,Healthcare & Medical Providers,"Park Ridge, Illinois",4000000,Malicious Outsider,Identity Theft,No,Digital,"SSN,DOB,ADD,NAM",0%,no,Yes,http://healthitsecurity.com/2013/08/27/advocate-medical-group-endures-massive-data-breach/,http://www.ihealthbeat.org/articles/2013/8/26/advocate-medical-group-reports-biggest-hipaa-breach-in-hhs-history,Breach Level Index,\n"Citigroup, UPS",6/6/05,Financial and Insurance Services,"New York, New York",3900000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nTexas Comptroller\'s Office,4/11/11,Government & Military,"Austin, Texas",3500000,Accidental Data Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nDivision of Motor Vehicles Colorado,7/9/08,Government & Military,Colorado,3400000,Accidental Data Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nEducational Credit Management Corporation,3/26/10,Financial and Insurance Services,"ST. Paul, Minnesota",3300000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nSkype,1/1/14,Technology,California,3000000,State Sponsored,Nuisance,Yes,Digital,VIRUS,0%,,,http://grahamcluley.com/2014/01/skype-blog-twitter-account-hacked-syrian-electronic-army/,http://www.theguardian.com/technology/2014/jan/02/syrian-electronic-army-skype-twitter-blog,Breach Level Index,\n"Michael\'s Stores, Aaron Brothers",1/27/14,Retail & Merchant,Texas,3000000,Malicious Outsider,Financial Access,Yes,Digital,CCN,0%,,,http://krebsonsecurity.com/2014/01/sources-card-breach-at-michaels-stores/,http://m.blazingsecurity.com/news/2014041935671/,Breach Level Index,\n"Georgia Department of Community Health, Affiliated Computer Services (ACS)",4/10/07,Government & Military,"Atlanta, Georgia",2900000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nEvernote,11/25/13,Technology,California,2900000,Malicious Outsider,Existential Data,Yes,Digital,"IP,PSS,EMA,CCN",0%,,No,http://grahamcluley.com/2013/11/evernote-change-password-adobe/,http://www.darkreading.com/attacks-breaches/adobe-hacked-source-code-customer-data-s/240162228,Breach Level Index,\n"Adobe, PR Newswire, National White Collar Crime Center",10/4/13,Retail & Merchant,"San Jose, California",2900000,Malicious Outsider,,,,,,,,,,Privacy Rights Clearinghouse,\nBulgaria Citizens,4/15/14,Other,Bulgaria,2832312,Malicious Outsider,Identity Theft,Yes,Digital,"PII,NAM,ADD",0%,,,http://sofiaglobe.com/2014/04/16/half-of-personal-data-in-bulgaria-completely-compromised/,http://www.kontactor.com/tags/bulgaria/article/201404180003f3.half-personal-data-bulgaria-completely,Breach Level Index,\nNational White Collar Crime Center (NW3C),9/14/13,Other,Virginia,2659000,Malicious Outsider,Identity Theft,Yes,Digital,"PII,ADD",0%,,No,http://krebsonsecurity.com/2013/10/data-broker-hackers-also-compromised-nw3c/,http://www.dfinews.com/blogs/2013/10/data-broker-hackers-also-compromised-nw3c#.UlL8OdKkqbE,Breach Level Index,\nMichaels Stores Inc.,1/25/14,Retail & Merchant,"Irving, Texas",2600000,Malicious Outsider,,,,,,,,,,Privacy Rights Clearinghouse,\n"Circuit City and Chase Card Services, a division of JP Morgan Chase & Co.",9/7/06,Financial and Insurance Services,"Wilmington, Delaware",2600000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nMaricopa County Community College District,11/27/13,Educational Institutions,"Phoenix, Arizona",2490000,Malicious Outsider,Identity Theft,Yes,Digital,"SSN,CCN,DOB,NAM",0%,,Yes,http://www.bizjournals.com/phoenix/news/2013/11/27/mcccd-notifies-25m-about-exposed.html?page=all,http://www.kpho.com/story/24276899/ethical-hacker-maricopa-community-colleges-data-still-exposed,Breach Level Index,\n Harbor Freight Tools,7/19/13,Other,California,2400000,Malicious Outsider,Financial Access,Yes,Digital,CCN,0%,unknown,No,http://www.bankinfosecurity.com/new-Retail-breach-among-2013s-biggest-a-5970,http://www.thesamba.com/vw/forum/viewtopic.php?p=6795314,Breach Level Index,\nSchnucks,2/18/13,Retail & Merchant,Missouri,2400000,Malicious Outsider,Financial Access,Yes,Digital,CCN,0%,no,Yes,http://www.ksdk.com/news/article/370984/3/New-details-about-Schnucks-breach-investigation,http://www.bnd.com/2013/03/30/2556873/schnucks-found-and-contained-security.html,Breach Level Index,\nUniversity of Miami,4/17/08,Healthcare & Medical Providers,"Miami, Florida",2100000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nLos Angeles County Department of Social Services,3/2/06,Government & Military,"Los Angeles, California",2000000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nAOL,4/28/14,Technology,New York,2000000,Malicious Outsider,Identity Theft,Yes,Digital,"EMA,ADD,PSS,PHO,PII",50%,,,http://www.reuters.com/article/2014/04/28/us-cybercrime-aol-idUSBREA3R0YK20140428?feedType=RSS&feedName=businessNews,http://www.pcworld.com/article/2148523/aol-traces-mystery-spam-to-security-breach.html,Breach Level Index,\nHealth Net,7/5/13,Healthcare & Medical Providers,California,1900000,Malicious Outsider,Identity Theft,Unknown,Digital,"MED,SSN,FIN,ADD,NAM",0%,unknown,No,https://www.healthleadersmedia.com/page-1/COM-263662/CA-Investigating-Latest-Health-Net-Data-Breach,,Breach Level Index,\n"Health Net Inc., International Business Machines (IBM)",3/15/11,Healthcare & Medical Providers,"Rancho Cordova, California",1900000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nUbuntu Forums,6/27/13,Technology,Unknown,1820000,Malicious Outsider,Account Access,Yes,Digital,"PSS,LOG,ADD,EMA",0%,NO,No,http://arstechnica.com/security/2013/07/hack-exposes-e-mail-addresses-password-data-for-2-million-ubuntu-forum-users/,http://www.reddit.com/r/linux/comments/1irucc/hack_exposes_email_addresses_password_data_for_2/,Breach Level Index,\n"Jacobi Medical Center, North Central Bronx Hospital, Tremont Health Center, and Gunhill Health Center",2/12/11,Healthcare & Medical Providers,"New York, New York",1700000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nTexas Guaranteed Student Loan Corp. via subcontractor Hummingbird,5/31/06,Financial and Insurance Services,"Round Rock, Texas",1700000,Unknown,,,,,,,,,,Privacy Rights Clearinghouse,\nThe Nemours Foundation,10/7/11,Healthcare & Medical Providers,"Wilmington, Delaware",1600000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nHealth Net,11/18/09,Healthcare & Medical Providers,"Shelton, Connecticut",1500000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\n"DSW Shoe Warehouse, Retail Ventures",3/8/05,Retail & Merchant,"Columbus, Ohio",1400000,Malicious Outsider,,,,,,,,,,Privacy Rights Clearinghouse,\nColorado Department of Human Services via Affiliated Computer Services (ACS),11/2/06,Government & Military,"Dallas, Texas",1400000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nChicago Voter Database,10/23/06,Government & Military,"Chicago, Illinois",1350000,Accidental Data Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nChicago Board of Election,1/22/07,Government & Military,"Chicago, Illinois",1300000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nMontana Department of Public Health and Human Services ,5/22/14,Government & Military,Montana,1300000,Malicious Outsider,Identity Theft,Yes,Digital,"SSN,DOB,NAM,ADD,MED,FIN",0%,,No,http://missoulian.com/news/state-and-regional/montana/montana-to-notify-million-of-computer-hacking/article_483c0e67-0f42-5cbc-b6ac-ee5ca51e93fb.html,http://doj.nh.gov/consumer/security-breaches/documents/montana-public-health-human-services-20140623.pdf,Breach Level Index,\nUniversity of Utah Hospitals and Clinics,6/10/08,Healthcare & Medical Providers,"Salt Lake City, Utah",1300000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\n"New York State Electric & Gas (NYSEG), Rochester Gas and Electric (RG&E), Iberdrola USA",1/24/12,Government & Military,"Rochester, New York",1245000,Accidental Data Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nAvMed Health Plans,2/6/10,Healthcare & Medical Providers,"Gainesville, Florida",1220000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nBank of America Corp.,2/25/05,Financial and Insurance Services,"Charlotte, North Carolina",1200000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nLincoln National Corporation (Lincoln Financial),1/14/10,Financial and Insurance Services,"Radnor, Pennsylvania",1200000,Malicious Insider,,,,,,,,,,Privacy Rights Clearinghouse,\nThe Washington state Administrative Office,4/14/13,Government & Military,"Washington, District Of Columbia",1160000,Malicious Outsider,Identity Theft,Yes,Digital,"SSN,PII",0%,unknown,No,http://www.komonews.com/news/local/Millions-of-drivers-license-numbers-exposed-in-court-system-hack-206798481.html,,Breach Level Index,\nRBS WorldPay,12/29/08,Financial and Insurance Services,"Atlanta, Georgia",1100000,Malicious Outsider,,,,,,,,,,Privacy Rights Clearinghouse,\nNeiman Marcus,7/1/13,Retail & Merchant,"Dallas, Texas",1100000,Malicious Outsider,Financial Access,Yes,Digital,CCN,0%,,,http://www.nytimes.com/2014/01/24/business/neiman-marcus-breach-affected-1-1-million-cards.html?_r=0,,Breach Level Index,\nForbes,2/13/14,Other,Illinois,1071963,Malicious Outsider,Account Access,Yes,Digital,"LOG,EMA,PSS,NAM",0%,,,https://twitter.com/Official_SEA16/status/434252085597466624/photo/1/large,http://news.softpedia.com/news/Forbes-Hacked-by-Syrian-Electronic-Army-426797.shtml,Breach Level Index,\nCompass Bank,3/21/08,Financial and Insurance Services,"Birmingham, Alabama",1000000,Malicious Insider,,,,,,,,,,Privacy Rights Clearinghouse,\nNationwide Mutual Insurance Company and Allied Insurance,11/16/12,Financial and Insurance Services,"Columbus, Ohio",1000000,Malicious Outsider,,,,,,,,,,Privacy Rights Clearinghouse,\nOhio state workers,6/15/07,Government & Military,"Columbus, Ohio",1000000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nOklahoma Department of Human Services,4/23/09,Government & Military,"Oklahoma City, Oklahoma",1000000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nDrupal.org,5/6/13,Technology,Pennsylvania,1000000,Malicious Outsider,Account Access,Unknown,Digital,"PSS,LOG,EMA,PI",25%,unknown,No,http://arstechnica.com/security/2013/05/drupal-org-resets-login-credentials-after-hack-exposes-password-data/,http://news.silobreaker.com/drupalorg-resets-login-credentials-after-hack-exposes-password-data-5_2266853735982432256,Breach Level Index,\n"American Red Cross, St. Louis Chapter",5/18/06,Nonprofit,"St. Louis, Missouri",1000000,Malicious Insider,,,,,,,,,,Privacy Rights Clearinghouse,\nTruecaller,6/24/13,Other,Sweden,1000000,Malicious Outsider,Account Access,Unknown,Digital,"PSS,LOG,NAM,ADD",0%,unknown,No,http://www.ehackingnews.com/2013/07/truecaller-database-hacked-by-syrian.html,https://twitter.com/Official_SEA12/status/357298063167070211,Breach Level Index,\nCascade Medical Center,4/26/13,Healthcare & Medical Providers,Washington,1000000,Malicious Outsider,Nuisance,Yes,Digital,1 MILLAN DOLLAR,0%,NO,No,http://www.wenatcheeworld.com/news/2013/apr/26/cybertheft-heists-1-million-from-leavenworth/,http://krebsonsecurity.com/2013/04/wash-hospital-hit-by-1-03-million-cyberheist/,Breach Level Index,\nTango,6/28/13,Technology,"Washington, District Of Columbia",1000000,Malicious Outsider,Identity Theft,Unknown,Digital,"PHO,PII",0%,unknown,No,http://www.theregister.co.uk/2013/07/23/tango_chat_smackdown/,http://www.slashgear.com/syrian-electronic-army-hacked-tango-swiped-user-data-23291562/,Breach Level Index,\nParsippany police,3/29/13,Government & Military,New Jersey,960000,Malicious Insider,Existential Data,No,Digital,"PII,IP",0%,,Yes,https://twitter.com/AltheimLaw/status/409417546614730752,http://www.nj.com/morris/index.ssf/2013/12/retired_cop_accused_of_stealing_documents_will_turn_over_info_to_parsippany_attorney_says.html,Breach Level Index,\n"American International Group (AIG), Indiana Office of Medical Excess, LLC",6/14/06,Financial and Insurance Services,"New York, New York",930000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nScience Applications International Corp. (SAIC),7/20/07,Other,"San Diego, California",867000,Accidental Data Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nMacRumors forums,11/13/13,Technology,,860000,Malicious Outsider,Account Access,Yes,Digital,"PSS,LOG,EMA",33%,,No,http://arstechnica.com/security/2013/11/hack-of-macrumors-forums-exposes-password-data-for-860000-users/,http://www.cso.com.au/article/531788/macrumors_forums_breach_exposes_860_000_accounts/,Breach Level Index,\nCorporateCarOnline.com,11/4/13,Other,"Kirkwood, Missouri",850000,Malicious Outsider,,,,,,,,,,Privacy Rights Clearinghouse,\nmuscogee county ,11/13/13,Retail & Merchant,Missouri,850000,Malicious Outsider,Identity Theft,Yes,Digital,"CCN,FIN,NAM,PII,ADD",0%,,No,http://krebsonsecurity.com/2013/11/hackers-take-limo-service-firm-for-a-ride/,http://www.infosecurity-magazine.com/view/35048/hackers-target-mandiant-ceo-via-limo-service/,Breach Level Index,\n Horizon Blue Cross Blue Shield of New Jersey,12/6/13,Healthcare & Medical Providers,New Jersey,840000,Malicious Outsider,Identity Theft,Unknown,Digital,"MED,SSN,NAM,ADD,DOB",0%,,No,https://oag.ca.gov/system/files/Horizon%20BCBSNJ%20-%20Incident%20Notification%20-%20CA_0.pdf,http://www.nj.com/business/index.ssf/2013/12/horizon_bcbs_notifying_840000.html,Breach Level Index,\n"Horizon Healthcare Services, Inc. (Horizon Blue Cross Blue Shield)",12/6/13,Financial and Insurance Services,"Newark, New Jersey",840000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\n"Arkansas Department of InformationSystems, Information Vaulting Services",2/20/09,Government & Military,"Little Rock, Arkansas",807000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\n"Department of Child Support Services, International Business Machines (IBM), Iron Mountain, Inc.",3/29/12,Government & Military,"Boulder, Colorado",800000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nUniversity of California at Los Angeles (UCLA),12/12/06,Educational Institutions,"Los Angeles, California",800000,Malicious Outsider,,,,,,,,,,Privacy Rights Clearinghouse,\nGap Inc.,9/28/07,Retail & Merchant,"San Francisco, California",800000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nOhio State University,12/15/10,Educational Institutions,"Columbus, Ohio",750000,Malicious Outsider,,,,,,,,,,Privacy Rights Clearinghouse,\nAHMC,10/14/13,Healthcare & Medical Providers,Alabama,729000,Malicious Outsider,Identity Theft,Unknown,Digital,"CCN,MED,SSN,FIN,NAM",0%,,No,"http://www.latimes.com/local/lanow/la-me-ln-hospital-thefts-patient-files-20131021,0,3475716.story#axzz2iR9EMwDG",http://www.calhospital.org/news-headlines-article/laptop-thefts-compromise-700000-plus-hospital-patient-files,Breach Level Index,\nAHMC Anaheim Regional Medical Center LP,10/21/13,Healthcare & Medical Providers,California,729000,Malicious Outsider,Identity Theft,Unknown,Digital,"MED,SSN,FIN,NAM",0%,,No,http://www.riskbasedsecurity.com/cyber-liability/,,Breach Level Index,\n"CS Stars, subsidiary of insurance company Marsh Inc.",7/18/06,Financial and Insurance Services,"Chicago, Illinois",722000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\n"Hewlett, Packard, California Department of Social Services",5/12/12,Government & Military,"Riverside, California",701000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nCentral Collection Bureau,4/19/08,Other,"Indianapolis, Indiana",700000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nExpress Scripts,11/6/08,Other,"St. Louis, Missouri",700000,Unknown,,,,,,,,,,Privacy Rights Clearinghouse,\nGeneral Services Administration,2/13/13,Government & Military,"Washington, District Of Columbia",700000,Accidental Data Loss,Identity Theft,Unknown,Digital,"SSN,FIN,ACC,NAM,PII,LOG",0%,yes,No,http://www.databreaches.net/?p=27121,http://209.157.64.200/focus/news/2997587/posts?page=7,Breach Level Index,\n"Wachovia, Bank of America, PNC Financial Services Group and Commerce Bancorp",4/28/05,Financial and Insurance Services,"Hackensack, New Jersey",676000,Malicious Insider,,,,,,,,,,Privacy Rights Clearinghouse,\n"University of Nebraska, Nebraska Student Information System, Nebraska College System",5/25/12,Educational Institutions,"Lincoln, Nebraska",654000,Malicious Outsider,,,,,,,,,,Privacy Rights Clearinghouse,\nCitigroup,2/24/10,Financial and Insurance Services,"New York, New York",600000,Accidental Data Loss,,,,,,,,,,Privacy Rights Clearinghouse,\n"Time Warner, Iron Mountain Inc.",5/2/05,Other,"New York, New York",600000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\n"U.S. Department of Veterans Affairs, VA Medical Center",2/2/07,Healthcare & Medical Providers,"Birmingham, Alabama",583000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nGeorgia Technology Authority (GTA),3/30/06,Government & Military,"Atlanta, Georgia",573000,Malicious Outsider,,,,,,,,,,Privacy Rights Clearinghouse,\nNetwork Solutions,7/24/09,Other,"Herndon, Virginia",573000,Malicious Outsider,,,,,,,,,,Privacy Rights Clearinghouse,\nVirginia Prescription Monitoring Program,5/4/09,Healthcare & Medical Providers,"Richmond, Virginia",531400,Malicious Outsider,,,,,,,,,,Privacy Rights Clearinghouse,\nEisenhower Medical Center (EMC),3/30/11,Healthcare & Medical Providers,"Rancho Mirage, California",514330,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nScribd Inc,3/13/13,Technology,California,500000,Malicious Outsider,Account Access,Unknown,Digital,"PSS,ADD,LOG,EMA",25%,unknown,No,http://support.scribd.com/entries/23519663-Important-Security-Announcement,http://www.theregister.co.uk/2013/04/05/scribd_security_snafu/,Breach Level Index,\nWyndham Hotels & Resorts,2/28/10,Other,"Dallas, Texas",500000,Malicious Outsider,,,,,,,,,,Privacy Rights Clearinghouse,\n"Court Ventures, Experian",10/21/13,Financial and Insurance Services,Illinois,500000,Malicious Insider,Identity Theft,Yes,Digital,"SSN,DL,ACC,CCN,DOB",0%,,No,http://www.privacyrights.org/data-breach,,Breach Level Index,\nSpec\'s ,3/29/14,Retail & Merchant,Texas,500000,Malicious Outsider,Identity Theft,Yes,Digital,"CCN,DL,DOB",0%,,,http://www.chron.com/business/retail/article/Customer-payment-information-compromised-at-34-5357502.php?cmpid=hpbn,http://www.specsonline.com/pages.htm,Breach Level Index,\nPantagon,3/13/13,Government & Military,"Washington, District Of Columbia",500000,Malicious Outsider,Existential Data,Unknown,Digital,"IP,EMA",0%,no,No,http://www.itproportal.com/2013/04/15/pentagon-data-breach-sees-half-million-guantanamo-emails-leaked/,http://www.military.com/daily-news/2013/04/11/dod-accused-of-data-breach-in-uss-cole-case.html?comp=7000023317828&rank=1,Breach Level Index,\n"Anthem Blue Cross, WellPoint",6/23/10,Healthcare & Medical Providers,"Pasadena, California",470000,Accidental Data Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nGeorgia Technology Authority (GTA),5/14/05,Government & Military,"Atlanta, Georgia",465000,Malicious Insider,,,,,,,,,,Privacy Rights Clearinghouse,\n"Louisiana state, JP Morgan Chase",9/4/13,Government & Military,Louisiana,465000,Accidental Data Loss,Identity Theft,NO,Digital,"ACC,SSN,DOB,EMA",0%,,No,http://www.businessinsider.com.au/jpmorgan-warns-on-user-data-2013-12,http://www.reuters.com/article/2013/12/05/us-jpmorgan-dataexposed-idUSBRE9B405R20131205,Breach Level Index,\nJPMorgan Chase,12/5/13,Financial and Insurance Services,"New York, New York",465000,Malicious Outsider,,,,,,,,,,Privacy Rights Clearinghouse,\nBlueCross BlueShield (BCBST),1/14/10,Healthcare & Medical Providers,"Chattanooga, Tennessee",451274,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nMassachusetts Division of Professional Licensure,10/4/07,Government & Military,"Boston, Massachusetts",450000,Accidental Data Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nCalifornia Public Employees\' Retirement System (CalPERS),8/22/07,Government & Military,"Sacramento, California",445000,Accidental Data Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nAffinity Health Plan,4/21/10,Healthcare & Medical Providers,"Bronx, New York",409262,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nSt. Joseph Health System,2/4/14,Healthcare & Medical Providers,"Suwanee, Georgia",405000,Malicious Outsider,Identity Theft,Yes,Digital,"SSN,DOB,ADD,MED,ACC,NAM",0%,,,http://www.kbtx.com/home/headlines/St-Joseph-Health-System-Confirms-Data-Security-Incident-243558231.html,http://www.beckershospitalreview.com/healthcare-information-technology/data-breach-at-st-joseph-health-system-affects-400k.html,Breach Level Index,\nAVAST Software,5/26/14,Technology,California,400000,Malicious Outsider,Account Access,Yes,Digital,"PSS,LOG,EMA",33%,,,http://blog.avast.com/2014/05/26/avast-forum-offline-due-to-attack/,http://www.infosecurity-magazine.com/view/38576/av-firm-avast-shuts-online-forum-after-hack-attack/,Breach Level Index,\nAaron Brothers,4/17/14,Retail & Merchant,"Coppell, Texas",400000,Malicious Outsider,,,,,,,,,,Privacy Rights Clearinghouse,\nSpartanburg Regional Hospital,5/27/11,Healthcare & Medical Providers,"Spartanburg, South Carolina",400000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\n"Cambridge Who\'s Who Publishing, Inc.",2/24/11,Other,"Uniondale, New York",400000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\n"Aetna, Nationwide, WellPoint Group Health Plans, Humana Medicare, Mutual of Omaha Insurance Company, Anthem Blue Cross Blue Shield via Concentra Preferred Systems",12/12/06,Healthcare & Medical Providers,"Dayton, Ohio",396279,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nBoeing,12/13/06,Other,"Seattle, Washington",382000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nMarsh and Mercer,7/12/10,Financial and Insurance Services,"Washington, District Of Columbia",378000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nProvidence Home Services,1/25/06,Healthcare & Medical Providers,"Portland, Oregon",365000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nCitibank,6/9/11,Financial and Insurance Services,"New York, New York",360000,Malicious Outsider,,,,,,,,,,Privacy Rights Clearinghouse,\nUniversity of North Carolina at Charlotte,2/15/12,Educational Institutions,"Charlotte, North Carolina",350000,Accidental Data Loss,,,,,,,,,,Privacy Rights Clearinghouse,\n"NongHyup Life Insurance Co,NongHyup Financial Group Inc",1/5/14,Financial and Insurance Services,South Korea,350000,Malicious Insider,,Yes,Digital,"PII,FIN",0%,,,http://english.yonhapnews.co.kr/news/2014/04/16/0200000000AEN20140416008600320.html,http://english.yonhapnews.co.kr/business/2014/04/16/18/0503000000AEN20140416008600320F.html,Breach Level Index,\nU.S. Department of Agriculture (USDA),2/15/06,Government & Military,"Washington, District Of Columbia",350000,Accidental Data Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nChildren\'s Healthcare of Atlanta,10/30/13,Healthcare & Medical Providers,Atlanta,346000,Malicious Insider,Existential Data,Yes,Digital,"IP,MED,FIN,PII",0%,,Yes,http://www.bizjournals.com/atlanta/news/2013/10/28/childrens-healthcare-says-exec-stole.html,,Breach Level Index,\nDavidson County Election Commission,12/28/07,Government & Military,"Nashville, Tennessee",337000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nLink Staffing Services,10/27/06,Other,"Houston, Texas",332000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nUniversity of Florida College of Dentistry,11/12/08,Educational Institutions,"Gainesville, Florida",330000,Malicious Outsider,,,,,,,,,,Privacy Rights Clearinghouse,\nAmerican Institute of Certified Public Accountants (AICPA),5/16/06,Nonprofit,"New York, New York",330000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nLifeblood,2/13/08,Healthcare & Medical Providers,"Memphis, Tennessee",321000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nLexisNexis,3/10/05,Other,"Dayton, Ohio",310000,Malicious Insider,,,,,,,,,,Privacy Rights Clearinghouse,\nUniversity of Maryland,2/19/14,Educational Institutions,"College Park, Maryland",309079,Malicious Outsider,,,,,,,,,,Privacy Rights Clearinghouse,\nMaricopa County Community College District ,2/19/14,Educational Institutions,Maryland,309079,Malicious Outsider,Identity Theft,Yes,Digital,"SSN,DOB,NAM",0%,,,http://www.diamondbackonline.com/news/article_b8236dea-99b6-11e3-92eb-0017a43b2370.html,http://umd.edu/datasecurity/,Breach Level Index,\nNebraska Treasurer\'s Office,6/29/06,Government & Military,"Lincoln, Nebraska",309000,Malicious Outsider,,,,,,,,,,Privacy Rights Clearinghouse,\nIllinois Dept. of Financial and Professional Regulation,5/19/07,Government & Military,"Chicago, Illinois",300000,Malicious Outsider,,,,,,,,,,Privacy Rights Clearinghouse,\n"Restaurant Depot, Jetro Cash & Carry",12/16/11,Retail & Merchant,"College Point, New York",300000,Malicious Outsider,,,,,,,,,,Privacy Rights Clearinghouse,\n Affinity Gaming,3/14/13,Financial and Insurance Services,Nevada,300000,Malicious Outsider,Financial Access,Yes,Digital,CCN,0%,,No,http://fredw-catharsisours.blogspot.com/2013/12/8-arrested-december-29-2013-by-spain.html,,Breach Level Index,\nAffinity Gaming ,4/28/14,Other,Nevada,300000,Malicious Outsider,Financial Access,Yes,Digital,CCN,0%,,,http://www.reviewjournal.com/business/casinos-gaming/affinity-gaming-reports-second-data-breach,http://news.softpedia.com/news/Casino-Operator-Affinity-Gaming-Hacked-Again-440724.shtml,Breach Level Index,\nTowers Perrin,1/9/07,Financial and Insurance Services,"New York, New York",300000,Malicious Insider,,,,,,,,,,Privacy Rights Clearinghouse,\nHorizon Blue Cross Blue Shield,1/29/08,Healthcare & Medical Providers,"Newark, New Jersey",300000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nNorthwest Florida State College,2/28/13,Other,"Niceville, Florida",300000,Malicious Outsider,Identity Theft,Unknown,Digital,"SSN,FIN,DOB,PII,NAM",0%,unknown,No,http://www.huffingtonpost.com/2012/10/10/northwest-florida-state-college-records_n_1956136.html,,Breach Level Index,\nLook Tours LLC,11/15/06,Retail & Merchant,"North Las Vegas, Nevada",300000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nCbr Systems,1/28/13,Healthcare & Medical Providers,"San Bruno, California",300000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nCord Blood Registry,3/3/11,Healthcare & Medical Providers,"San Francisco, California",300000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\n"Southern California Medical-Legal Consultants, Inc. (SCMLC)",6/12/11,Other,"Seal Beach, California",300000,Accidental Data Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nNorth Dakota University,3/6/14,Educational Institutions,"Bismarck, North Dakota",290780,Malicious Outsider,,,,,,,,,,Privacy Rights Clearinghouse,\nUniversity of Maryland,2/19/14,Educational Institutions,Maryland,287580,Malicious Outsider,Identity Theft,Yes,Digital,"SSN,DOB,NAM",0%,,,http://www.diamondbackonline.com/news/article_b8236dea-99b6-11e3-92eb-0017a43b2370.html,http://umd.edu/datasecurity/,Breach Level Index,\nSally Beauty Supply LLC,2/15/14,Retail & Merchant,Texas,282000,Malicious Outsider,Financial Access,Yes,Digital,CCN,0%,,,http://www.dallasnews.com/business/headlines/20140305-sally-beauty-supply-latest-retailer-to-say-it-may-have-a-breach.ece,http://bits.blogs.nytimes.com/2014/03/05/sally-beauty-investigating-possible-credit-card-theft/?_php=true&_type=blogs&_r=0,Breach Level Index,\nUtah Department of Health,4/6/12,Government & Military,"Salt Lake City, Utah",280000,Malicious Outsider,,,,,,,,,,Privacy Rights Clearinghouse,\nUniversity of Southern California (USC),7/12/05,Educational Institutions,"Los Angeles, California",270000,Accidental Data Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nMemorial Blood Centers,12/5/07,Healthcare & Medical Providers,"Duluth, Minnesota",268000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\n"Hortica (Florists_ã_ Mutual Insurance Company), UPS",4/6/07,Financial and Insurance Services,"Edwardsville, Illinois",268000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\n"Sisters of St. Francis Health Services via Advanced Receivables Strategy (ARS), a Perot Systems Company",10/23/06,Healthcare & Medical Providers,"Indianapolis, Indiana",266200,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nAmeriprise Financial Inc.,12/25/05,Financial and Insurance Services,"Minneapolis, Minnesota",262000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nTD Bank,10/8/12,Financial and Insurance Services,"Cherry Hill, New Jersey",260000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nWisconsin Department of Health and Family Services,1/8/08,Government & Military,"Madison, Wisconsin",260000,Accidental Data Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nFlorida Agency for Workforce Innovation,12/2/08,Government & Military,"Tallahassee, Florida",259193,Accidental Data Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nTwitter,2/13/13,Technology,California,250000,Malicious Outsider,Account Access,Unknown,Digital,"PSS,EMA,LOG",30%,yes,No,https://groups.google.com/forum/?fromgroups#!topic/macvisionaries/uzzXFpDJAOM,http://forums.theregister.co.uk/forum/1/2013/02/02/twitter_breach_leaks_user_data/,Breach Level Index,\nNational Archives and Records Administration,5/19/09,Government & Military,"College Park, Maryland",250000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nNational Archives and Records Administration,11/6/09,Government & Military,"College Park, Maryland",250000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nLos Angeles County Child Support Services,3/30/07,Government & Military,"Los Angeles, California",243000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nErnst & Young,6/1/06,Other,"New York, New York",243000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nBoston Globe (The New York Times Company) and The Worcester Telegram & Gazette,1/31/06,Other,"Boston, Massachusetts",240000,Accidental Data Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nAkron Children\'s Hospital,10/26/06,Healthcare & Medical Providers,"Akron, Ohio",235903,Malicious Outsider,,,,,,,,,,Privacy Rights Clearinghouse,\nWestern Connecticut State University,11/30/12,Educational Institutions,"Danbury, Connecticut",235000,Accidental Data Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nU.S. and foreign computers,4/18/14,Other,United States,234000,Malicious Outsider,Nuisance,Yes,Digital,VIRUS,0%,,Yes,http://www.justice.gov/opa/pr/2014/June/14-crm-584.html,http://news.hamlethub.com/bethel/publicsafety/40981-fbi-targets-gameover-botnet-1401803843,Breach Level Index,\nSeacoast Radiology,1/12/11,Healthcare & Medical Providers,"Rochester, New Hampshire",231400,Malicious Outsider,,,,,,,,,,Privacy Rights Clearinghouse,\nMortgage Lenders Network USA,5/23/06,Financial and Insurance Services,"Middletown, Connecticut",231000,Malicious Insider,,,,,,,,,,Privacy Rights Clearinghouse,\nTexas Commission on Law Enforcement Standards and Education,5/19/07,Government & Military,"Austin, Texas",230000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nHartford Financial Services Group,10/30/07,Financial and Insurance Services,"Hartford, Connecticut",230000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\n"Emory Healthcare, Emory University Hospital",4/18/12,Healthcare & Medical Providers,"Atlanta, Georgia",228000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nDavidson Companies,1/30/08,Financial and Insurance Services,"Great Falls, Montana",226000,Malicious Outsider,,,,,,,,,,Privacy Rights Clearinghouse,\nOklahoma Housing Finance Agency,4/29/09,Government & Military,"Oklahoma City, Oklahoma",225000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\n"Sutherland Healthcare Solutions,  Department of Health Services and Department of Public Health,city of hope",2/5/14,Healthcare & Medical Providers,California,220000,Malicious Outsider,Identity Theft,Yes,Digital,"CCN,MED,SSN,DOB,ADD,NAM",0%,,,http://monrovia.patch.com/groups/politics-and-elections/p/personal-patient-info-was-stolen-from-la-county-health-services-and-public-health_304cc6ce-monrovia,https://oag.ca.gov/system/files/Sutherland%20Breach%20Notice%20FINAL%20March%203%202013_1.pdf?,Breach Level Index,\nMassachusetts Executive Office of Labor and Workforce Development  (EOLWD),5/17/11,Government & Military,"Harrisburg, Pennsylvania",210000,Malicious Outsider,,,,,,,,,,Privacy Rights Clearinghouse,\nU.S. Marine Corp,3/30/06,Government & Military,"Monterey, California",207750,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nArmy Reserve/Serco Inc.,5/13/10,Government & Military,"Morrow, Georgia",207000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nMarriott International Inc.,12/28/05,Retail & Merchant,"Orlando, Florida",206000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nBlue Cross and Blue Shield of Georgia,7/29/08,Healthcare & Medical Providers,"Atlanta, Georgia",202000,Accidental Data Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nNorthwest Florida State College,10/10/12,Educational Institutions,"Niceville, Florida",200050,Malicious Outsider,,,,,,,,,,Privacy Rights Clearinghouse,\nWest Virginia Public Employees Insurance Agency,10/23/07,Healthcare & Medical Providers,"Charleston, West Virginia",200000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nCollegeInvest,4/22/08,Nonprofit,"Denver, Colorado",200000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nDigital River Inc.,6/4/10,Financial and Insurance Services,"Eden Prairie, Minnesota",200000,Malicious Outsider,,,,,,,,,,Privacy Rights Clearinghouse,\nOfficeMax,2/9/06,Retail & Merchant,"Naperville, Illinois",200000,Malicious Outsider,,,,,,,,,,Privacy Rights Clearinghouse,\nTD Ameritrade,4/20/05,Financial and Insurance Services,"Omaha, Nebraska",200000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nUniversity of Texas McCombs  School of Business,4/23/06,Educational Institutions,"Austin, Texas",197000,Malicious Outsider,,,,,,,,,,Privacy Rights Clearinghouse,\nCommunity College of Southern Nevada,5/14/07,Educational Institutions,"North Las Vegas, Nevada",197000,Malicious Outsider,,,,,,,,,,Privacy Rights Clearinghouse,\nFidelity Investments,3/23/06,Financial and Insurance Services,"Boston, Massachusetts",196000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nEl Centro Regional Medical Center,5/15/13,Healthcare & Medical Providers,"El Centro, California",189489,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\n"Nelnet Inc., UPS",7/18/06,Other,"Lincoln, Nebraska",188000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nIndiana Family and Social Services Administration,6/13/13,Government & Military,Indiana,187533,Accidental Data Loss,Identity Theft,Unknown,Digital,"MED,SSN,PII,FIN,DOB,EMA,",0%,unknown,No,http://www.fox19.com/story/22733672/indiana-welfare-clients-info-possibly-breached,http://www.in.gov/activecalendar/EventList.aspx?fromdate=7/1/2013&todate=7/1/2013&display=Month&type=public&eventidn=109586&view=EventDetails&information_id=183960,Breach Level Index,\nBlueCross BlueShield Assn.,10/6/09,Healthcare & Medical Providers,"Chicago, Illinois",187000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nSan Jose Medical Group,4/8/05,Healthcare & Medical Providers,"San Jose, California",187000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nU.S. Department of Veteran Affairs,11/16/07,Government & Military,"Washington, District Of Columbia",185000,Malicious Insider,,,,,,,,,,Privacy Rights Clearinghouse,\nMorningstar,6/4/13,Financial and Insurance Services,Illinois,182000,Malicious Outsider,Account Access,Unknown,Digital,"PSS,ADD,NAM,EMA",0%,YES,No,http://www.consumer.ftc.gov/features/feature-0014-identity-theft,http://documentresearch.morningstar.com/faq.pdf,Breach Level Index,\nMillennium Medical Management Resources,5/4/10,Healthcare & Medical Providers,"Westmont, Illinois",180111,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nWestern Illinios University,6/17/06,Educational Institutions,"Macomb, Illinois",180000,Malicious Outsider,,,,,,,,,,Privacy Rights Clearinghouse,\n"Polo Ralph Lauren, HSBC",4/15/05,Retail & Merchant,"New York, New York",180000,Malicious Outsider,,,,,,,,,,Privacy Rights Clearinghouse,\nVirginia Commonwealth University,11/11/11,Educational Institutions,"Richmond, Virginia",176567,Malicious Outsider,,,,,,,,,,Privacy Rights Clearinghouse,\nBoxee.tv,3/23/14,Other,United States,172000,Malicious Outsider,Existential Data,Exposed,Digital,"PSS,LOG,PII,IP,DOB,NAM,EMA",10%,,,http://www.techmeme.com/140401/p33#a140401p33,,Breach Level Index,\nWisconsin Department of Revenue via Ripon Printers,1/1/07,Government & Military,"Madison, Wisconsin",171000,Accidental Data Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nValdosta State University,2/19/10,Educational Institutions,"Valdosta, Georgia",170000,Malicious Outsider,,,,,,,,,,Privacy Rights Clearinghouse,\nLos Angeles County Department of Health/Sutherland Healthcare Solutions,3/6/14,Healthcare & Medical Providers,"Portland, Oregon",168000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nIowa Student Loan,9/2/05,Financial and Insurance Services,"West Des Moines, Iowa",165000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nChoicePoint,2/15/05,Other,"Alpharetta, Georgia",163000,Malicious Insider,,,,,,,,,,Privacy Rights Clearinghouse,\n"University of North Carolina, Chapel Hill",9/25/09,Educational Institutions,"Chapel Hill, North Carolina",163000,Malicious Outsider,,,,,,,,,,Privacy Rights Clearinghouse,\nButler University,5/29/14,Educational Institutions,Indiana,163000,Malicious Outsider,Identity Theft,Yes,Digital,PII,0%,,Yes,http://www.wthr.com/story/25900150/2014/06/29/data-breach-at-butler-exposes-nearly-200k-people,http://www.universityherald.com/articles/10157/20140630/personal-data-butler-breach-name-driver-license.htm,Breach Level Index,\nBoeing,11/19/05,Other,"Chicago, Illinois",161000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\n"University of California, Berkeley",5/7/09,Educational Institutions,"Berkeley, California",160000,Malicious Outsider,,,,,,,,,,Privacy Rights Clearinghouse,\nNeiman Marcus Group,4/25/07,Retail & Merchant,"Dallas, Texas",160000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nAdministrative Office of the Courts - Washington,5/9/13,Government & Military,"Olympia, Washington",160000,Malicious Outsider,,,,,,,,,,Privacy Rights Clearinghouse,\nAdministaff Inc.,10/16/07,Other,"Houston, Texas",159000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\n"Ankle and Foot Center of Tampa Bay, Inc.",1/29/11,Healthcare & Medical Providers,"Tampa Bay, Florida",156000,Malicious Outsider,,,,,,,,,,Privacy Rights Clearinghouse,\nTerraCom and YourTel America ,4/15/13,Other,Oklahoma,150543,Accidental Data Loss,Identity Theft,Unknown,Digital,PII,0%,yes,No,http://newsok.com/article/3809598,http://www.oklahomastar.com/index.php/sid/214491216/scat/84aeba5e9b6e1230,Breach Level Index,\n"GE Money ,  Iron Mountain",1/17/08,Financial and Insurance Services,"Boston, Massachusetts",150000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nPrescription Advantage,11/30/07,Healthcare & Medical Providers,"Boston, Massachusetts",150000,Unknown,,,,,,,,,,Privacy Rights Clearinghouse,\nDenver Election Commission,6/11/06,Government & Military,"Denver, Colorado",150000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nUniversity of Hawai\'i,6/18/05,Educational Institutions,"Honolulu, Hawaii",150000,Malicious Insider,,,,,,,,,,Privacy Rights Clearinghouse,\nCitigroup,6/27/13,Financial and Insurance Services,New York,150000,Malicious Outsider,Identity Theft,Unknown,Digital,"SSN,DOB,PII",0%,unknown,No,http://www.justice.gov/ust/eo/public_affairs/press/docs/2013/pr20130715_settlement_agreement.pdf,http://www.americanbanker.com/issues/178_137/through-software-glitch-citi-exposes-data-on-150000-customers-1060665-1.html,Breach Level Index,\nKentucky Personnel Cabinet via Bluegrass Mailing,9/29/06,Government & Military,"Frankfort, Kentucky",146000,Accidental Data Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nIndiana University,2/23/14,Educational Institutions,"Bloomington, Indiana",145966,Accidental Data Loss,Identity Theft,Exposed,Digital,"SSN,FIN,NAM,ADD,DOB,PII",0%,,,http://www.cnn.com/2014/02/26/us/indiana-university-data-exposure/,http://www.csmonitor.com/USA/Education/2014/0226/Data-breach-at-Indiana-University-Are-colleges-being-targeted,Breach Level Index,\nVirginia Polytechnic Institute and State University,8/28/13,Other,Virginia,145000,Malicious Outsider,Identity Theft,Yes,Digital,"DL,NAM,ADD,PII",0%,,No,http://www.scmagazine.com/human-error-leads-to-virginia-tech-computer-server-breach/article/313797/,http://www.hr.vt.edu/communication/accessofemployeeapplicationinfo/,Breach Level Index,\nMonterey County Department of Social Services,3/17/13,Government & Military,California,144493,Malicious Outsider,Identity Theft,Yes,Digital,"SSN,ADD,NAM,DOB,PHO",0%,,No,https://oag.ca.gov/system/files/School%20Lunch%20-%20English_0.pdf?,http://www.montereyherald.com/news/ci_24284986/computer-security-breech-exposes-information-thousands-monterey-residents,Breach Level Index,\nKiplinger Washington Editors Inc.,7/8/11,Other,"Washington, District Of Columbia",142000,Malicious Outsider,,,,,,,,,,Privacy Rights Clearinghouse,\nGeorgia Division of Public Health,5/17/07,Government & Military,"Atlanta, Georgia",140000,Malicious Outsider,,,,,,,,,,Privacy Rights Clearinghouse,\nMassachusetts Secretary of State Office,7/6/10,Government & Military,"Boston, Massachusetts",139000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\n"Massachusetts Secretary of State, Securities Division",7/7/10,Government & Military,"Boston, Massachusetts",139000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nOhio University,5/2/06,Educational Institutions,"Athens, Ohio",137000,Malicious Outsider,,,,,,,,,,Privacy Rights Clearinghouse,\nJohns Hopkins University and Johns Hopkins Hospital,2/7/07,Healthcare & Medical Providers,"Baltimore, Maryland",135000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nOklahoma State Department of Health,4/12/11,Government & Military,"Oklahoma City, Oklahoma",133000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nU.S. Department of Transportation,8/9/06,Government & Military,"Washington, District Of Columbia",132470,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nNational Guard Bureau,8/13/09,Government & Military,"Arlington, Virginia",131000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nLincoln Medical and Mental Health Center,6/30/10,Healthcare & Medical Providers,"Bronx, New York",130495,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nMerchant America,2/6/07,Retail & Merchant,"Camarillo, California",130000,Malicious Outsider,,,,,,,,,,Privacy Rights Clearinghouse,\nEastern Washington University,12/31/09,Educational Institutions,"Cheney, Washington",130000,Malicious Outsider,,,,,,,,,,Privacy Rights Clearinghouse,\nCommunity Health Center,2/6/14,Healthcare & Medical Providers,Connecticut,130000,Accidental Data Loss,Identity Theft,No,Digital,PII,0%,,Yes,http://articles.courant.com/2014-06-13/community/hc-middletown-data-breach-0614-20140613_1_hard-drive-patient-information-possible-data-breach,,Breach Level Index,\nSt. Mary\'s Hospital,2/8/07,Healthcare & Medical Providers,"Leonardtown, Maryland",130000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nWilcox Memorial Hospital,10/21/05,Healthcare & Medical Providers,"Lihue, Hawaii",130000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\n Lincoln Medical and Mental Health Center,3/15/13,Healthcare & Medical Providers,New York,130000,Accidental Data Loss,Identity Theft,Unknown,Digital,"MED,PII",0%,yes,No,https://www.accellion.com/blog/2010/07/hipaa-hazard-shipping-cds-via-fedex/,,Breach Level Index,\nWellPoint,4/8/08,Other,"Indianapolis, Indiana",128000,Accidental Data Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nSaint Mary\'s Regional Medical Center,7/24/08,Healthcare & Medical Providers,"Reno, Nevada",128000,Malicious Outsider,,,,,,,,,,Privacy Rights Clearinghouse,\nCollege Center for Library Automation (CCLA),8/10/10,Government & Military,"Tallahassee, Florida",126000,Accidental Data Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nKirkwood Community College,3/13/13,Other,"Cedar Rapids, Iowa",125000,Malicious Outsider,Identity Theft,Unknown,Digital,"SSN,DOB,PII",0%,NO,No,http://marion.patch.com/articles/fbi-investigates-as-sophisticated-hackers-illegally-access-125-000-personal-records-of-kirkwood-applicants,http://www.omaha.com/article/20130409/NEWS/704099911/1707,Breach Level Index,\n"Serco, Inc., Federal Retirement Thrift Investment Board",5/25/12,Financial and Insurance Services,"Reston, Virginia",123201,Malicious Outsider,,,,,,,,,,Privacy Rights Clearinghouse,\nBoston College,3/11/05,Educational Institutions,"Boston, Massachusetts",120000,Malicious Outsider,,,,,,,,,,Privacy Rights Clearinghouse,\n"League of Legends, Riot Games",8/20/13,Other,"Santa Monica, California",120000,Malicious Outsider,,,,,,,,,,Privacy Rights Clearinghouse,\nSt. Mary\'s Bank,6/24/13,Financial and Insurance Services,"Manchester, New Hampshire",115775,Malicious Outsider,Nuisance,No,Digital,VIRUS,0%,yes,No,http://doj.nh.gov/consumer/security-breaches/documents/st-marys-bank-20130712.pdf,http://paper.li/paulcdwyer/1343298783,Breach Level Index,\nSentry Insurance,7/29/06,Financial and Insurance Services,"Stevens Point, Wisconsin",112270,Malicious Insider,,,,,,,,,,Privacy Rights Clearinghouse,\nGander Mountain,9/11/07,Retail & Merchant,"Greensburg, Pennsylvania",112000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nWisconsin Department of Revenue,7/24/12,Government & Military,"Madison, Wisconsin",110795,Accidental Data Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nCentral Hadson Gas And Electric,3/13/13,Other,New York,110000,Malicious Outsider,Financial Access,Unknown,Digital,"CCN,ACC",0%,yes,No,http://caselaw.findlaw.com/us-7th-circuit/1620392.html,,Breach Level Index,\n"Twin America LLC, CitySights NY",12/16/10,Other,"New York, New York",110000,Malicious Outsider,,,,,,,,,,Privacy Rights Clearinghouse,\nCentral Hudson Gas & Electric,2/20/13,Nonprofit,"Poughkeepsie, New York",110000,Malicious Outsider,,,,,,,,,,Privacy Rights Clearinghouse,\nCrescent Healthcare,2/13/13,Healthcare & Medical Providers,California,109000,Malicious Outsider,Identity Theft,Unknown,Digital,"SSN,MED,PII",0%,unknown,No,http://www.beckershospitalreview.com/Healthcare-information-technology/crescent-Healthcare-notifies-patients-employees-of-data-breach.html,http://seclists.org/dataloss/2013/q1/124,Breach Level Index,\nMedical Marijuana Registry,8/3/13,Healthcare & Medical Providers,Colorado,107000,Accidental Data Loss,Identity Theft,Exposed,Digital,"MED,PII",0%,,No,http://www.colorado.gov/cs/Satellite/CDPHE-CHEIS/CBON/1251593016680,http://denver.cbslocal.com/2013/08/21/colorado-marijuana-patients-protest-privacy-breaches-2/,Breach Level Index,\nTufts University,4/11/05,Educational Institutions,"Boston, Massachusetts",106000,Malicious Outsider,,,,,,,,,,Privacy Rights Clearinghouse,\nConnecticut Department of Revenue Services,8/28/07,Government & Military,"Hartford, Connecticut",106000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nUnited States Department of Energy,7/22/13,Government & Military,"Washington, District Of Columbia",104179,Malicious Outsider,Identity Theft,Yes,Digital,"SSN,NAM,DOB,PII,ACC",0%,YES,No,http://www.theverge.com/2013/8/16/4628284/department-of-energy-hackers-steal-personal-data-from-14000-employees,http://www.scmagazine.com/department-of-energy-data-breach-affects-thousands/article/307752/,Breach Level Index,\nU.S. Department of Energy,8/16/13,Government & Military,"Washington, District Of Columbia",104000,Unknown,,,,,,,,,,Privacy Rights Clearinghouse,\nHealth Net Federal Services,2/27/08,Healthcare & Medical Providers,"Rancho Cordova, California",103000,Accidental Data Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nVirginia Department of Education,10/15/09,Educational Institutions,"Richmond, Virginia",103000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nMemorial Healthcare System (MHS),8/3/12,Healthcare & Medical Providers,,102153,Malicious Insider,,,,,,,,,,Privacy Rights Clearinghouse,\nGreenville County School District,11/27/06,Educational Institutions,"Greenville, South Carolina",101000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\n"Crescent Health Inc., Walgreens",2/22/13,Healthcare & Medical Providers,"Anaheim, California",100000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nBinghamton University,3/11/09,Educational Institutions,"Binghamton, New York",100000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nScribd Inc,3/13/13,Technology,California,100000,Malicious Outsider,Account Access,Unknown,Digital,PSS,0%,yes,No,http://www.bit-tech.net/news/bits/2013/04/05/scribd-breach/1,http://nakedsecurity.sophos.com/2013/04/05/scribd-worlds-largest-online-library-admits-to-network-intrusion-password-breach/,Breach Level Index,\nTransportation Security Administration (TSA),5/5/07,Government & Military,"Crystal City, Virginia",100000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nBaylor Health Care System Inc.,11/1/08,Healthcare & Medical Providers,"Dallas, Texas",100000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nKent State University,9/10/05,Educational Institutions,"Kent, Ohio",100000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\n"Alere Home Monitoring, Inc.",11/10/12,Healthcare & Medical Providers,"Livermore, California",100000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nFirst Trust Bank,12/1/05,Financial and Insurance Services,"Memphis, Tennessee",100000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nPayMaxx,2/25/05,Financial and Insurance Services,"Miramar, Florida",100000,Accidental Data Loss,,,,,,,,,,Privacy Rights Clearinghouse,\n"Naval Safety Center, United States Navy",7/7/06,Government & Military,"Norfolk, Virginia",100000,Accidental Data Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nPeninsula Orthopaedic Associates,4/11/09,Healthcare & Medical Providers,"Salisbury, Maryland",100000,Physical Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nUniversity of Utah,8/9/05,Educational Institutions,"Salt Lake City, Utah",100000,Malicious Outsider,,,,,,,,,,Privacy Rights Clearinghouse,\nFlorida Department of Children and Families,5/2/12,Government & Military,"Tallahassee, Florida",100000,Accidental Data Loss,,,,,,,,,,Privacy Rights Clearinghouse,\nIRS,6/17/13,Government & Military,"Washington, District Of Columbia",100000,Accidental Data Loss,Identity Theft,Unknown,Digital,"SSN,NAM,ADD,PII,EMA",0%,YES,No,https://bulk.resource.org/irs.gov/eo/doc/irs.gov.20130707.html,https://bulk.resource.org/irs.gov/eo/doc/irs.gov.20130702.pdf,Breach Level Index,')
var data = d3.csv("../sampleproject.csv");
var dataToPlot = d3.csv.parse("date,  Estimated Cost to Develop,estMillions,Total Life Cycle Cost,totMillions,Monies Spent to Date,spentMillions,estSchedule,notes,program\n1-Sep-2006,$628 Million,628.00,$3 billion,3000.00,0,0,1-Jan-2013,Contract Start,USAF ECSS\n1-Dec-2007,$628 Million,628.00,$3 billion,3000.00,$250 million,250,1-Jan-2013,,USAF ECSS\n1-Nov-2008,$1.325 Billion,1325.00,$3.7 billion,3700.00,$250 million,250,1-Jan-2016,Added functionality,USAF ECSS\n1-Dec-2009,$3.4 Billion,3400.00,$5.2 Billion,5200.00,$519 million,519,1-Apr-2016,,USAF ECSS\n1-Jan-2011,$3.4 Billion,3400.00,$5.2 Billion,5200.00,$986 Million,986,1-Sep-2018,,USAF ECSS\n1-Nov-2012,$8 billion (extrapolated),8000.00,$10 Billion (extrapolated),10000.00,$1.1 Billion,1100,1-Sep-2020,Program Terminated,USAF ECSS");
var margins = {top: 100, right: 100, bottom: 100, left: 100};
var title = d3.select("#chart-title")
  .text(dataToPlot[0].program);

// create a new empty array to hold the data
// var step = 2,
data = [];

data.push(dataToPlot.shift());

d3.select("#next").on("click", function() {
  var button = d3.select(this);
  console.log(button);
  data.push(dataToPlot.shift());
  failure.draw(data);
  console.log(dataToPlot.length);

  if(dataToPlot.length === 0) {
    console.log("the end!");
    console.log(d3.select(this));
    d3.select(this).property('disabled', true);
  }
});

d3.select("#prev").on("click", function() {
  if(data.length > 1) {
    dataToPlot.push(data.shift());
    failure.draw(data);
  }
  else {
    d3.select(this).property('disabled');
  }
});

var failure = d3.select("#chart")
  .append("svg")
  .chart("FailureChart")
  .width(900)
  .height(300)
  .margin({top: 20, bottom: 50, right: 20, left: 60});

//  failure.draw(data);


failure.draw(data);

// var pointAdd = setInterval(
//   function(){
//     dataToPlot.push(data[step]);
//     step += 1;
//     // stop once all data is plotted
//     if (step > data.length) {
//       clearInterval(pointAdd);
//     } else {
//       failure.draw(dataToPlot);
//     } 
//   }
// ,3000);




  // // bind to the input boxes and redraw
  // // the chart when the width/height values
  // // are changed
  // $("#width_box").on("keyup", function(e){
  //   var newWidth = +($(e.target).val());
  //   rects.width(newWidth);
  // });

  // $("#height_box").on("keyup", function(e){
  //   var newHeight = +($(e.target).val());
  //   rects.height(newHeight);
  // });

