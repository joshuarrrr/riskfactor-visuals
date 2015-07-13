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

      chart.layers.areaBase2 = chart.base.select("g").append("g")
        .classed("area2", true);

      chart.layers.initLine = chart.base.select("g").append("g")
        .classed("initline", true);

      chart.layers.ylabels = chart.base.select("g").append("g")
        .classed("y-labels", true);

      chart.layers.labelsBase = chart.base.select("g").append("g")
        .classed("area-label-base", true);

      chart.layers.infoBoxBase = d3.select(".info-box");

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
              .outerTickSize(0);

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
                return chart.formatMoney(d);
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
              .delay(function() {
                if (chart.data[chart.data.length - 1].spent.value > 0) {
                  return chart.duration()*4;
                }
                else {
                  return chart.duration();
                }
              })
              .duration(chart.duration()*3)
              .attr("width", function (d) {
                return chart.xScale(d[d.length-1].schedObject);
              });
          } 
        }
      });

      // add area layer 1
      this.layer("projarea", chart.layers.areaBase1, {
        // modes : ["web", "tablet"],
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

            // var area1 = d3.svg.area()
            //   .x(function(d) { return chart.xScale(d.x); })
            //   .y0(function(d) { return chart.yScale(d.y0); })
            //   .y1(function(d) { return chart.yScale(d.y1); }); 

            // var area2 = d3.svg.area()
            //   .x(function(d) { return chart.xScale(d.x); })
            //   .y0(function(d) { return chart.yScale(d.y0); })
            //   .y1(function(d) { return chart.yScale(d.y2); });           

            selection
              .attr("clip-path", function (d,i) {
                return i === chart.data.length - 1 ? "url(#project-clip)" : null; 
              });

            // var projections = selection.selectAll("path.projection")
            //   .data(function(d) { return d.projections; });

            // projections.enter()
            //   .append("path")
            //   .attr("class", function(d) { return "projection " + d.class; })
            //   .attr("d", function(d) { return area(d.area); });

            // projections
            //   .exit().remove();

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

            selection
              .classed("initial", function(d,i) {
                if ( i === 0 || d.dateOriginal === chart.data[0].dateOriginal) {
                  return true;
                }
                else {
                  return false;
                }
              });

            selection
              .classed("selected", function(d,i) {
                if ( i === chart.data.length - 1 || d.dateOriginal === chart.data[chart.data.length - 1].dateOriginal) {
                  return true;
                }
                else {
                  return false;
                }
              });

            d3.select(selection[0][selection[0].length - 1])
              .classed("launch", function(d) { console.log(d.launch); return d.launch; });

            var projections = selection.selectAll("path.projection")
              .data(function(d) { return d.projections; })
              .attr("class", function(d) { return "projection " + d.class; })
              .attr("d", function(d) { return area(d.area); });

            projections.enter()
              .append("path")
              .attr("class", function(d) { return "projection " + d.class; })
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
            .data(data.slice(-1).filter(function (milestone) {
              return !milestone.launch;
            }));
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
              .delay(function() {
                if (chart.data[chart.data.length - 1].spent.value > 0) {
                  return chart.duration()*6;
                }
                else {
                  return chart.duration()*3;
                }
              })
              .text(function(d) { return d.name + ":"; });

            selection.selectAll(".num")
              .delay(function() {
                if (chart.data[chart.data.length - 1].spent.value > 0) {
                  return chart.duration()*6;
                }
                else {
                  return chart.duration()*3;
                }
              })
              .text(function (d) {
                return chart.formatMoney(d.area[d.area.length-1].y1, chart.data[0].currency);
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
              .y1(function(d) { return chart.yScale(d.spent.value); });


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
              .attr("y1", chart.yScale(chart.data[0][chart.yData()[2].name]))
              .attr("y2", chart.yScale(chart.data[0][chart.yData()[2].name]));

            selection
              .attr("class", "line");
              
            return selection;
          },

          "merge:transition" : function() {
            var chart = this.chart();
            var selection = this;

            if ( chart.data[0][chart.yData()[2].name] > 0 && chart.data[0].Program !== "California's Unemployment Insurance Modernization" && chart.data.length > 1 && chart.data[chart.data.length - 1][chart.yData()[2].name] / chart.data[0][chart.yData()[2].name] > 1.05) {
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

      this.layer("info-box", chart.layers.infoBoxBase, {
        dataBind: function(data) {
          return this.selectAll("div")
            .data([data[data.length - 1]]);   
        },

        insert: function() {
          var selection = this.append("div");

          return selection;
        },

        events: {
          "merge" : function() {
            var chart = this.chart();
            var selection = this;

            selection.selectAll("*").remove();

            selection.append("h4")
              .text(function (d) {
                if ( d.headline !== "" ){
                  return d.formattedDate + ": " + d.headline;
                }
                else {
                  return d.formattedDate;
                }
                
              });

            selection.selectAll("p")
              .data(function (d) { return d.notes.split("\n").filter(function (line) {
                  return line !== "";
                }); 
              })
            .enter().append("p")
              .html(function (d) {
                return d;
              });

            if (chart.data.length > 1) {
              if (selection.datum().spent.value > 0) {
                selection.append("p")
                  .text(function (d) {
                    return "Spent so far: " + chart.formatMoney(d.spent.value,d.currency);
                  });
              }

              if ( chart.data[0].Program !== "California's Unemployment Insurance Modernization" && Math.abs(selection.datum().estimated.change) > 0 ) {
                selection.append("p")
                  .text(function (d) {
                    var sign = d.estimated.change > 0 ? "+" : "";
                    var changeWord = d.estimated.change > 0 ? "increased" : "decreased";

                    return "Development estimate " +
                      changeWord +
                      " by " +
                      chart.formatMoney(d.estimated.change,d.currency) +
                      " (" +
                      sign +
                      (Math.round(100 * d.estimated.value / (d.estimated.value - d.estimated.change)) - 100) +
                      "%)";
                  });
              }
            }

            // selection.html(function (d) {
            //   return "<p><strong>" +
            //   d.formattedDate +
            //   ": </strong>" +
            //   d.notes +
            //   "</p><p>Spent so far: " +
            //   chart.formatMoney(d.spent.value,d.Currency) +
            //   "</p><p>Estimate increased by " +
            //   chart.formatMoney(d.estimated.change,d.Currency) +
            //   " (+" +
            //   (Math.round(100 * d.estimated.value / (d.estimated.value - d.estimated.change)) - 100) +
            //   "%)</p>";
            // });

          }
        }
      });

    },

    transform: function(data) {
      "use strict";
      var chart = this;

      var formatString = d3.time.format.iso;

      chart.data = data;

      data.forEach(function (datapoint) {
        datapoint.class = "datapoint";
      });

      data[0].class = "initial";
      data[data.length - 1].class = "selected";

      console.log(chart.data);

      //update x scale domain
      var mindate = formatString.parse(data[0].dateOriginal);
      var maxdate = d3.max(data, function (d) {
          return d3.max([formatString.parse(d.schedOriginal),formatString.parse(d.dateOriginal)]);
        });

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

    formatMoney: function(amount, currency) {
      "use strict";
      var formatted = currency ? currency : "";
      amount = Math.abs(amount);

      if ( typeof amount !== "number" && !isNaN(amount) ) {
        return "";
      }

      if ( amount === 0) {
        return "";
      }

      if ( amount >= 1e9 ) {
        formatted += (amount / 1e9).toFixed(2).replace(/^(\d+\.\d*?[1-9])0+$|(\.0*?)$/, "$1") + " Billion";
      }
      else if ( amount >= 1e6 ) {
        formatted += (amount / 1e6).toFixed(2).replace(/^(\d+\.\d*?[1-9])0+$|(\.0*?)$/, "$1") + " Million";
      }
      else {
        formatted += amount;
      }

      return formatted;
    }

});

d3.csv("failures-7-13.csv", function (data) {
  "use strict";
  var container = d3.select("#chart");
  var parWidth = container.node().parentNode.offsetWidth;
  var margins = {top: 30, bottom: 30, right: 20, left: 100};
  var width = parWidth - margins.left - margins.right;
  var height = width * 3.5 / 8;

  var milestone = 1; // counter to keep track of chart state
  var currentProjectID = 0; 

  var formatString = d3.time.format("%b %Y");

  var potentialSeries = [
    { "name": "Monies Spent to Date", "class": "spent" },
    { "name": "Total Life Cycle Cost", "class": "tot-est" },
    { "name": "Estimated Cost to Develop", "class": "dev-est" },
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
      var cost = {};
      // console.log(data[key]);
      // console.log(prevValue);
      if (data[key] === "") {
        cost = {"value":prevValue[key], "change": null};
      }
      else {
        cost = {"value":+data[key], "change": null};
        if (prevValue[0] > 0) {
          cost.change = data[key] - prevValue[key];
        }
        prevValue[key] = +data[key];
      }
      return cost;
    }

    var currency = d.values[0].Currency;
    d.Program = d.values[0].Program;
    d.Currency = currency;

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
        "currency": currency,
        "Program": d.Program,

        "dateOriginal": milestone.date,
        "formattedDate": formatString(dateObject),
        "dateObject": dateObject,

        "schedOriginal": milestone["Estimated Schedule"],
        "formattedSched": formatString(schedObject),
        "schedObject": schedObject,

        "launch" : milestone.date === milestone["Estimated Schedule"],

        "headline" : milestone.Headline,
        "notes": milestone.Notes,

        "estimated": estimated,
        "total": total,
        "annual": annual,
        "spent": spent,

        "projection": [
          {
            x: dateObject,
            y0: spent.value !== null ? spent.value : 0,
            y1: spent.value !== null ? spent.value : 0,
            y2: spent.value !== null ? spent.value : 0,
            y3: spent.value !== null ? spent.value : 0
          },
          {
            x: schedObject,
            y0: spent.value !== null ? spent.value : 0,
            y1: estimated.value,
            y2: total.value,
            y3: annual.value,
          }
        ],

        "projections" :  potentialSeries.filter(function(entry) {
            return entry.class !== "spent" && milestone[entry.name] !== "";
          })
          .map(function(entry) {
            var baseline = spent.value !== null ? spent.value : 0;
            return {
                "name": entry.name,
                "class": entry.class,
                "area": [
                  { "x": dateObject, "y1": baseline, "y0": baseline },
                  { "x": schedObject, "y1": parseCostString(milestone, entry.name).value, "y0": baseline }
                ]
              };
          })

      };

      potentialSeries.forEach (function (series) {
        datapoint[series.name] = parseCostString(milestone, series.name).value;
      });

      return datapoint; 
    });

    d.milestones.sort(function(a,b){return a.dateObject.getTime() - b.dateObject.getTime();});

    d.series = d3.entries(prevValue)
      .filter(function(entry) {
          return entry.value !== null;
        })
      .map(function(entry) { return entry.key; });

    d.initEstimate = d.milestones[0].estimated.value;
    d.initDeadline = d.milestones[0].schedObject;

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

  projectSelector.append("option")
    .attr("class", "placeholder")
    .property("selected", true)
    .property("disabled", true)
    .text("Choose a project…");

  projectSelector.selectAll("option:not(.placeholder)")
    .data(data)
  .enter().append("option")
    .attr("value", function(d, i){ return i; })
    .text(function(d){ return d.Program; });

  projectSelector.on("change", function() {
    currentProjectID = this.value;
    resetChart(currentProjectID);
  });

  var failure = d3.select("#chart")
    .append("svg")
    .classed("hidden", true)
    .chart("FailureChart")
    .duration(300)
    .width(width)
    .height(height)
    .margin(margins)
    .yData(potentialSeries);

  var buttons = d3.selectAll(".button");

  if ( failure.mode() === "mobile" ) {
    buttons
      .style("width", "100%")
      .style("margin", "0 0 1em")
      .style("padding", 0);

    margins.left = 20;

    failure
      .margin(margins)
      .width(container.node().parentNode.offsetWidth - 40)
      .height((container.node().parentNode.offsetWidth - 40) / 1.5);
  }

  var pymChild = new pym.Child();

  function resetChart(i) {
    location.hash = "#project-selector";

    d3.select("#chart-title")
      .text(data[i].Program);

    failure.base
      .classed("hidden", false);

    d3.select(".buttons")
      .classed("hidden", false);

    // d3.selectAll(".projection").remove();

    milestone = 1;
    // var currentMilestone = data[currentProjectID].milestones[1];

    buttons.classed("inactive", true);
    d3.select("#next").classed("inactive", false);

    // d3.select("#notes")
    //   .html("<p><strong>" +
    //     currentMilestone.formattedDate +
    //     ": </strong>" +
    //     currentMilestone.notes +
    //     "</p>");
    
    failure.draw(data[i].milestones.slice(0, milestone));

    pymChild.sendHeight();
  }

  buttons.on("click", function() {
    var button = d3.select(this);
    var currentMilestone;

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

      currentMilestone = data[currentProjectID].milestones[milestone-1];

      failure.draw(data[currentProjectID].milestones.slice(0, milestone));
      console.log(currentMilestone.formattedDate);
      
      // var notes = d3.select("#notes")
      //   .html("<p><strong>" +
      //     currentMilestone.formattedDate +
      //     ": </strong>" +
      //     currentMilestone.notes +
      //     "</p><p>Spent so far: " +
      //     failure.formatMoney(currentMilestone.spent.value,data[currentProjectID].Currency) +
      //     "</p><p>Estimate increased by " +
      //     failure.formatMoney(currentMilestone.estimated.change,data[currentProjectID].Currency) +
      //     " (+" +
      //     (Math.round(100 * currentMilestone.estimated.value / (currentMilestone.estimated.value - currentMilestone.estimated.change)) - 100) +
      //     "%)</p>");

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

  

  // resetChart(currentProjectID);

});
