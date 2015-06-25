/*global d3, pym */

d3.chart("MarginChart").extend("SystemsChart", {

  initialize: function() {
    "use strict";

    // Private properties and methods
    this._lineData = "line";
    this._xData = "x";
    this._yData = "y";

    var chart = this;
    chart.layers = {};

    chart.layers.yAxisBase = chart.base.select("g").append("g")
      .classed("axes", true);

    chart.layers.xAxisBase = chart.base.select("g").append("g")
      .classed("axes", true);

    chart.layers.datapointBase = chart.base.select("g").append("g")
      .classed("data-series", true);


    // create an xScale
    this.xScale = d3.scale.linear()
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

  
    // add axes layer 
    this.layer("x-axis", chart.layers.xAxisBase, {
      modes : ["web", "tablet"],
      dataBind: function(data) {
        return this.selectAll(".x")
          .data([data]);
      },

      // insert area 1
      insert: function() {
        var chart = this.chart();
        var selection = this.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + chart.height() + ")");

        selection.append("g")
          .attr("class", "x axis-label")
          .append("text")
            .attr("y", 0)
            .attr("x", chart.width() / 2)
            .attr("dy", "3em")
            .attr("dx", "0")
            .text("Number of Legacy Systems to Replace")
            .attr("text-anchor", "middle");

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
            .duration(300)
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

      // insert area 1
      insert: function() {
        var selection = this.append("g")
          .attr("class", "y axis");

        selection.append("g")
            .attr("class", "y axis-label")
            .append("text")
              .attr("y", 0)
              .attr("x",0)
              .attr("dy", ".32em")
              .attr("dx", "9")
              .text("Cost, US$");

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
            .outerTickSize(0).tickFormat(chart._yformat || function(d) {
              if ( d >= 1e9 ) {
                return (d / 1e9) + " Billion";
              }
              else if (d >= 1e6) {
                return (d / 1e6) + " Million";
              }
              else {
                return "";
              }
            });

          chart.base.select(".y.axis")
          .transition()
            .duration(300)
            .call(yAxis);

          return selection;
        },

      }

    });

    // create a layer of line segments
    // first, create a new group element on the base of the chart
    this.layer("datapoints", chart.layers.datapointBase, {

      // select the elements we wish to bind to and
      // bind the data to them.
      dataBind: function(data) {
        return this.selectAll("g.datapoint")
          .data(data);
      },

      // insert actual circles
      insert: function() {
        return this.append("g");
      },

      // define lifecycle events
      events: {

        // paint new elements, but set their radius to 0
        // and make them red
        "enter": function() {
          var chart = this.chart();
          var selection = this;

          selection
            .attr("class", "datapoint");

          // var line = d3.svg.line()
          //     .x(function(d) { return chart.xScale(d[chart.xData()]); })
          //     .y(function(d) { return chart.yScale(d[chart.yData()]); })
          //     .interpolate("linear");

          // selection.selectAll("path")
          //   .data(function(d) { return [d[chart.lineData()]]; })
          // .enter().append("path")
          //   .attr("d", function(d) { return line(d.slice(0,1)); })
          //   .attr("stroke-width", 5)
          //   .attr("stroke", "black")
          // .transition().duration(1000)
          //   .attr("d", function(d) { return line(d); });

          selection.append("line")
            .attr("x1", function(d) {
              return chart.xScale(d[chart.lineData()][0][chart.xData()]);
            })
            .attr("y1", function(d) {
              return chart.yScale(d[chart.lineData()][0][chart.yData()]);
            })
            .attr("x2", function(d) {
              return chart.xScale(d[chart.lineData()][1][chart.xData()]);
            })
            .attr("y2", function(d) {
              return chart.yScale(d[chart.lineData()][1][chart.yData()]);
            })
            .attr("class", "invisible-line")
            .attr("stroke", "black")
            .attr("stroke-width", 15)
            .style("opacity", 0);


          selection.append("line")
            .attr("x1", function(d) {
              return chart.xScale(d[chart.lineData()][0][chart.xData()]);
            })
            .attr("y1", function(d) {
              return chart.yScale(d[chart.lineData()][0][chart.yData()]);
            })
            .attr("x2", function(d) {
              return chart.xScale(d[chart.lineData()][0][chart.xData()]);
            })
            .attr("y2", function(d) {
              return chart.yScale(d[chart.lineData()][0][chart.yData()]);
            })
            .attr("class", "line")
            .attr("stroke", "black")
            .attr("stroke-width", 0);

          

          // selection.append("circle")
          //   .attr("cx", function(d) {
          //     console.log(d[chart.lineData()][1][chart.xData()]);
          //     console.log(chart.xScale(0));
          //     return chart.xScale(d[chart.lineData()][1][chart.xData()]);
          //   })
          //   .attr("cy", function(d) {
          //     var systems;
          //     if ( d[chart.lineData()][1].cost !== null ) {
          //       return chart.yScale(d[chart.lineData()][1].cost);
          //     }
          //     else {
          //       return chart.yScale(d[chart.lineData()][0].cost);
          //     }
          //   })
          //   .attr("r", 0)
          //   .attr("class", function(d) { return d[chart.lineData()][1].milestone; })
          //   .style("fill", "red");


          selection.append("circle")
            .attr("cx", function(d) {
              return chart.xScale(d[chart.lineData()][0][chart.xData()]);
            })
            .attr("cy", function(d) {
              return chart.yScale(d[chart.lineData()][0][chart.yData()]);
            })
            .attr("r", 0)
            .attr("class", function(d) { return d[chart.lineData()][0].milestone; })
            .style("fill", "green");

          

          // add a mouseover listener to our groups
          // and change their color and broadcast a chart
          // brush event to any listeners.
          selection.on("mouseover", function() {
            var el = d3.select(this);
            // el.selectAll("circle.complete")
            //   .style("stroke", function(d) {
            //   if (d[chart.lineData()][1]["systems to replace"] === 0 || null && this.classed("start")) {
            //     return "none";
            //   }
            //   else {
            //     return "gray";
            //   }
            // })
            //   .style("stroke-width", "3")
            //   .attr("r", function(d) {
            //   if (d[chart.lineData()][1]["systems to replace"] === 0 || null) {
            //     return 0;
            //   }
            //   else {
            //     return 8;
            //   }
            // });

            el.selectAll(".line")
              .attr("x2", function(d) {
                return chart.xScale(d[chart.lineData()][0][chart.xData()]);
              })
              .attr("y2", function(d) {
                return chart.yScale(d[chart.lineData()][0][chart.yData()]);
              })
              .attr("marker-end", "")
              .transition().duration(1000)
              .attr("x2", function(d) {
                return chart.xScale(d[chart.lineData()][1][chart.xData()]);
              })
              .attr("y2", function(d) {
                return chart.yScale(d[chart.lineData()][1][chart.yData()]);
              })
              .transition().duration(1000)
              .attr("marker-end", function(d) {
                if (d[chart.lineData()][1][chart.xData()] === 0 || null) {
                  return "url(#markerExplode)";
                }
                else{
                  return "url(#markerCircle)";
                }
              });

            el.selectAll("circle.start")
              .style("stroke", "gray")
              .style("stroke-width", "3")
              .attr("r", 8);

            el.selectAll(".line")
              .style("stroke", "gray")
              .style("stroke-width", "3");

            el
              .append("g")
                .attr("class","tt")
              .append("text")
                .attr("y", function(d) { return chart.yScale(d[chart.lineData()][1].cost); })
                .attr("x", function(d) { return chart.xScale(d[chart.lineData()][0]["systems to replace"]); })
                .attr("dy", "-.5em")
                .attr("dx", 0)
                .attr("class", "ttText")
                .text(function(d) { return d.project; });

            var ttText = d3.select("text.ttText");

            ttText.call(chart.wrap, 140);

            if (ttText.attr("x") > chart.width() * 0.8 ) {
              ttText
                .attr("text-anchor","end")
                .attr("dx", "-.5em");
            }

            chart.trigger("brush", this);
          });

          this.on("mouseout", function() {
            var el = d3.select(this);
            el.selectAll("circle")
              .style("stroke", "none")
              .attr("r", 5);

            el.selectAll(".line")
              .style("stroke", "black")
              .style("stroke-width", "2");

            el.select(".tt").remove();

            chart.trigger("unbrush", this);
          });

        },
        // then transition them to a radius of 5 and change
        // their fill to blue
        "enter:transition": function() {
          var chart = this.chart();
          this.selectAll("circle.start").transition().duration(500)
            .attr("r", 5);

          this.selectAll("line.line")
            .attr("stroke-width", 2)
            .attr("marker-end", "")
          .transition().delay(500).duration(1000)
            .attr("x2", function(d) {
                return chart.xScale(d[chart.lineData()][1][chart.xData()]);
              })
            .attr("y2", function(d) {
              return chart.yScale(d[chart.lineData()][1][chart.yData()]);
            })
          .transition().duration(1000)
            .attr("marker-end", function(d) {
              if (d[chart.lineData()][1][chart.xData()] === 0 || null) {
                return "url(#markerExplode)";
              }
              else{
                return "url(#markerCircle)";
              }
            });


          // this.selectAll("circle.complete").delay(1500)
          //   .attr("r", 5);

        }
      }
    });
  },

  transform: function(data) {
    "use strict";
    var chart = this;

    // var format = d3.time.format("%B 20%y");
    // var formatString = d3.time.format("%-d-%b-%Y");
    // var bisectDate = d3.bisector(function(d) { return d.dateObject; }).left;

    chart.data = data;

    // data.forEach(function(d) {


    //   // if ( d.currency === "C$" ) {
    //   //   console.log("Canadian $!");
    //   //   for (var i in d.milestones) {
    //   //     console.log(i);
    //   //     if (d.milestones[i].cost !== null) {
    //   //       d.milestones[i].cost = d.milestones[i].cost * 0.9;
    //   //     }
    //   //   }
    //   // }

    //   // d.dateOriginal = d.date;
    //   // d.formattedDate = formatString.parse(d.date);
    //   // d.dateObject = new Date(d.date);
    //   // //d.date = format(d.dateObject);
      
    //   // d.schedOriginal = d.estSchedule;
    //   // d.formattedDate = formatString.parse(d.estSchedule);
    //   // d.schedObject = new Date(d.estSchedule);
    //   // //d.sched = format(d.schedObject);
      

    //   // d.estMillions = (parseInt(d.estMillions) > 0) ? parseInt(d.estMillions) : 0;
    //   // d.totMillions = (parseInt(d.totMillions) > 0) ? parseInt(d.totMillions) : 0;
    //   // d.spentMillions = (parseInt(d.spentMillions) > 0) ? parseInt(d.spentMillions) : 0;

    //   // d.projection = [
    //   //   {x: d.dateObject, y2: d.spentMillions, y1: d.spentMillions, y0: d.spentMillions},
    //   //   {x: d.schedObject, y2: d.totMillions, y1: d.estMillions, y0: d.spentMillions}
    //   // ];
    // });

    console.log(data);

    // var sorted = data.sort(function(a,b){ return b.date - a.date; });
    // var sortedByDate = data.sort(function(a,b){return a.dateObject.getTime() - b.dateObject.getTime();});
    // var mindate = formatString.parse(sortedByDate[0].dateOriginal);
    // var maxdate = formatString.parse(sortedByDate[data.length-1].schedOriginal);

    // var maxTot = d3.max(data, function (d) { 
    //   return d.totMillions;
    // });

    //update x scale domain
    //chart.xScale.domain([mindate,maxdate]);
    chart.xScale.domain([d3.max(data, function (d) {
        console.log(chart);
        console.log(chart.lineData());
        var maxX = d[chart.lineData()].reduce(function (a,b) {
          return d3.max([a[chart.xData()],b[chart.xData()]]);
        });
        return maxX;
      }),0])
      .nice();

    //update y scale domain
    chart.yScale.domain([0,d3.max(data, function (d) {
        var maxY = d[chart.lineData()].reduce(function (a,b) {
          return d3.max([a[chart.yData()],b[chart.yData()]]);
        });
        return maxY;
      })])
      .nice(6);

    return data;
  },

  lineData: function(newLineData) {
    "use strict";
    if (arguments.length === 0) {
      return this._lineData;
    }

    var oldLineData = this._lineData;

    if ( oldLineData !== newLineData) {
      this._lineData = newLineData;
    }

    return this;
  },

  xData: function(newXData) {
    "use strict";
    if (arguments.length === 0) {
      return this._xData;
    }

    var oldXData = this._xData;

    if ( oldXData !== newXData) {
      this._xData = newXData;
    }

    return this;
  },

  yData: function(newYData) {
    "use strict";
    if (arguments.length === 0) {
      return this._yData;
    }

    var oldYData = this._yData;

    if ( oldYData !== newYData) {
      this._yData = newYData;
    }

    return this;
  },

  wrap: function(text, width) {
    "use strict";
    text.each(function() {
      var text = d3.select(this),
          words = text.text().split(/\s+/).reverse(),
          word,
          line = [],
          lineNumber = 0,
          lineHeight = 1.1, // ems
          y = text.attr("y"),
          dy = parseFloat(text.attr("dy")),
          tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
      while ((word = words.pop())) {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
        }
      }
    });
  }

});

d3.csv("systems-to-replace.csv", function (data) {
  "use strict";

  console.log(data);
  var container = d3.select("#chart");
  var parWidth = container.node().parentNode.offsetWidth;
  var margins = {top: 20, bottom: 70, right: 20, left: 100};
  var width = parWidth - margins.left - margins.right;
  var height = width * 9 / 16;

  data = d3.nest()
    .key(function(d) { return d.project; })
    .entries(data);

  console.log(data);

  data.forEach(function (d) {
    d.project = d.values[0].project;
    d.url = d.values[0].url;
    d.currency = d.values[0].currency;
    d.milestones = d.values.map(function (point, i) { 
      var ii = i;
      console.log(ii);
      while( point.cost === "null" || "" ) {
        ii++;
        point.cost = d.values[ii].cost;
        console.log(point.cost);
      }
      return {
        "cost": point.cost === "null" || "" ? null : +point.cost,
        "milestone": point.milestone,
        "systems to replace": point["systems to replace"] === "null" || "" ? null : +point["systems to replace"]
      }; 
    });

    // d.costs = d.values.map(function (i) { return i.cost; });
    // d.milestones = d.values.map(function (i) { return i.milestone; });
    // d["systems to replace"] = d.values.map(function (i) { return i["systems to replace"]; });

    delete d.key;
    delete d.values;
  });

  console.log(data);  

  var systems = container
    .append("svg")
    .chart("SystemsChart")
    .width(parWidth - margins.left - margins.right)
    .height(height)
    .margin(margins)
    .lineData("milestones")
    .xData("systems to replace")
    .yData("cost");

  var defs = container.select("svg")
    .append("defs");

  defs.append("circle")
    .attr("id", "circle-base")
    .attr("class", "circle-base")
    .attr("cx", "5")
    .attr("cy", "5")
    .attr("r", "2.5");

  defs.append("marker")
    .attr("id", "markerCircle")
    .attr("markerWidth", 10)
    .attr("markerHeight", 10)
    .attr("refX", 5)
    .attr("refY", 5)
    .append("use")
      .attr("xlink:href", "#circle-base")
      .attr("class", "marker");

  defs.append("marker")
    .attr("id", "markerExplode")
    .attr("markerWidth", 17)
    .attr("markerHeight", 17)
    .attr("refX", 5)
    .attr("refY", 5)
    .append("polygon")
      .attr("xmlns", "http://www.w3.org/2000/svg")
      .attr("id", "explode")
      .attr("points", "3308.65 2406.83 3327.34 2456.77 3401.65 2434.83 3364.77 2484.77 3458.88 2534.32 3357.97 2557.89 3371.65 2610.83 3325.65 2580.06 3299.85 2650.38 3273.45 2573.91 3188.36 2600.69 3244.87 2545.09 3178.65 2504.83 3257.59 2483.83 3214.65 2425.55 3271.59 2447.03")
      .attr("transform", "translate(-143.5,-108.3) scale(.045)")
      .attr("class", "marker");

  defs.append("marker")
    .attr("id", "markerArrow")
    .attr("markerWidth", 13)
    .attr("markerHeight", 13)
    .attr("refX", 2)
    .attr("refY", 6)
    .attr("orient", "auto")
    .append("path")
      .attr("d", "M2,2 L2,11 L10,6 L2,2");

  systems.draw(data);

  var pymChild = new pym.Child();
  pymChild.sendHeight();

});
