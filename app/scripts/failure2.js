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
        // modes : ["web", "tablet"],
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
                if ( d >= 1e9 ) {
                  return (d / 1e9) + " Billion";
                }
                else if (d > 1e6) {
                  return (d / 1e6) + " Million";
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
      this.layer("projarea", chart.layers.areaBase1, {
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
          "enter" : function() {
            var chart = this.chart();
            var selection = this;
            var area = d3.svg.area()
              .x(function(d) { return chart.xScale(d.x); })
              .y0(function(d) { return chart.yScale(d.y0); })
              .y1(function(d) { return chart.yScale(d.y1); }); 

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

            var projections = selection.selectAll("path.projection")
              .data(function(d) { return d.projections; });

            projections.enter()
              .append("path")
              .attr("class", function(d) { return "projection " + d.class; })
              .attr("d", function(d) { return area(d.area); });

            projections
              .exit().remove();

            // selection.selectAll("path.total")
            //   .data(function(d) { return [d.projection]; })
            //   .attr("d", area2)
            // .enter()
            //   .append("path")
            //   .attr("class", "area total")
            //   .transition().delay(chart.duration())
            //   .attr("d", area2);

            // selection.selectAll("path.dev")
            //   .data(function(d) { return [d.projection]; })
            //   .attr("d", area1)
            // .enter()
            //   .append("path")
            //   .attr("class", "area dev")
            //   .transition().delay(chart.duration()).duration(chart.duration())
            //   .attr("d", area1);
      
            return selection;
          },

          "merge" : function() {
            var chart = this.chart();
            var selection = this;
            var area = d3.svg.area()
              .x(function(d) { return chart.xScale(d.x); })
              .y0(function(d) { return chart.yScale(d.y0); })
              .y1(function(d) { return chart.yScale(d.y1); }); 

            selection.attr("clip-path", function (d,i) {
              return i === chart.data.length - 1 ? "url(#project-clip)" : null; 
            });

            var projections = selection.selectAll("path.projection")
              .data(function(d) { return d.projections; })
              .attr("d", function(d) { return area(d.area); });

            projections
              .exit().remove();

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
            .data(data.slice(-1));
        },

        //insert labeles
        insert: function() {
          var selection = this
            .append("g");

          // var descText = selection.append("text");

          // descText
          //   .append("tspan")
          //     .attr("class", "total-desc");

          // descText
          //   .append("tspan")
          //     .attr("class", "total");

          // var devText = selection.append("text");

          // devText
          //   .append("tspan")
          //     .attr("class", "dev-desc");
          // devText    
          //   .append("tspan")
          //     .attr("class", "dev");

          return selection;
        },

        events: {
          "merge" : function() {
            var chart = this.chart();
            var selection = this;

            selection
              .attr("class", "area-labels");

            var labels = selection.selectAll("text")
              .data(function(d) { return d.projections; });

            labels.enter()
                .append("text")
                .attr("class", function(d) { return "label " + d.class; });

            labels
              .exit().remove();

            // var label = selection.selectAll("text.label");

            // label.exit().remove();

            labels.selectAll("tspan").remove();

            labels.append("tspan")
              .attr("x", chart.width())
              .attr("y", function(d) { return chart.yScale(d.area[d.area.length - 1].y1); })
              .attr("dy", "-1em")
              .attr("class", "desc")
              .text("");

            labels.append("tspan")
              .attr("x", chart.width())
              .attr("y", function(d) { return chart.yScale(d.area[d.area.length - 1].y1); })
              .attr("dy", 0)
              .attr("class", "num")
              .text("");

            // selection.select(".dev-desc")
            //   .attr("x", chart.width())
            //   .attr("y", function (d, i) { console.log(i); console.log(d); console.log(selection.datum()); console.log(selection.data()); return chart.yScale(d[0][chart.yData()[1]]); })
            //   .attr("dx", 0)
            //   .attr("dy", "-1em")
            //   .attr("text-anchor", "end")
            //   .text("");

            // selection.select(".dev")
            //   .attr("x", chart.width())
            //   .attr("y", function (d, i) { console.log(i); console.log(d); console.log(selection.datum()); console.log(selection.data()); return chart.yScale(d[0][chart.yData()[1]]); })
            //   .attr("dx", 0)
            //   .attr("dy", 0)
            //   .attr("text-anchor", "end")
            //   .text("");

            // selection.select(".total-desc")
            //   .attr("x", chart.width())
            //   .attr("y", function (d, i) { console.log(i); console.log(d); console.log(selection.datum()); console.log(selection.data()); return chart.yScale(d[0][chart.yData()[2]]); })
            //   .attr("dx", 0)
            //   .attr("dy", "-1em")
            //   .attr("text-anchor", "end")
            //   .text("");

            // selection.select(".total")
            //   .attr("x", chart.width())
            //   .attr("y", function (d, i) { console.log(i); console.log(d); console.log(selection.datum()); console.log(selection.data()); return chart.yScale(d[0][chart.yData()[2]]); })
            //   .attr("dx", 0)
            //   .attr("dy", 0)
            //   .attr("text-anchor", "end")
            //   .text("");
          },

          "merge:transition" : function() {
            var chart = this.chart();
            var selection = this;

            selection.selectAll(".desc")
              .delay(chart.duration()*6)
              .text(function(d) { return d.name + ":"; });

            selection.selectAll(".num")
              .delay(chart.duration()*6)
              .text(function (d) {
                console.log("update area labels"); 
                console.log(d.area[d.area.length-1].y1);
                var cost = d.area[d.area.length-1].y1;
                if ( cost >= 1e9 ) {
                  return (cost / 1e9) + " Billion";
                }
                else if (cost > 1e6) {
                  return (cost / 1e6) + " Million";
                }
                else {
                  return cost;
                }
              });

            // selection.select(".total-desc")
            //   .delay(chart.duration()*6)
            //   .text("Total Lifecycle Cost:");

            // selection.select(".total")
            //   .delay(chart.duration()*6)
            //   .text(function (d) {
            //     var cost = d[0][chart.yData()[2]];
            //     if ( cost >= 1e9 ) {
            //       return (cost / 1e9) + " Billion";
            //     }
            //     else if (cost > 1e6) {
            //       return (cost / 1e6) + " Million";
            //     }
            //     else {
            //       return cost;
            //     }
            //   });
          },

          "exit" : function() {
            this.remove();
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
              .y1(function(d) { return chart.yScale(d.spent); });


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
              .attr("y1", chart.yScale(chart.data[0][chart.yData()[1].name]))
              .attr("y2", chart.yScale(chart.data[0][chart.yData()[1].name]));

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

      var formatString = d3.time.format.iso;

      chart.data = data;

      //update x scale domain
      var mindate = formatString.parse(data[0].dateOriginal);
      var maxdate = formatString.parse(data[data.length-1].schedOriginal);

      var maxCost = d3.max(data, function (d) {
        var seriesMaxes = []; 
        chart.yData().forEach(function (series) {
          seriesMaxes.push(d[series.name]);
        });
        console.log(d3.max(seriesMaxes));
        return d3.max(seriesMaxes);
        // return d[chart.yData()[2]] || d[chart.yData()[1]];
      });

      chart.xScale.domain([mindate,maxdate]);

      //update y scale domain
      chart.yScale.domain([0,maxCost]);

      return data;
    },

});

d3.csv("failures-7-24.csv", function (data) {
  "use strict";
  var container = d3.select("#chart");
  var parWidth = container.node().parentNode.offsetWidth;
  var margins = {top: 35, bottom: 70, right: 20, left: 100};
  var width = parWidth - margins.left - margins.right;
  var height = width * 3.5 / 8;

  var milestone = 1; // counter to keep track of chart state
  var currentProjectID = 0; 

  var formatString = d3.time.format("%b %Y");

  var potentialSeries = [
    { "name": "Monies Spent to Date", "class": "spent" },
    { "name": "Estimated Cost to Develop", "class": "dev-est" },
    { "name": "Total Life Cycle Cost", "class": "tot-est" },
    { "name": "Annual Maintenance & Operational Costs", "class": "annual-est" }
  ];

  data = d3.nest()
    .key(function(d) { return d.Program; })
    .entries(data);

  console.log(data);

  data.forEach(function (d) {
    // var series = [
    //   "Estimated Cost to Develop",
    //   "Total Life Cycle Cost",
    //   "Annual Maintenance & Operational Costs",
    //   "Monies Spent to Date"
    //   ];

    // series.forEach(function(potentialSeries) {
    //   var seriesValues = d.values.map(function (milestone) {
    //       return milestone[potentialSeries];
    //     });
    // });

    var prevValue = {};
    
    potentialSeries.forEach (function (series) {
      prevValue[series.name] = null;
    });

    function parseCostString (data, key) {
      // console.log(data[key]);
      // console.log(prevValue);
      if (data[key] === "") {
        return prevValue[key];
      }
      else {
        prevValue[key] = +data[key];
        return prevValue[key];
      }
    }

    d.Program = d.values[0].Program;
    d.Currency = d.values[0].Currency;

    d.milestones = d.values.map(function (milestone) { 
      var dateObject = new Date(milestone.date);
      var schedObject = new Date(milestone["Estimated Schedule"]);

      var estimated = parseCostString(milestone,"Estimated Cost to Develop");
      var total = parseCostString(milestone,"Total Life Cycle Cost");
      var annual = parseCostString(milestone,"Annual Maintenance & Operational Costs");
      var spent = parseCostString(milestone,"Monies Spent to Date");

      // console.log(estimated);
      // console.log(total);
      // console.log(annual);
      // console.log(spent);
      var datapoint = {
        "dateOriginal": milestone.date,
        "formattedDate": formatString(dateObject),
        "dateObject": dateObject,

        "schedOriginal": milestone["Estimated Schedule"],
        "formattedSched": formatString(schedObject),
        "schedObject": schedObject,

        "notes": milestone.Notes,

        "estimated": estimated,
        "total": total,
        "annual": annual,
        "spent": spent,

        "projection": [
          {
            x: dateObject,
            y0: spent !== null ? spent : 0,
            y1: spent !== null ? spent : 0,
            y2: spent !== null ? spent : 0,
            y3: spent !== null ? spent : 0
          },
          {
            x: schedObject,
            y0: spent !== null ? spent : 0,
            y1: estimated,
            y2: total,
            y3: annual,
          }
        ],

        "projections" :  potentialSeries.filter(function(entry) {
            return entry.class !== "spent" && milestone[entry.name] !== "";
          })
          .map(function(entry) {
            var baseline = spent !== null ? spent : 0;
            return {
                "name": entry.name,
                "class": entry.class,
                "area": [
                  { "x": dateObject, "y1": baseline, "y0": baseline },
                  { "x": schedObject, "y1": parseCostString(milestone, entry.name), "y0": baseline }
                ]
              };
          })

      };

      potentialSeries.forEach (function (series) {
        datapoint[series.name] = parseCostString(milestone,series.name);
      });

      return datapoint; 
    });

    d.milestones.sort(function(a,b){return a.dateObject.getTime() - b.dateObject.getTime();});

    d.series = d3.entries(prevValue)
      .filter(function(entry) {
          return entry.value !== null;
        })
      .map(function(entry) { return entry.key; });

    delete d.key;
    delete d.values;

    // d.dateOriginal = d.date;
    // d.formattedDate = formatString.parse(d.date);
    // d.dateObject = new Date(d.date);
    // //d.date = format(d.dateObject);
    
    // d.schedOriginal = d.estSchedule;
    // d.formattedDate = formatString.parse(d.estSchedule);
    // d.schedObject = new Date(d.estSchedule);
    // //d.sched = format(d.schedObject);
    

    // d.estMillions = (parseInt(d.estMillions) > 0) ? parseInt(d.estMillions) : 0;
    // d.totMillions = (parseInt(d.totMillions) > 0) ? parseInt(d.totMillions) : 0;
    // d.spentMillions = (parseInt(d.spentMillions) > 0) ? parseInt(d.spentMillions) : 0;

    // d.projection = [
    //   {x: d.dateObject, y2: d.spentMillions, y1: d.spentMillions, y0: d.spentMillions},
    //   {x: d.schedObject, y2: d.totMillions, y1: d.estMillions, y0: d.spentMillions}
    // ];

    // // d.totProjection = [
    // //   {x: d.dateObject, y: d.spentMillions, y0: d.spentMillions},
    // //   {x: d.schedObject, y: d.totMillions, y0: d.spentMillions}
    // // ];

    console.log("data point processed");
    // console.log(d.projection);
  });

  // data.sort(function(a,b){return a.dateObject.getTime() - b.dateObject.getTime();});

  console.log(data);

  var projectSelector = d3.select("#project-selector");

  projectSelector.selectAll("option")
    .data(data)
  .enter().append("option")
    .attr("value", function(d, i){ return i; })
    .text(function(d){ return d.Program; });

  projectSelector.on("change", function() {
    currentProjectID = this.value;
    resetChart(currentProjectID);
  });

  var buttons = d3.selectAll(".button");

  var pymChild = new pym.Child();

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

      failure.draw(data[currentProjectID].milestones.slice(0, milestone));
      console.log(data[currentProjectID].milestones[milestone-1].formattedDate);
      d3.select("#notes")
        .html("<strong>" +
          data[currentProjectID].milestones[milestone-1].formattedDate +
          ": </strong>" +
          data[currentProjectID].milestones[milestone-1].notes);

      pymChild.sendHeight();

      if ( milestone > 1 ) {
        buttons.classed("inactive", false);
      }
      else {
        buttons.classed("inactive", true);
      }

      if ( milestone < data[currentProjectID].milestones.length ) {
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
    .margin(margins)
    .yData(potentialSeries);

  resetChart(currentProjectID);

  function resetChart(i) {
    d3.select("#chart-title")
      .text(data[i].Program);

    milestone = 1;

    buttons.classed("inactive", true);
    d3.select("#next").classed("inactive", false);

    d3.select("#notes")
      .html("<strong>" +
        data[currentProjectID].milestones[milestone-1].formattedDate +
        ": </strong>" +
        data[currentProjectID].milestones[milestone-1].notes);
    
    failure.draw(data[i].milestones.slice(0, milestone));

    pymChild.sendHeight();
  }

  

});
