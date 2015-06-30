/*global d3, pym */

d3.chart("MarginChart").extend("FailureChart", {

    initialize: function() {
      "use strict";

      var chart = this;
      chart.layers = {};

      chart.layers.yAxisBase = chart.base.select("g").append("g")
        .classed("axes", true);

      chart.layers.xAxisBase = chart.base.select("g").append("g")
        .classed("axes", true);

      chart.layers.areaBase1 = chart.base.select("g").append("g")
        .classed("area1", true);

      chart.layers.lineBase1 = chart.base.select("g").append("g")
        .classed("line1", true);

      chart.layers.areaBase2 = chart.base.select("g").append("g")
        .classed("area2", true);

      chart.layers.lineBase2 = chart.base.select("g").append("g")
        .classed("line2", true);

      chart.layers.initLine = chart.base.select("g").append("g")
        .classed("initline", true);

      chart.layers.ylabels = chart.base.select("g").append("g")
        .classed("y-labels", true);

      chart.layers.labelsBase = chart.base.select("g").append("g")
        .classed("area-label-base", true);

      chart.layers.defs = chart.base.select("g").append("defs");

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

      chart.layers.ylabels
        .attr("class", "y axis-label")
        .append("text")
          .attr("y", 0)
          .attr("x",0)
          .attr("dy", ".3em")
          .attr("dx", ".3em")
          .text("Cost, US$");

      // add axes layer 
      this.layer("x-axis", chart.layers.xAxisBase, {
        modes : ["web", "tablet"],
        dataBind: function(data) {
          return this.selectAll(".x")
            .data([data]);
        },

        // insert x axis
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
              .ticks(5)
              .outerTickSize(0)
              .tickFormat(d3.time.format("%Y"));

            chart.base.select(".x.axis")
            .transition()
              .duration(chart.duration())
              .call(xAxis);

            return selection;
          }
        }

      });

      this.layer("y-axis", chart.layers.yAxisBase, {
        modes : ["web", "tablet"],
        dataBind: function(data) {
          return this.selectAll(".y")
            .data([data]);
        },

        // insert y axis
        insert: function() {
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
              .outerTickSize(0)
              .tickFormat(function(d) { 
                if ( d >= 1e3 ) {
                  return (d / 1e3) + " Billion";
                }
                else if (d > 0) {
                  return d + " Million";
                }
                else {
                  return "";
                }
              });

            chart.base.select(".y.axis")
            .transition()
              .duration(chart.duration())
              .call(yAxis);

            return selection;
          }
        }

      });

      this.layer("spentMask", chart.layers.defs.append("clipPath").attr("id", "spent-clip"), {
        dataBind: function(data) {
          return this.selectAll("rect")
            .data([data]);
        },

        insert: function() {
          var selection = this
            .append("rect");

          return selection;
        },

        events: {
          "merge" : function() {
            var chart = this.chart();
            var selection = this;

            selection
              .attr("width", function (d) {
                return d.length > 1 ? chart.xScale(d[d.length-2].dateObject) : 0;
              })
              .attr("height", chart.height());
          },

          "merge:transition" : function() {
            var chart = this.chart();
            var selection = this;

            selection
              .delay(chart.duration())
              .duration(chart.duration()*3)
              .attr("width", function (d) {
                return d.length > 1 ? chart.xScale(d[d.length-1].dateObject) : 0;
              });
          } 
        }
      });

      this.layer("projectedMask", chart.layers.defs.append("clipPath").attr("id", "project-clip"), {
        dataBind: function(data) {
          return this.selectAll("rect")
            .data([data]);
        },

        insert: function() {
          var selection = this
            .append("rect");

          return selection;
        },

        events: {
          "merge" : function() {
            var chart = this.chart();
            var selection = this;

            selection
              .attr("x", function (d) {
                return chart.xScale(d[d.length-1].dateObject);
              })
              .attr("width", 0)
              .attr("height", chart.height());
          },

          "merge:transition" : function() {
            var chart = this.chart();
            var selection = this;

            selection
              .delay(chart.data.length > 1 ? chart.duration()*4 : 0)
              .duration(chart.duration()*3)
              .attr("width", function (d) {
                return chart.xScale(d[d.length-1].schedObject);
              });
          } 
        }
      });

      // add area layer 1
      this.layer("totarea", chart.layers.areaBase1, {
        modes : ["web", "tablet"],
        dataBind: function(data) {
          return this.selectAll("g")
            .data(data);
        },

        // insert area 1
        insert: function() {
          var selection = this.append("g");

          return selection;
        },

        events: {
          "merge" : function() {
            var chart = this.chart();
            var selection = this;
            var area1 = d3.svg.area()
              .x(function(d) { return chart.xScale(d.x); })
              .y0(function(d) { return chart.yScale(d.y0); })
              .y1(function(d) { return chart.yScale(d.y1); }); 

            var area2 = d3.svg.area()
              .x(function(d) { return chart.xScale(d.x); })
              .y0(function(d) { return chart.yScale(d.y0); })
              .y1(function(d) { return chart.yScale(d.y2); });           

            selection.attr("clip-path", function (d,i) {
              return i === chart.data.length - 1 ? "url(#project-clip)" : null; 
            });

            selection.selectAll("path.total")
              .data(function(d) { return [d.projection]; })
              .attr("d", area2)
            .enter()
              .append("path")
              .attr("class", "area total")
              .transition().delay(chart.duration())
              .attr("d", area2);

            selection.selectAll("path.dev")
              .data(function(d) { return [d.projection]; })
              .attr("d", area1)
            .enter()
              .append("path")
              .attr("class", "area dev")
              .transition().delay(chart.duration()).duration(chart.duration())
              .attr("d", area1);
      
            return selection;
          },

          "exit" : function() {
            this.remove();
          }
        }

      });

      //add area labels
      this.layer("arealabels", chart.layers.labelsBase, {
        dataBind: function(data) {
          console.log(data.slice(-1));
          return this.selectAll(".area-labels")
            .data([data.slice(-1)]);
        },

        //insert labeles
        insert: function() {
          var selection = this
            .append("g");

          var descText = selection.append("text");

          descText
            .append("tspan")
              .attr("class", "total-desc");

          descText
            .append("tspan")
              .attr("class", "total");

          var devText = selection.append("text");

          devText
            .append("tspan")
              .attr("class", "dev-desc");
          devText    
            .append("tspan")
              .attr("class", "dev");

          return selection;
        },

        events: {
          "merge" : function() {
            var chart = this.chart();
            var selection = this;

            selection
              .attr("class", "area-labels");

            selection.select(".dev-desc")
              .attr("x", chart.width())
              .attr("y", function (d, i) { console.log(i); console.log(d); console.log(selection.datum()); console.log(selection.data()); return chart.yScale(d[0].estMillions); })
              .attr("dx", 0)
              .attr("dy", "-1em")
              .attr("text-anchor", "end")
              .text("");

            selection.select(".dev")
              .attr("x", chart.width())
              .attr("y", function (d, i) { console.log(i); console.log(d); console.log(selection.datum()); console.log(selection.data()); return chart.yScale(d[0].estMillions); })
              .attr("dx", 0)
              .attr("dy", 0)
              .attr("text-anchor", "end")
              .text("");

            selection.select(".total-desc")
              .attr("x", chart.width())
              .attr("y", function (d, i) { console.log(i); console.log(d); console.log(selection.datum()); console.log(selection.data()); return chart.yScale(d[0].totMillions); })
              .attr("dx", 0)
              .attr("dy", "-1em")
              .attr("text-anchor", "end")
              .text("");

            selection.select(".total")
              .attr("x", chart.width())
              .attr("y", function (d, i) { console.log(i); console.log(d); console.log(selection.datum()); console.log(selection.data()); return chart.yScale(d[0].totMillions); })
              .attr("dx", 0)
              .attr("dy", 0)
              .attr("text-anchor", "end")
              .text("");
          },

          "merge:transition" : function() {
            var chart = this.chart();
            var selection = this;

            selection.select(".dev-desc")
              .delay(chart.duration()*6)
              .text("Development Cost:");

            selection.select(".dev")
              .delay(chart.duration()*6)
              .text(function (d) { return d[0]["Estimated Cost to Develop"]; });

            selection.select(".total-desc")
              .delay(chart.duration()*6)
              .text("Total Lifecycle Cost:");

            selection.select(".total")
              .delay(chart.duration()*6)
              .text(function (d) { return d[0]["Total Life Cycle Cost"];});
          }
        }
      });

      // add area layer 2
      this.layer("spentarea", chart.layers.areaBase2.append("g")
              .attr("clip-path", "url(#spent-clip)"), {
        dataBind: function(data) {
          return this.selectAll("path.area")
            .data([data]);
                
        },

        // insert area 2
        insert: function() {
          var selection = this
            .append("path");

          return selection;
        },

        events: {
          "merge" : function() {
            var chart = this.chart();
            var selection = this;

            // var line = d3.svg.line()
            //   .x(function(d) {
            //     return chart.xScale(d.dateObject);
            //   })
            //   .y(function(d) {
            //     return chart.yScale(d.spentMillions);
            //   });

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
              .attr("d", area);

            return selection;
          },
        }

      });


      // add initial estimate line
      this.layer("initline", chart.layers.initLine, {
        modes : ["web", "tablet"],
        dataBind: function(data) {
          return this.selectAll("line.line")
            .data([data]);
                
        },

        // insert line
        insert: function() {
          var selection = this.append("svg:line");

          return selection;
        },

        events: {
          "merge" : function() {
            var chart = this.chart();
            var selection = this;

            selection
              .attr("x1", 0)
              .attr("y1", chart.yScale(chart.data[0].estMillions))
              .attr("y2", chart.yScale(chart.data[0].estMillions));

            selection
              .attr("class", "line");
              
            return selection;
          },

          "merge:transition" : function() {
            var chart = this.chart();
            var selection = this;

            if ( chart.data.length > 1 ) {
              selection
                .duration(chart.duration())
                .attr("x2", chart.width());
            }
            else {
              selection
                .attr("x2", 0);
            }
            
          }
        },
      });

    },

    transform: function(data) {
      "use strict";
      var chart = this;

      var formatString = d3.time.format("%-d-%b-%Y");

      chart.data = data;

      //update x scale domain
      var mindate = formatString.parse(data[0].dateOriginal);
      var maxdate = formatString.parse(data[data.length-1].schedOriginal);

      var maxTot = d3.max(data, function (d) { 
        return d.totMillions;
      });

      chart.xScale.domain([mindate,maxdate]);

      //update y scale domain
      chart.yScale.domain([0,maxTot]);

      return data;
    },

});

d3.csv("sampleproject.csv", function (data) {
  "use strict";
  var container = d3.select("#chart");
  var parWidth = container.node().parentNode.offsetWidth;
  var margins = {top: 35, bottom: 70, right: 20, left: 100};
  var width = parWidth - margins.left - margins.right;
  var height = width * 3.5 / 8;
  var milestone = 1; // counter to keep track of chart state

  var formatString = d3.time.format("%-d-%b-%Y");

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

    d.projection = [
      {x: d.dateObject, y2: d.spentMillions, y1: d.spentMillions, y0: d.spentMillions},
      {x: d.schedObject, y2: d.totMillions, y1: d.estMillions, y0: d.spentMillions}
    ];

    // d.totProjection = [
    //   {x: d.dateObject, y: d.spentMillions, y0: d.spentMillions},
    //   {x: d.schedObject, y: d.totMillions, y0: d.spentMillions}
    // ];

    console.log("data point processed");
    console.log(d.projection);
  });

  data.sort(function(a,b){return a.dateObject.getTime() - b.dateObject.getTime();});

  d3.select("#chart-title")
    .text(data[0].program);

  var buttons = d3.selectAll(".button");

  buttons.on("click", function() {
    var button = d3.select(this);

    if ( button.classed("inactive") !== true ) {
      if ( button.attr("id") === "reset" ) {
        milestone = 1;
      }
      else if ( button.attr("id") === "next" ) {
        milestone++;
      }
      else if ( button.attr("id") === "prev" ) {
        milestone--;
      }

      failure.draw(data.slice(0, milestone));

      if ( milestone > 1 ) {
        buttons.classed("inactive", false);
      }
      else {
        buttons.classed("inactive", true);
      }

      if ( milestone < data.length ) {
        d3.select("#next").classed("inactive", false);
      } 
      else {
        d3.select("#next").classed("inactive", true);
      }
    }

  });

  var failure = d3.select("#chart")
    .append("svg")
    .chart("FailureChart")
    .duration(300)
    .width(width)
    .height(height)
    .margin(margins);

  failure.draw(data.slice(0, milestone));

  var pymChild = new pym.Child();
  pymChild.sendHeight();

});
