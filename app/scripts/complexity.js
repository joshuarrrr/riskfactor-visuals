/*global d3, pym, ga */
var pymChild = new pym.Child();

d3.chart("MarginChart").extend("SystemsChart", {

  initialize: function() {
    "use strict";

    // Private properties and methods
    this._lineData = "line";
    this._dataLabel = "label";
    this._xData = "x";
    this._yData = "y";

    var chart = this;
    chart.layers = {};

    chart.gaProjectsHovered = 0;

    chart.layers.yAxisBase = chart.base.select("g").append("g")
      .classed("y-axis-base", true);

    chart.layers.xAxisBase = chart.base.select("g").append("g")
      .classed("x-axis-base", true);

    chart.layers.infoBoxBase = d3.select(chart.base.node().parentNode).insert("div")
      .attr("class", "circle-info-box");

    chart.layers.longDescription = d3.select(chart.base.node().parentNode).select(".long-description");

    chart.layers.lineBase = chart.base.select("g").append("g")
      .classed("data-series", true);

    chart.layers.datapointBase = chart.base.select("g").append("g")
      .classed("data-series", true);

    chart.layers.legendBase = chart.base.append("g")
      .classed("legend-base", true)
      .attr("transform", "translate(535, 55)");

    chart.layers.defs = chart.base.select("g").append("defs");


    // create an xScale
    if ( chart.xScaleType === "date" ) {
      this.xScale = d3.time.scale()
        .range([0, chart.width()]);
    }
    else {
      this.xScale = d3.scale.linear()
        .range([0, chart.width()]);
    }
    

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

    var legendValues = ["start", "to date", "end"];

    var legendItem = chart.layers.legendBase.selectAll(".legend-item")
      .data(legendValues)
    .enter().append("g")
      .classed("legend-item", true);

    // legendItem.append("circle")
    //   .attr("cx", function (d,i) { return 14 + (i * 70) - ((7 - (i > 0 ? legendValues[i-1].length : 7)) * 5); })
    //   .attr("cy", 5)
    //   .attr("r", 5)
    //   .attr("class", function(d) { return d.replace(" ", "-"); });

    // legendItem.append("text")
    //   .attr("x", function (d,i) { return i * 70 - ((7 - (i > 0 ? legendValues[i-1].length : 7)) * 5); })
    //   .attr("y", 0)
    //   .attr("dx", 24)
    //   .attr("dy", ".65em")
    //   .text(function (d) { return d; });

    legendItem.append("circle")
      .attr("cx", 0)
      .attr("cy", function (d,i) { return (i * 1.5) + "em"; })
      .attr("r", 5)
      .attr("class", function(d) { return d.replace(" ", "-"); });

    legendItem.append("text")
      .attr("x", 0)
      .attr("y", function (d,i) { return (i * 1.5) + "em"; }) 
      .attr("dx", 15)
      .attr("dy", ".35em")
      .text(function (d) { return d; });
  
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

        if ( chart.xScaleType !== "date") {  
          selection.append("g")
            .attr("class", "x axis-label")
            .append("text")
              .attr("y", 0)
              .attr("x", chart.width() / 2)
              .attr("text-anchor", "middle")
              .attr("dy", "3em")
              .attr("dx", "0")
              .text("Number of Legacy Systems to Replace");
        }

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

          if ( chart.xScaleType === "date" ) {  
            xAxis
              .tickFormat(d3.time.format("%Y"))
              .ticks(10);

            if ( chart.mode() === "mobile" ) {
              xAxis
                .ticks(5);
            }
          }

          chart.base.select(".x.axis")
          .transition()
            .duration(300)
            .call(xAxis);

          return selection;
        }
      }

    });

    this.layer("y-axis", chart.layers.yAxisBase, {
      // modes : ["web", "tablet"],
      dataBind: function(data) {
        return this.selectAll(".y")
          .data([data]);
      },

      // insert area 1
      insert: function() {
        var selection = this.append("g")
          .attr("class", "y axis");

        if ( chart.xScaleType !== "date" ) {  
          selection.append("g")
              .attr("class", "y axis-label")
              .append("text")
                .attr("y", 0)
                .attr("x", -9)
                .attr("dy", -20)
                .attr("dx", 0)
                .attr("text-anchor", "end")
                .text("US $");
        }
        else if ( chart.mode() !== "mobile" ) {
          selection.append("g")
              .attr("class", "y axis-label")
              .append("text")
                .attr("transform", "translate(-55," + chart.height() / 2 + ")rotate(-90)")
                .attr("y", 0)
                .attr("x", 0)
                .attr("dy", 0)
                .attr("dx", 0)
                .attr("text-anchor", "middle")
                .text("Number of Legacy Systems to Replace");
        }

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
                return (d / 1e9) + " billion";
              }
              else if (d >= 1e6) {
                return (d / 1e6) + " million";
              }
              else {
                return "";
              }
            });

          if ( chart.yScale.domain()[1] >= 1e9 ) {
            selection.select(".y.axis-label text")
              .attr("dy", -30)
              .text("US dollars,");

            selection.select(".y.axis-label").append("text")
              .attr("y", 0)
              .attr("x", -9)
              .attr("dy", -12)
              .attr("dx", 0)
              .attr("text-anchor", "end")
              .text("billions");

            yAxis.tickFormat(function(d) {
              return d > 0 ? (d / 1e9).toFixed(1) : "";
            });
            
          }
          else if ( chart.yScale.domain()[1] >= 1e6) {
            selection.select(".y.axis-label text")
              .text("US $, millions");

            yAxis.tickFormat(function(d) {
              return d > 0 ? (d / 1e6) : "";
            });
          }
          else {
            yAxis.tickFormat(function(d) {
              return d > 0 ? d : "";
            });
          }

          // if ( chart.mode() === "mobile" ) {
          if ( chart.mode() === "mobile" ) {
            if ( chart.yScale.domain()[1] >= 1e9 ) {
              selection.select(".y.axis-label text")
                .attr("x", - chart.margin().left)
                .attr("text-anchor", "start")
                .text("US $, billions");

              selection.select(".y.axis-label text:last-child").remove();

              yAxis.tickFormat(function(d) {
                return d > 0 ? (d / 1e9) : "";
              });
              
            }
            else if ( chart.yScale.domain()[1] >= 1e6) {
              selection.select(".y.axis-label text")
                .attr("x", - chart.margin().left)
                .attr("text-anchor", "start")
                .text("US $, millions");

              yAxis.tickFormat(function(d) {
                return d > 0 ? (d / 1e6) : "";
              });
            }
            else {
              yAxis.tickFormat(function(d) {
                return d > 0 ? d : "";
              });
            }
          }

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
            .attr("class", "datapoint")
            .classed("active", function(d,i) { return i === (chart.data.length - 1); });

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
         if ( chart.xScaleType !== "date" ) {
            var line = d3.svg.line()
              .x(function(d) { return chart.xScale(d[chart.xData()]); })
              .y(function(d) { return chart.yScale(d[chart.yData()]); }); 

            selection.selectAll(".invisible-line")
              .data(function(d) { return [d[chart.lineData()]]; }).enter()
              .append("path")
              .attr("class", "invisible-line")
              .attr("stroke", "black")
              .attr("stroke-width", 35)
              .attr("stroke-linecap", "round")
              .attr("fill", "none")
              // .style("opacity", .3)
              .style("opacity", 0)
              .attr("d", line);


            // selection.append("line")
            //   .attr("x1", function(d) {
            //     return chart.xScale(d[chart.lineData()][0][chart.xData()]);
            //   })
            //   .attr("y1", function(d) {
            //     return chart.yScale(d[chart.lineData()][0][chart.yData()]);
            //   })
            //   .attr("x2", function(d) {
            //     return chart.xScale(d[chart.lineData()][1][chart.xData()]);
            //   })
            //   .attr("y2", function(d) {
            //     return chart.yScale(d[chart.lineData()][1][chart.yData()]);
            //   })
            //   .attr("class", "invisible-line")
            //   .attr("stroke", "black")
            //   .attr("stroke-width", 15)
            //   .style("opacity", 0);

            selection.selectAll("path.line")
              .data(function(d) { return [d[chart.lineData()]]; }).enter()
              .append("path")
              .attr("class", "line")
              .attr("fill", "none")
              .attr("d", line);


            // selection.append("line")
            //   .attr("x1", function(d) {
            //     return chart.xScale(d[chart.lineData()][0][chart.xData()]);
            //   })
            //   .attr("y1", function(d) {
            //     return chart.yScale(d[chart.lineData()][0][chart.yData()]);
            //   })
            //   .attr("x2", function(d) {
            //     return chart.xScale(d[chart.lineData()][0][chart.xData()]);
            //   })
            //   .attr("y2", function(d) {
            //     return chart.yScale(d[chart.lineData()][0][chart.yData()]);
            //   })
            //   .attr("class", "line");

            

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


            selection.selectAll("circle")
              .data(function(d) { return d[chart.lineData()]; }).enter()
            .append("circle")
              .attr("cx", function(d) {
                return chart.xScale(d[chart.xData()]);
              })
              .attr("cy", function(d) {
                return chart.yScale(d[chart.yData()]);
              })
              .attr("r", 0)
              .attr("class", function(d) { 
                if ( d.milestone.search(/complete|termination|fixed/) !== -1 ) {
                  return "end";
                }
                else if (d.milestone === "to date") {
                  return d.milestone.replace(" ", "-");
                }
                else {
                  return d.milestone;
                }
              });
          }
          else {
            selection.append("circle")
              .attr("cx", function(d) {
                return chart.xScale(d[chart.xData()]);
              })
              .attr("cy", function(d) {
                return chart.yScale(d[chart.yData()]);
              })
              .attr("r", 0)
              .attr("class", "point")
              .attr("clip-path", "url(#line-clip)");
          }

          selection.on("mouseover", function() {
            d3.select(this)
              .classed("hovered", true);
          });

          selection.on("mouseout", function() {
            d3.select(this)
              .classed("hovered", false);
          });
          
          // add a mouseover listener to our groups
          // and change their color and broadcast a chart
          // brush event to any listeners.
          selection.on("click", function() {
            var el = d3.select(this);

            var gaEventLabel = "complexity-" + el.datum().project;

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

            if ( el.classed("active") !== true ) {
              ga("send", "event", "datapoint", "hover", gaEventLabel, chart.gaProjectsHovered);
              chart.gaProjectsHovered++;

              d3.selectAll(".active")
                .classed("active", false)
                .selectAll("circle")
                  .attr("r", 5);

              el
                .classed("active", true);

              chart.layer("info-box").draw();

              // el.selectAll(".line")
              //   .attr("x2", function(d) {
              //     return chart.xScale(d[chart.lineData()][0][chart.xData()]);
              //   })
              //   .attr("y2", function(d) {
              //     return chart.yScale(d[chart.lineData()][0][chart.yData()]);
              //   })
              //   .attr("marker-end", "")
              //   .transition().duration(1000)
              //   .attr("x2", function(d) {
              //     return chart.xScale(d[chart.lineData()][1][chart.xData()]);
              //   })
              //   .attr("y2", function(d) {
              //     return chart.yScale(d[chart.lineData()][1][chart.yData()]);
              //   })
              //   .transition().duration(1000)
              //   .attr("marker-end", function(d) {
              //     if (d[chart.lineData()][1][chart.xData()] === 0 || null) {
              //       if (d[chart.lineData()][1][chart.dataLabel()] === "complete") {
              //         // return "url(#markerExplodeEnd)";
              //         return "url(#markerCircle)";
              //       }
              //       else {
              //         return "url(#markerCircleToDate)";
              //       }
              //     }
              //     else{
              //       return "url(#markerCircle)";
              //     }
              //   });

              el.selectAll("circle")
                .attr("r", 7);

              chart.trigger("brush", this);
            }
            
          });

          // this.on("mouseout", function() {
          //   var el = d3.select(this);

          //   // el.classed("active", false);

          //   // el.selectAll("circle")
          //   //   .style("stroke", "none")
          //   //   .attr("r", 5);

          //   // el.select(".tt").remove();

          //   chart.trigger("unbrush", this);
          // });

        },
        // then transition them to a radius of 5 and change
        // their fill to blue
        "enter:transition": function() {
          var chart = this.chart();
          var line = d3.svg.line()
            .x(function(d) { return chart.xScale(d[chart.xData()]); })
            .y(function(d) { return chart.yScale(d[chart.yData()]); }); 

          if ( chart.xScaleType !== "date" ) { 
            this.selectAll("circle").transition().duration(500)
              .attr("r", function() { return d3.select(this.parentNode).classed("active") ? 7 : 5; });

            this.selectAll(".line")
              .attr("stroke-width", 2);
            //   .attr("marker-end", "")
            // .transition()
            //   // .delay(500)
            //   .duration(1000)
            //   // .attr("d", line)
            //   .attr("marker-mid", "url(#markerCircleToDate)")
            //   .attr("marker-end", function(d) {
            //     // console.log(d[d.length - 1][chart.dataLabel()]);
            //     if (d[d.length - 1][chart.xData()] === 0 || null) {
            //       if (d[d.length - 1][chart.dataLabel()].search(/complete|termination|fixed/) !== -1) {
            //         // return "url(#markerExplodeEnd)";
            //         return "url(#markerCircle)";
            //       }
            //       else {
            //         return "url(#markerCircleToDate)";
            //       }
            //     }
            //     else{
            //       return "url(#markerCircle)";
            //     }
            //   });

            // this.selectAll(".line")
            //   .attr("stroke-width", 2)
            //   .attr("marker-end", "")
            // .transition().delay(500).duration(1000)
            //   .attr("x2", function(d) {
            //       return chart.xScale(d[chart.lineData()][1][chart.xData()]);
            //     })
            //   .attr("y2", function(d) {
            //     return chart.yScale(d[chart.lineData()][1][chart.yData()]);
            //   })
            // .transition().duration(1000)
            //   .attr("marker-end", function(d) {
            //     if (d[chart.lineData()][1][chart.xData()] === 0 || null) {
            //       if (d[chart.lineData()][1][chart.dataLabel()] === "complete") {
            //         // return "url(#markerExplodeEnd)";
            //         return "url(#markerCircle)";
            //       }
            //       else {
            //         return "url(#markerCircleToDate)";
            //       }
            //     }
            //     else{
            //       return "url(#markerCircle)";
            //     }
            //   });
          }
          else {
            this.selectAll("circle.point").transition().duration(500)
              .attr("r", function() { return d3.select(this.parentNode).classed("active") ? 7 : 5; });
          }


          // this.selectAll("circle.complete").delay(1500)
          //   .attr("r", 5);

        }
      }
    });

    this.layer("bars-chart", d3.select("#bars-chart").append("svg").attr("width", 940).attr("height", 200), {

      // select the elements we wish to bind to and
      // bind the data to them.
      dataBind: function(data) {
        if ( chart.xScaleType !== "date" ) { 
          return this.selectAll("g.datapoint")
            .data(data.sort(function(a,b) {
              var firstSort = (b[chart.lineData()][1][chart.xData()] / b[chart.lineData()][0][chart.xData()]) / (b[chart.lineData()][1][chart.yData()] / b[chart.lineData()][0][chart.yData()]) - (a[chart.lineData()][1][chart.xData()] / a[chart.lineData()][0][chart.xData()]) / (a[chart.lineData()][1][chart.yData()] / a[chart.lineData()][0][chart.yData()]);
              var secondSort = a[chart.lineData()][1][chart.yData()] / a[chart.lineData()][0][chart.yData()] - b[chart.lineData()][1][chart.yData()] / b[chart.lineData()][0][chart.yData()];
              return firstSort !== 0 ? firstSort : secondSort;
            }));
          }
        else {
          return this.style("display", "none").selectAll("g.datapoint").data([]);
        }
      },

      // insert actual circles
      insert: function() {
        return this.append("g")
          .attr("transform", "translate(730,5)");
      },

      // define lifecycle events
      events: {

        // paint new elements, but set their radius to 0
        // and make them red
        "enter": function() {
          var chart = this.chart();
          var selection = this;

          var xLeftMax, xBarScaleLeft, xBarScaleRight, yBarScale;



         if ( chart.xScaleType !== "date" ) { 
            xLeftMax = d3.max(chart.data, function(d) { return d[chart.lineData()][1][chart.yData()] / d[chart.lineData()][0][chart.yData()]; });

            xBarScaleLeft = d3.scale.linear()
              .range([0, - ( 800 * xLeftMax / (xLeftMax + 1))])
              .domain([0, xLeftMax]);

            xBarScaleRight = d3.scale.linear()
              .range([0, 800 / (xLeftMax + 1)])
              .domain([0,1]);

            selection.append("rect")
              .attr("x", 0)
              .attr("y", function(d,i) {
                return i * 20;
              })
              .attr("height", 15)
              .attr("width", 0)
              .attr("class", "functionality")
              .attr("stroke", "black")
              .attr("fill", "#00bb6a")
              .attr("stroke-width", 0)
              .transition()
              .delay(function(d,i) { return i * chart.duration(); })
              .duration(chart.duration())
              .attr("width", function(d) {
                return xBarScaleRight(d[chart.lineData()][1][chart.xData()] / d[chart.lineData()][0][chart.xData()]);
              });

            selection.append("rect")
              .attr("x", 0)
              .attr("y", function(d,i) {
                return (i * 20);
              })
              .attr("width", 0)
              .attr("height", 15)
              .attr("class", "functionality")
              .attr("stroke", "black")
              .attr("fill", "#ff0500")
              .attr("stroke-width", 0).transition()
              .delay(function(d,i) { return i * chart.duration(); })
              .duration(chart.duration())
              .attr("x", function(d) {
                return xBarScaleLeft(d[chart.lineData()][1][chart.yData()] / d[chart.lineData()][0][chart.yData()]);
              })
              .attr("width", function(d) {
                return - xBarScaleLeft(d[chart.lineData()][1][chart.yData()] / d[chart.lineData()][0][chart.yData()]);
              });

            selection.append("rect")
              .attr("x", 0)
              .attr("y", function(d,i) {
                return i * 20;
              })
              .attr("width", function(d) {
                return xBarScaleRight(1);
              })
              .attr("height", 15)
              .attr("class", "functionality")
              .attr("stroke", "black")
              .attr("fill", "none")
              .attr("stroke-width", 1);

            selection.append("rect")
              .attr("x", function(d) {
                return xBarScaleLeft(1);
              })
              .attr("y", function(d,i) {
                return i * 20;
              })
              .attr("width", function(d) {
                return - xBarScaleLeft(1);
              })
              .attr("height", 15)
              .attr("class", "functionality")
              .attr("stroke", "black")
              .attr("fill", "none")
              .attr("stroke-width", 1);

            // selection.on("mouseover", function() {
              
            // });



            // selection.append("rect")
            //   .attr("x1", function(d) {
            //     return chart.xScale(d[chart.lineData()][0][chart.xData()]);
            //   })
            //   .attr("y1", function(d) {
            //     return chart.yScale(d[chart.lineData()][0][chart.yData()]);
            //   })
            //   .attr("x2", function(d) {
            //     return chart.xScale(d[chart.lineData()][0][chart.xData()]);
            //   })
            //   .attr("y2", function(d) {
            //     return chart.yScale(d[chart.lineData()][0][chart.yData()]);
            //   })
            //   .attr("class", "line");

          }

        },
        // then transition them to a radius of 5 and change
        // their fill to blue
        // "enter:transition": function() {
        //   var chart = this.chart();

        //   if ( chart.xScaleType !== "date" ) { 
        //     this.selectAll("circle.start.").transition().duration(500)
        //       .attr("r", function() { return d3.select(this.parentNode).classed("active") ? 7 : 5; });

        //     this.selectAll(".line")
        //       .attr("stroke-width", 2)
        //       .attr("marker-end", "")
        //     .transition().delay(500).duration(1000)
        //       .attr("x2", function(d) {
        //           return chart.xScale(d[chart.lineData()][1][chart.xData()]);
        //         })
        //       .attr("y2", function(d) {
        //         return chart.yScale(d[chart.lineData()][1][chart.yData()]);
        //       })
        //     .transition().duration(1000)
        //       .attr("marker-end", function(d) {
        //         if (d[chart.lineData()][1][chart.xData()] === 0 || null) {
        //           if (d[chart.lineData()][1][chart.dataLabel()] === "complete") {
        //             // return "url(#markerExplodeEnd)";
        //             return "url(#markerCircle)";
        //           }
        //           else {
        //             return "url(#markerCircleToDate)";
        //           }
        //         }
        //         else{
        //           return "url(#markerCircle)";
        //         }
        //       });
        //   }
        //   else {
        //     this.selectAll("circle.point").transition().duration(500)
        //       .attr("r", function() { return d3.select(this.parentNode).classed("active") ? 7 : 5; });
        //   }


        //   // this.selectAll("circle.complete").delay(1500)
        //   //   .attr("r", 5);

        // }
      }
    });

    this.layer("projectedMask", chart.layers.defs.append("clipPath"), {
      dataBind: function(data) {
        if ( chart.xScaleType === "date" ) {
          return this.attr("id", "line-clip").selectAll("rect")
            .data([data]);
        }
        else {
          return this.selectAll("rect")
            .data([]);
        }
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
            .attr("x", 0)
            .attr("y", -10)
            .attr("width", 0)
            .attr("height", chart.height() + 10);

          d3.select("#replay").on("click", function() {
            event.preventDefault();

            chart.layer("projectedMask").draw();
          });
        },

        "merge:transition" : function() {
          var chart = this.chart();
          var selection = this;

          selection
            .duration(chart.duration()*5)
            .ease("linear")
            .attr("width", chart.width());
        } 
      }
    });

    this.layer("linepoints", chart.layers.lineBase, {

      // select the elements we wish to bind to and
      // bind the data to them.
      dataBind: function(data) {
        if ( chart.xScaleType === "date" ) {
          return this.selectAll("g.line")
            .data([data]);
        }
        else {
          return this.selectAll("g.line")
            // .data(data);
            .data([]);
        }
      },

      // insert actual circles
      insert: function() {
        return this.append("g").classed("line", true).append("path");
      },

      // define lifecycle events
      events: {

        // paint new elements, but set their radius to 0
        // and make them red
        "enter": function() {
          var chart = this.chart();
          var selection = this;
          var line = d3.svg.area()
              .x(function (d) { return chart.xScale(d[chart.xData()]); })
              .y(function (d) { return chart.yScale(d[chart.yData()]); });

          // var multiline = d3.svg.area()
          //     .x(function (d) { return chart.xScale(d[chart.lineData][chart.xData()]); })
          //     .y(function (d) { return chart.yScale(d[chart.lineData][chart.yData()]); });

          // selection
          //   .attr("clip-path", function (d,i) {
          //     return i === chart.data.length - 1 ? "url(#project-clip)" : null; 
          //   });

          selection
            .attr("clip-path", "url(#line-clip)")
            .attr("stroke", "black")
            .attr("stroke-width", 2)
            .attr("d", function (d) { 
              if ( chart.xScaleType === "date" ) {
                return line(d); 
              }
              else {
                return line(d[chart.lineData()]);
              }
            });

        },
        // // then transition them to a radius of 5 and change
        // // their fill to blue
        // "enter:transition": function() {
        //   var chart = this.chart();
        //   this.selectAll("circle.start").transition().duration(500)
        //     .attr("r", function() { return d3.select(this.parentNode).classed("active") ? 7 : 5; });

        //   this.selectAll(".line")
        //     .attr("stroke-width", 2)
        //     .attr("marker-end", "")
        //   .transition().delay(500).duration(1000)
        //     .attr("x2", function(d) {
        //         return chart.xScale(d[chart.lineData()][1][chart.xData()]);
        //       })
        //     .attr("y2", function(d) {
        //       return chart.yScale(d[chart.lineData()][1][chart.yData()]);
        //     })
        //   .transition().duration(1000)
        //     .attr("marker-end", function(d) {
        //       if (d[chart.lineData()][1][chart.xData()] === 0 || null) {
        //         if (d[chart.lineData()][1][chart.dataLabel()] === "complete") {
        //           // return "url(#markerExplodeEnd)";
        //           return "url(#markerCircle)";
        //         }
        //         else {
        //           return "url(#markerCircleToDate)";
        //         }
        //       }
        //       else{
        //         return "url(#markerCircle)";
        //       }
        //     });


        //   // this.selectAll("circle.complete").delay(1500)
        //   //   .attr("r", 5);

        // }
      }
    });

    this.layer("info-box", chart.layers.infoBoxBase, {
      dataBind: function() {
        // console.log([chart.layers.datapointBase.select(".active").datum()]);
        return this.selectAll(".info-box")
          .data([chart.layers.datapointBase.select(".active").datum()]);
      },

      insert: function() {
        var selection = this.append("div")
          .attr("class", "info-box replacements-chart")
          .append("div")
            .attr("class", "isotope-item description");

        return selection;
      },

      events: {
        "merge": function() {
          var selection = this;
          var chart = this.chart();
          var infoBoxContent = selection.select(".description");

          infoBoxContent.selectAll("*").remove();

          // infoBoxContent.append("time")
          //   .attr("class", "date")
          //   .text(function (d) { return d.date; });

          if ( chart.xScaleType === "date" ) {
            chart.layers.infoBoxBase.select(".info-box")
              .attr("style", "left: initial; right: 220px;");

            infoBoxContent
              .append("time")
              .attr("class", "date")
              .html(function (d) { return d.date; });

            infoBoxContent.append("p")
              .attr("class", "fail-stat small")
              .html(function (d) { return "&ldquo;" + d.description + "&rdquo;"; })
              .append("a")
                .attr("class", "readmore source")
                .attr("href", function(d) { return d.url; })
                .attr("target", "_blank")
                .html(function (d) { return "&mdash; " + d.source; });
          }
          else {

            infoBoxContent
              .append("a")
              .attr("href", function(d) { return d.url; })
              .attr("target", "_blank")
              .append("h3")
              .attr("class", "fail-hed")
              .text(function (d) { return d.project; });

            infoBoxContent.append("p")
              .attr("class", "fail-stat small")
              .html(function (d) { return chart.displayStat(d); });
              // .append("a")
              //   .attr("class", "readmore")
              //   .attr("href", function(d) { return d.url; })
              //   .attr("target", "_blank")
              //   .html("Read More");

            chart.layers.longDescription.select("div")
              .html(selection.datum().projectDescription);

            chart.layers.longDescription.select(".readmore").remove();

            chart.layers.longDescription
              .append("a")
                .attr("class", "readmore")
                .attr("href", function(d) { return selection.datum().url; })
                .attr("target", "_blank")
                .html("Read More");
          }

          // infoBoxContent
          //   .append("p")
          //   .attr("class", "fail-impact")
          //   .text(function(d) { return d["Impact - Raw"]; });

          // infoBoxContent
          //   .append("a")
          //   .attr("class", "readmore")
          //   .attr("href", function(d) { return d.url; })
          //   .attr("target", "_blank")
          //   .text("Read More");

          return selection;
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

    // console.log(data);

    // var sorted = data.sort(function(a,b){ return b.date - a.date; });
    // var sortedByDate = data.sort(function(a,b){return a.dateObject.getTime() - b.dateObject.getTime();});
    // var mindate = formatString.parse(sortedByDate[0].dateOriginal);
    // var maxdate = formatString.parse(sortedByDate[data.length-1].schedOriginal);

    // var maxTot = d3.max(data, function (d) { 
    //   return d.totMillions;
    // });

    //update x scale domain
    //chart.xScale.domain([mindate,maxdate]);
    // console.log(chart.xScaleType);
    if ( chart.xScaleType === "date" ) {
      chart.xScale = d3.time.scale()
        .range([0, chart.width()]);

      chart.xScale.domain(d3.extent(data, function(d) { return d[chart.xData()]; })).nice();
      // console.log(chart.xScale.domain());

      chart.yScale.domain([0,d3.max(data, function(d) { return d[chart.yData()]; })]).nice();
      // console.log(chart.yScale.domain());

      chart.layers.legendBase.selectAll(".legend-item").remove();
    }
    else {
      chart.xScale.domain([d3.max(data, function (d) {
        // console.log(chart);
        // console.log(chart.lineData());
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
    }

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

  dataLabel: function(newDataLabel) {
    "use strict";
    if (arguments.length === 0) {
      return this._dataLabel;
    }

    var oldDataLabel = this._dataLabel;

    if ( oldDataLabel !== newDataLabel) {
      this._dataLabel = newDataLabel;
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

  // wrap: function(text, width) {
  //   "use strict";
  //   text.each(function() {
  //     var text = d3.select(this),
  //         words = text.text().split(/\s+/).reverse(),
  //         word,
  //         line = [],
  //         lineNumber = 0,
  //         lineHeight = 1.1, // ems
  //         y = text.attr("y"),
  //         dy = parseFloat(text.attr("dy")),
  //         tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
  //     while ((word = words.pop())) {
  //       line.push(word);
  //       tspan.text(line.join(" "));
  //       if (tspan.node().getComputedTextLength() > width) {
  //         line.pop();
  //         tspan.text(line.join(" "));
  //         line = [word];
  //         tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
  //       }
  //     }
  //   });
  // },

  displayStat: function (d) {
    "use strict";

    var pre = "Delivered "; 
    var mid = " functionality <br>for ";
    var post = " the original cost";

    var func = d.functionality + "%";
    var cost = d.overBudget + "%";

    if ( d.functionality === 0 ) {
      func = "no";
    }

    return pre + 
      " <span class=\"number\">" + func + "</span> " + 
      mid +
      " <span class=\"number\">" + cost + "</span> " + 
      post;
  }

});

d3.csv("data/complexity.csv", function (data) {
  "use strict";

  // console.log(data);
  var container = d3.select("#chart");
  var parWidth = container.node().parentNode.offsetWidth;
  var margins = {top: 50, bottom: 70, right: 20, left: 90};
  var width = parWidth - margins.left - margins.right;
  var height = width * 9 / 16;

  // width = 620 - margins.left - margins.right;
  // height = (width / 1.91 ) - 37.5;


  data = d3.nest()
    .key(function(d) { return d.project; })
    .entries(data);

  // console.log(data);

  data.forEach(function (d) {
    d.project = d.values[0].project;
    d.url = d.values[0].url;
    d.projectDescription = d.values[0].description;
    d.currency = d.values[0].currency;
    d.milestones = d.values.map(function (point, i) { 
      var ii = i;
      // console.log(ii);
      while( point["cost USD"] === "null" || "" ) {
        ii++;
        point["cost USD"] = d.values[ii]["cost USD"];
        // console.log(point["cost USD"]);
      }
      return {
        "cost": point["cost USD"] === "null" || "" ? null : +point["cost USD"],
        "milestone": point.milestone,
        "systems to replace": point["systems to replace"] === "null" || "" ? null : +point["systems to replace"]
      }; 
    });

    d.overBudget = Math.round((d.milestones[d.milestones.length - 1].cost / d.milestones[0].cost) * 100);
    d.functionality = Math.round((d.milestones[d.milestones.length - 1]["systems to replace"] / d.milestones[0]["systems to replace"]) * 100);

    // d.costs = d.values.map(function (i) { return i.cost; });
    // d.milestones = d.values.map(function (i) { return i.milestone; });
    // d["systems to replace"] = d.values.map(function (i) { return i["systems to replace"]; });

    delete d.key;
    delete d.values;
  });

  // console.log(data);  

  // container.append("div")
  //   .attr("class", "circle-info-box");

  var systems = container
    .append("svg")
    .chart("SystemsChart")
    .width(width * 0.6)
    // .width(width)
    .height(height)
    .margin(margins)
    .lineData("milestones")
    .xData("systems to replace")
    .yData("cost")
    .dataLabel("milestone");

  if ( systems.mode() === "mobile" ) {
    var mobMargins = margins;
    mobMargins.left = mobMargins.right * 2;

    // TODO: remove 1px currently needed to force recalc
    var mobWidth = parWidth - mobMargins.left - mobMargins.right - 1;

    d3.select("body").classed("mobile-view", true);

    systems
      .width(mobWidth)
      .height(mobWidth * 9 / 16)
      .margin(mobMargins);

    // systems
    //   .width(container.node().parentNode.offsetWidth - 40)
    //   .height((container.node().parentNode.offsetWidth - 40) * 9 / 6);
  }

  if ( Modernizr.mq("only print") ) {
    systems
      .width(parWidth)
      .height(height)
      .margin({left: 0, right: 0, top: 35, bottom: 70 });
  }

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

  // defs.append("marker")
  //   .attr("id", "markerExplodeEnd")
  //   .attr("markerWidth", 17)
  //   .attr("markerHeight", 17)
  //   .attr("refX", 5)
  //   .attr("refY", 5)
  //   .append("polygon")
  //     .attr("xmlns", "http://www.w3.org/2000/svg")
  //     .attr("id", "explode")
  //     .attr("points", "3308.65 2406.83 3327.34 2456.77 3401.65 2434.83 3364.77 2484.77 3458.88 2534.32 3357.97 2557.89 3371.65 2610.83 3325.65 2580.06 3299.85 2650.38 3273.45 2573.91 3188.36 2600.69 3244.87 2545.09 3178.65 2504.83 3257.59 2483.83 3214.65 2425.55 3271.59 2447.03")
  //     .attr("transform", "translate(-143.5,-108.3) scale(.045)")
  //     .attr("class", "marker end");

  defs.append("marker")
    .attr("id", "markerCircleToDate")
    .attr("markerWidth", 10)
    .attr("markerHeight", 10)
    .attr("refX", 5)
    .attr("refY", 5)
    .append("use")
      .attr("xlink:href", "#circle-base")
      .attr("class", "marker to-date");

  defs.append("marker")
    .attr("id", "markerArrow")
    .attr("markerWidth", 13)
    .attr("markerHeight", 13)
    .attr("refX", 2)
    .attr("refY", 6)
    .attr("orient", "auto")
    .append("path")
      .attr("d", "M2,2 L2,11 L10,6 L2,2");

  systems.draw(data
    .sort(function(a,b) {
      // var len = a.milestones.length;
      return a.milestones[a.milestones.length - 1].cost - b.milestones[b.milestones.length - 1].cost;
    }
  ));

  
  pymChild.sendHeight();

  systems.on("brush", function() {
    pymChild.sendHeight();
  });

});

d3.csv("data/ECSS-systems.csv", function (data) {
  "use strict";

  // console.log(data);
  var container = d3.select("#ECSS-chart");
  var parWidth = container.node().parentNode.offsetWidth;
  var margins = {top: 50, bottom: 30, right: 20, left: 90};
  var width = parWidth - margins.left - margins.right;
  var height = width * 9 / 16;

  // width = 620 - margins.left - margins.right;
  // height = (width / 1.91);

  var formatString = "%m/%e/%y";
  var format = d3.time.format("%B 20%y");

  data.forEach(function(d) {
    d.dateOriginal = d.date;
    d.formattedDate = d3.time.format(formatString).parse(d.date);
    d.dateObject = new Date(d.date);
    d.date = format(d.dateObject);
    d.month = d.dateObject.getMonth();

    // console.log(d.description);
    d.description = d.description.replace(/((approximately |more than |over )?[0-9~\+]+)/, "<span class=\"number\">$1</span>");
    // console.log(d.description);

  });

  var estimates = container
    .append("svg")
    .chart("SystemsChart")
    .width(parWidth - margins.left - margins.right)
    // .width(width)
    // .height((parWidth - margins.left - margins.right) * 3 / 4)
    .height(height)
    .margin(margins)
    .xData("dateObject")
    .yData("systems");

  estimates.xScaleType = "date";

  if ( estimates.mode() === "mobile" ) {
    var mobMargins = margins;
    mobMargins.left = mobMargins.right * 2;

    // TODO: remove 1px currently needed to force recalc
    var mobWidth = parWidth - mobMargins.left - mobMargins.right - 1;

    d3.select("body").classed("mobile-view", true);

    estimates
      .width(mobWidth)
      .height(mobWidth * 9 / 16)
      .margin(mobMargins);

    // systems
    //   .width(container.node().parentNode.offsetWidth - 40)
    //   .height((container.node().parentNode.offsetWidth - 40) * 9 / 6);
  }

  estimates.draw(data);

  estimates.base.select("g").append("g")
    .classed("cancellation", true)
    .attr("clip-path", "url(#line-clip)")
    .append("line")
      .attr("x1", estimates.xScale(new Date("11/1/2012")))
      .attr("x2", estimates.xScale(new Date("11/1/2012")))
      .attr("y1", 0)
      .attr("y2", estimates.height())
      .style("stroke-width", "2px")
      .style("stroke", "gray")
      .style("stroke-dasharray", "5px 5px");

  estimates.base.select(".cancellation")
    .append("text")
      .attr("x", 0)
      .attr("y", estimates.xScale(new Date("11/1/2012")))
      .attr("dy", "1em")
      .attr("transform", "rotate(-90)")
      .style("text-anchor", "end")
      .style("fill", "gray")
      .style("font-size", ".8em")
      .text("program cancelled");

  pymChild.sendHeight();
});

var Share = function() {
    // var fbInitialized = false;
    
    function shareData() {
      var data = {
        // title: $("meta[property='og:title']").attr('content'),
        // longTitle: "",
        // url: $("meta[property='og:url']").attr('content'),
        // image: $("meta[property='og:image']").attr('content'),
        // description: $("meta[property='og:description']").attr('content')
        titles: {
          "default": "Overcomplexifying, Underdelivering",
          "ECSS-chart": "The ECSS Debacle: How many systems are we replacing anyway?"
        },
        preTitle: "Lessons from a Decade of IT Failures:",
        url: window.location.protocol + "//" + 
            window.location.host +
            window.location.pathname,
        images: {
          "default": "/images/complexity-chart.png",
          "ECSS-chart": "/images/ECSS-chart.png"
        },
        description: "Trying to replace multiple IT systems with one can lead to none"
      };

      // pymChild.onMessage("share", function (title) {
      //   data.title = title;
      //   console.log("message sent!");
      // });
      return data;
    }

    function track(label) {
      return;
      //MCP.share(label);
    }


    var that = {

      assignButtons: function() {
        $('.share-fb').on('click',that.postToFacebook)
        $('.share-twtr').on('click',that.postToTwitter)
        $('#share-email').on('click',that.emailLink)
        $('#share-gpls').on('click',that.postToGooglePlus)
        $('#share-lin').on('click',that.postToLinkedIn)
      },
      
      postToFacebook: function() {
        event.preventDefault();
        var data = shareData();
        data.title = $(this.parentNode).attr("data-chart") !== undefined ? data.titles[$(this.parentNode).attr("data-chart")] : data.titles.default;
        data.image = $(this.parentNode).attr("data-chart") !== undefined ? data.images[$(this.parentNode).attr("data-chart")] : data.images.default;
        var obj = {
          app_id: "174248889578740",
          method: "feed",
          // name: data.longTitle,
          name: data.title,
          link: data.url,
          picture: window.location.protocol + "//" + 
            window.location.host +
            window.location.pathname.split("/").slice(0,-1).join("/") +
            data.image,
          description: data.description
        };
        window.parent.FB.ui(obj, function(response) {
          track("Facebook");
        });
        // pymChild.sendMessage("shareFB", JSON.stringify(obj));
      },
      
      centerPopup: function(width, height) {
        var wLeft = window.parent.screenLeft ? window.screenLeft : window.screenX;
        var wTop = window.parent.screenTop ? window.screenTop : window.screenY;
        var left = wLeft + (window.parent.innerWidth / 2) - (width / 2);
        var top = wTop + (window.parent.innerHeight / 2) - (height / 2);

        // console.log(window.parent.location.hash);
        return 'width=' + width + ',height=' + height + ',top=' + top + ',left=' + left;
      },
      
      postToTwitter: function() {
        event.preventDefault();
        var data = shareData();
        data.title = $(this.parentNode).attr("data-chart") !== undefined ? data.titles[$(this.parentNode).attr("data-chart")] : data.titles.default;
        var tweetUrl = "https://twitter.com/share?url=" + encodeURIComponent(data.url) + "&text=" + encodeURIComponent(data.preTitle + " " + data.title);
        var opts = that.centerPopup(500, 300) + "scrollbars=1";
        track("Twitter");
        // console.log(window.parent.location.hash);
        // window.parent.location.hash = "ECSS-chart";
        // window.hash = "ECSS-chart";
        // document.getElementById('ECSS-chart').scrollIntoView();
        // console.log(window.parent.location.hash);
        window.parent.open(tweetUrl, 'twitter', opts);
      },
      
      // emailLink: function() {
      //   var data = shareData();
      //   var mailto = "mailto:?subject=" + encodeURIComponent(data.longTitle) + "&body=" + encodeURIComponent(data.description + "\n\n" + window.location.href);
      //   track('Email');
      //   window.location.href = mailto;
      // },
      
      // postToGooglePlus: function() {
      //   var url = encodeURIComponent(window.location.href);
      //   var gPlusUrl ="https://plus.google.com/share?url={" + url + "}"; 
      //   track('Google');
      //   var opts = that.centerPopup(800, 480) + 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes';
      //   window.open(gPlusUrl, '', opts);
      // },
      
      // postToLinkedIn: function() {
      //   // This doesn't work when served up with a port
      //   var data = shareData();
      //   var url = encodeURIComponent(window.location.href);
      //   var linkedInUrl ="http://www.linkedin.com/shareArticle?mini=true&url=" + url
      //     + "&title=" + encodeURIComponent(data.longTitle) + "&summary=" + encodeURIComponent(data.description); 
      //   track('LinkedIn');
      //   var opts = that.centerPopup(880, 460) + 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes';
      //   window.open(linkedInUrl, '', opts);
      // }
    };

    that.assignButtons()
    return that;
  };

  var sharing = new Share();

  pymChild.sendHeight();
