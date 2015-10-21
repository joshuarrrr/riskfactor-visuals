/*global d3, pym, ga */

d3.chart("MarginChart").extend("FailureChart", {

    initialize: function() {
      "use strict";

      var chart = this;
      chart.layers = {};

      chart.layers.areaBase1 = chart.base.select("g").append("g")
        .classed("area1", true);

      chart.layers.areaBase2 = chart.base.select("g").append("g")
        .classed("area2", true);

      chart.layers.initLine = chart.base.select("g").append("g")
        .classed("initline", true);

      chart.layers.yAxisBase = chart.base.select("g").append("g")
        .classed("axes", true);

      chart.layers.xAxisBase = chart.base.select("g").append("g")
        .classed("axes", true);

      chart.layers.ylabels = chart.base.select("g").append("g")
        .classed("y-labels", true);

      chart.layers.labelsBase = chart.base.select("g").append("g")
        .classed("area-label-base", true);

      chart.layers.spentLabelsBase = chart.base.select("g").append("g")
        .classed("spent-label-base", true);

      // chart.layers.infoBoxBase = d3.select(".info-box");

      // chart.layers.infoBoxBase = d3.select(chart.base.node().parentNode).insert("div")
      //   .attr("class", "info-box long-description");

      chart.layers.infoBoxBase = d3.select(chart.base.node().parentNode).select(".long-description");

      chart.layers.defs = chart.base.select("g").append("defs");

      // create an xScale

      // var parWidth = chart.base.node().parentNode.parentNode.offsetWidth;
      // var margins = {top: 30, bottom: 30, right: 20, left: 100};
      // var width = parWidth - margins.left - margins.right;
      // var height = width * 3.5 / 8;
      chart.xScale = d3.time.scale()
        .range([0, chart.width()]);

      // when the width changes, update the x scale range
      chart.on("change:width", function(newWidth) {
        // console.log("width changed");
        chart.xScale.range([0, newWidth - 1]);
      });

      // create a yScale
      chart.yScale = d3.scale.linear()
        .range([chart.height(),0]);

      // when the height changes, update the y scale range
      chart.on("change:height", function(newHeight) {
        // console.log("height changed");
        chart.yScale.range([newHeight, 0]);
      });

      chart.layers.ylabels
        .attr("class", "y axis-label")
        .append("text")
          .attr("y", 0)
          .attr("x",0)
          .attr("dy", ".3em")
          .attr("dx", ".3em")
          .text("US $");

      chart.layers.xAxisBase.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + chart.height() + ")");

      var xAxis = d3.svg.axis()
        .scale(chart.xScale)
        .orient("bottom")
        .ticks(0)
        .outerTickSize(0);

      chart.base.select(".x.axis")
        .call(xAxis);

      chart.layers.yAxisBase.append("g")
            .attr("class", "y axis");

      var yAxis = d3.svg.axis()
        .scale(chart.yScale)
        .orient("left")
        .ticks(0)
        .outerTickSize(0);

      chart.base.select(".y.axis")
        .call(yAxis);

      // add axes layer 
      this.layer("x-axis", chart.layers.xAxisBase, {
        // modes : ["web", "tablet"],
        dataBind: function(data) {
          return this.selectAll(".x.axis")
            .data([data]);
        },

        // insert x axis
        insert: function() {
          var chart = this.chart();
          var selection = this.append("g")
            .attr("class", "x axis");

          return selection;
        },

        events: {
          "merge" : function() {
            var chart = this.chart();
            var selection = this;

            selection.attr("transform", "translate(0," + chart.height() + ")");

            // draw xaxis
            var xAxis = d3.svg.axis()
              .scale(chart.xScale)
              .orient("bottom")
              .ticks(5)
              .outerTickSize(0);

            if ( chart.mode() === "mobile" ) {
              xAxis.ticks(3);
            }

            chart.base.select(".x.axis")
            .transition()
              .duration(chart.duration())
              .call(xAxis);

            chart.on("change:height", function() {
              chart.base.select(".x.axis")
                .attr("transform", "translate(0," + chart.height() + ")")
                .call(xAxis);
            });

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
              .ticks(4)
              .outerTickSize(0)
              .tickFormat(function(d) { 
                if ( chart.yScale.domain()[1] >= 1e9 ) {
                  return d > 0 ? (d / 1e9) : "";
                }
                else if ( chart.yScale.domain()[1] >= 1e6) {
                  return d > 0 ? (d / 1e6) : "";
                }
                else {
                  return d > 0 ? d : "";
                }
              });

            if ( chart.mode() === "mobile" ) {
              if ( chart.yScale.domain()[1] >= 1e9 ) {
                chart.layers.ylabels.select(".y.axis-label text")
                  .attr("x", - chart.margin().left)
                  .attr("y", "-1em")
                  .attr("text-anchor", "start")
                  .text(chart.data[0].currency + ", billions");

                yAxis.tickFormat(function(d) {
                  return d > 0 ? (d / 1e9) : "";
                });
                
              }
              else if ( chart.yScale.domain()[1] >= 1e6) {
                chart.layers.ylabels.select(".y.axis-label text")
                  .attr("x", - chart.margin().left)
                  .attr("y", "-1em")
                  .attr("text-anchor", "start")
                  .text(chart.data[0].currency + ", millions");

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
              .duration(chart.duration())
              .call(yAxis);

            chart.on("change:height", function() {
              chart.base.select(".y.axis")
                .call(yAxis);
            });

            return selection;
          }
        }

      });

      this.layer("spentMask", chart.layers.defs.append("clipPath").attr("id", "spent-clip"), {
        dataBind: function(data) {
          return this.selectAll("rect")
            .data([data.filter(function (milestone, index, data) {
              if ( index === 0 || index === data.length - 1 || milestone.spent.value > data[index - 1].spent.value ) {
                return milestone;
              }
            })]);
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
                if ( Modernizr.mq("only print") ) {
                  return chart.xScale(d[d.length-1].dateObject);
                }
                else {
                  return d.length > 1 ? chart.xScale(d[d.length-2].dateObject) : 0;
                }
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

      this.layer("projectedMask", chart.layers.defs, {
        dataBind: function(data) {
          return this.selectAll("clipPath.project-clip")
            .data(data
              .filter(function(d,i,arr) {
                return !d.launch && (i === 0 || arr[i].projections[0].area[1].y1 > arr[i - 1].projections[0].area[1].y1 || arr[i].projections[0].area[1].x > arr[i - 1].projections[0].area[1].x);
              }), function(d,i) { return i; });
        },

        insert: function() {
          var selection = this.append("clipPath")
            .classed("project-clip", true)
            .attr("id", function(d,i) { return "project-clip" + i; });

          selection
            .append("rect");

          return selection;
        },

        events: {
          "enter" : function() {
            var chart = this.chart();
            var selection = this;

            // console.log(selection);

            selection.select("rect")
              .attr("x", function (d) {
                // return chart.xScale(d[d.length-1].dateObject);
                // return chart.xScale(chart.mindate);
                return chart.xScale(d.dateObject);
              })
              .attr("width", 0)
              .attr("height", chart.height());
          },

          "merge" : function() {
            var chart = this.chart();
            var selection = this;

            selection.select("rect")
              .attr("x", function (d) {
                // return chart.xScale(d[d.length-1].dateObject);
                // return chart.xScale(chart.mindate);
                // return chart.xScale(d.projections[0].area[0].x);
                return chart.xScale(d.dateObject);
              });

            selection.filter(function (d,i) {
              // console.log(i);
              // console.log(selection.size() - 1);
              // console.log(d);
              // console.log(i === selection.size() - 1 && (d.projections[0].change !== 0 || d.projections[0].dateChange) && !chart.data[chart.data.length - 1].launch);
              return i === selection.size() - 1 && (d.projections[0].change !== 0 || d.projections[0].dateChange) && !chart.data[chart.data.length - 1].launch;
            }).select("rect")
              .attr("width", function() {
                return Modernizr.mq("only print") ? chart.width() : 0;
              });
          },

          "merge:transition" : function() {
            var chart = this.chart();
            var selection = this;

            // console.log(selection);

            selection.select("rect")
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
                return chart.width();
              })
              .attr("class", function(d,i) { return i; });
          },

          "exit" : function() {
            var chart = this.chart();
            var selection = this;

            // console.log(selection);

            selection.remove();
          } 
        }
      });

      // add area layer 1
      this.layer("projarea", chart.layers.areaBase1, {
        // modes : ["web", "tablet"],
        dataBind: function(data) {
          return this.selectAll("g")
            .data(data
              .filter(function(d,i,arr) {
                return !d.launch && (i === 0 || arr[i].projections[0].area[1].y1 > arr[i - 1].projections[0].area[1].y1 || arr[i].projections[0].area[1].x > arr[i - 1].projections[0].area[1].x);
              })
              .reverse(), function(d,i) { return i; });
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
              .y0(function(d) {
                return chart.yScale(d.y0); 
              })
              .y1(function(d) { return chart.yScale(d.y1); }); 

            // var area1 = d3.svg.area()
            //   .x(function(d) { return chart.xScale(d.x); })
            //   .y0(function(d) { return chart.yScale(d.y0); })
            //   .y1(function(d) { return chart.yScale(d.y1); }); 

            // var area2 = d3.svg.area()
            //   .x(function(d) { return chart.xScale(d.x); })
            //   .y0(function(d) { return chart.yScale(d.y0); })
            //   .y1(function(d) { return chart.yScale(d.y2); });           

            // selection
            //   .attr("clip-path", function (d,i) {
            //     return i === chart.data.length - 1 ? "url(#project-clip" + i + ")": null; 
            //   });

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

          // "update": function() {
          //   var chart = this.chart();
          //   var selection = this;

          //   selection.attr("clip-path", function (d,i) {
          //     // return i === 0 ? "url(#project-clip)" : null; 
          //     return null;
          //   });
          // },

          "merge" : function() {
            var chart = this.chart();
            var selection = this;
            var area = d3.svg.area()
              .x(function(d) { return chart.xScale(d.x); })
              .y0(function(d) { return chart.yScale(d.y0); })
              .y1(function(d) { return chart.yScale(d.y1); }); 

            // selection.attr("clip-path", function (d,i) {
            //   return i === 0 ? "url(#project-clip)" : null; 
            // });

            selection
              .attr("clip-path", function (d,i) {
                return "url(#project-clip" + (selection.size() - 1 - i) + ")"; 
              });

            selection
              .classed("initial", function(d,i) {
                if ( i === selection.size() - 1 || d.estOriginal === chart.mindate) {
                  return true;
                }
                else {
                  return false;
                }
              });

            selection
              .classed("selected", function(d,i) {
                if ( i === 0 ) {
                  return true;
                }
                else {
                  return false;
                }
              });

            d3.select(selection[0][selection[0].length - 1])
              .classed("launch", function(d) { return d.launch; });

            var projections = selection.selectAll("path.projection")
              .data(function(d) { return d.projections;
                // .filter(function (p,i,projections) {
                //   console.log(projections);
                //   return i ===0 || projections[i][0].area[1].y1 > projections[i - 1][0].area[1].y1;
                // });
              })
              .attr("class", function(d) { return "projection " + d.class; })
              .attr("d", function(d) { return area(d.area); });

            // console.log(projections.data());

            projections.enter()
              .append("path")
              .attr("class", function(d) { return "projection " + d.class; })
              .attr("d", function(d,i) { return area(d.area); });

            // console.log(projections);

            // projections
            //   .transition()
            //   .duration(chart.duration())
            //   .attr("d", function(d,i) { return area(d.area); });

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
          // console.log(data.slice(-1));
          return this.selectAll(".area-labels")
            .data(data.filter(function(d,i,arr) {
              return !d.launch && (i === 0 || i === arr.length -1 && (arr[i].projections[0].area[1].y1 > arr[i - 1].projections[0].area[1].y1 || arr[i].projections[0].area[1].x > arr[i - 1].projections[0].area[1].x));
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
              .attr("class", function (d,i) {
                return i===0 && chart.data.length > 1 ? "area-labels first" : "area-labels";
              });

            var labels = selection.selectAll("text")
              .data(function(d) { return d.projections; });

            labels.enter()
                .append("text")
                .attr("class", function(d) { return "label " + d.class; });


            labels
              .exit().remove();

            // var label = selection.selectAll("text.label");

            // label.exit().remove();

            labels
              .style("text-anchor", function(d) {
                // console.log(chart.xScale(d.area[d.area.length - 1].x));
                // console.log(d);
                if ( chart.xScale(d.area[d.area.length - 1].x) - 2 < 120 || (d.extraLabel === "CCNPAU" && chart.xScale(d.area[d.area.length - 1].x) - 2 < chart.width() - 120)) {
                  return "start";
                }
                else {
                  return null;
                }
              });

            labels.selectAll("tspan").remove();

            // console.log(labels.length);

            var extra = labels
              .filter(function (d) {
                // console.log(d);
                return d.extraLabel !== "";
              })
              .attr("x", function(d) { 
                var location = chart.xScale(d.area[d.area.length - 1].x) - 2; 
                
                if (location < 120 || (d.extraLabel === "CCNPAU" && location < chart.width() - 120)) {
                  location = location + 4;
                }
                return location;
              })
              .append("tspan")
                .attr("y", function(d) { return chart.yScale(d.area[d.area.length - 1].y1) - 5; })
                .attr("dy", "-2em")
                .attr("class", "extra")
                .text("");

            var split = labels
              .filter(function (d) {
                return d.name.split(" ").length > 2;
              });
              
            split.append("tspan")
                .attr("x", function(d) { 
                  var location = chart.xScale(d.area[d.area.length - 1].x) - 2; 
                  
                  if (location < 120 || (d.extraLabel === "CCNPAU" && location < chart.width() - 120)) {
                    location = location + 4;
                  }
                  return location;
                })
                .attr("y", function(d) { return chart.yScale(d.area[d.area.length - 1].y1) - 5; })
                .attr("dy", "-2.6em")
                .attr("class", "desc")
                .text("");

            split.append("tspan")
                .attr("x", function(d) { 
                  var location = chart.xScale(d.area[d.area.length - 1].x) - 2; 
                  
                  if (location < 120 || (d.extraLabel === "CCNPAU" && location < chart.width() - 120)) {
                    location = location + 4;
                  }
                  return location;
                })
                .attr("y", function(d) { return chart.yScale(d.area[d.area.length - 1].y1) - 5; })
                .attr("dy", "-1.4em")
                .attr("class", "desc")
                .text("");

            if (split.size() > 0) {
              extra
                .attr("dy", "-3em");
            }

            labels
              .filter(function (d) {
                return d.name.split(" ").length <= 2;
              })
              .append("tspan")
              .attr("x", function(d) { 
                var location = chart.xScale(d.area[d.area.length - 1].x) - 2; 
                
                if (location < 120 || (d.extraLabel === "CCNPAU" && location < chart.width() - 120)) {
                  location = location + 4;
                }
                return location;
              })
              .attr("y", function(d) { return chart.yScale(d.area[d.area.length - 1].y1) - 5; })
              .attr("dy", "-1.4em")
              .attr("class", "desc")
              .text("");

            labels.append("tspan")
              .attr("x", function(d) { 
                var location = chart.xScale(d.area[d.area.length - 1].x) - 2; 
                
                if (location < 120 || (d.extraLabel === "CCNPAU" && location < chart.width() - 120)) {
                  location = location + 4;
                }
                return location;
              })
              .attr("y", function(d) { return chart.yScale(d.area[d.area.length - 1].y1) - 5; })
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

            selection.selectAll(".extra")
              .delay(function(d,i) {
                // console.log(d);
                if ((!d.dateChange && chart.data.length > 1 && d.area[0].x.toString() === chart.mindate.toString())) {
                  return 0;
                }
                else if (chart.data[chart.data.length - 1].spent.value > 0) {
                  return chart.duration()*6;
                }
                else {
                  return chart.duration()*3;
                }
              })
              .text(function(d) { 
                return d.extraLabel;
              });

            selection.selectAll(".desc")
              .delay(function(d,i) {
                // console.log(d);
                if ((!d.dateChange && chart.data.length > 1 && d.area[0].x.toString() === chart.mindate.toString())) {
                  return 0;
                }
                else if (chart.data[chart.data.length - 1].spent.value > 0) {
                  return chart.duration()*6;
                }
                else {
                  return chart.duration()*3;
                }
              })
              .text(function(d, i) { 
                // console.log(d.area[0].x.toString() === chart.mindate.toString());
                // console.log(chart.mindate.toString());
                // console.log(d.area[0].x.toString());

                var name = d.name.toLowerCase();

                if ( d.area[0].x.toString() === chart.mindate.toString() ) {
                  name = "Initial " + name;
                }

                if ( d.name.split(" ").length > 2 ) {
                  if (i % 2 === 0) {
                    return name.split(" ").slice(0,2).join(" ");
                  }
                  else {
                    return name.split(" ").slice(2).join(" ") + ":";
                  }
                }
                else {
                  return name + ":"; 
                }
              });

            selection.selectAll(".num")
              .delay(function(d, i) {
                // console.log(d.change);
                // console.log(d.dateChange);
                // console.log(chart.data.length);
                // console.log(d.area[0].x.toString());
                // console.log(chart.mindate.toString());
                if ((!d.dateChange && chart.data.length > 1 && d.area[0].x.toString() === chart.mindate.toString())) {
                  return 0;
                }
                else if (chart.data[chart.data.length - 1].spent.value > 0) {
                  return chart.duration()*6;
                }
                else {
                  return chart.duration()*3;
                }
              })
              .text(function (d) {
                var value = chart.formatMoney(d.area[d.area.length-1].y1, chart.data[0].currency);
                if ( chart.data[chart.data.length - 1].extrapolated === "yes"  && d.area[0].x.toString() !== chart.mindate.toString()) {
                  return value + " (extrapolated)";
                }
                else {
                  return value;
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
            //       return (cost / 1e9) + " billion";
            //     }
            //     else if (cost > 1e6) {
            //       return (cost / 1e6) + " million";
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
            .data(function() {
              var path = data.filter(function (milestone, index, data) {
                  if ( index === 0 || index === data.length - 1 || milestone.spent.value >  data[index - 1].spent.value ) {
                    return milestone;
                  }
                });

              if ( data[0].projections[0].extraLabel === "" ) {
                return [path];
              }
              else {
                var first = data.filter(function (milestone, index, data) {
                  if ( index === 0 || (index !== data.length - 1 && milestone.spent.value > data[index - 1].spent.value) ) {
                    return milestone;
                  }
                });

                var last = data.filter(function (milestone, index, data) {
                  if ( index === 0 || (index === data.length - 1 && milestone.spent.value > data[index - 1].spent.value) ) {
                    return milestone;
                  }
                });

                return [first, last];
              }
            }
            );
                
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


            // selection
            //   .style("fill", "red")
            //   .style("opacity", ".6")
            //   .style("stroke", "none");

            selection
              .attr("class", "area spent")
              .attr("d", area);

            return selection;
          },
        }

      });

      // add spent labels
      this.layer("spentlables", chart.layers.spentLabelsBase, {
        dataBind: function(data) {
          if (data.length > 1  && data[data.length - 1].spent.value > 0) {
            if ( data[0].projections[0].extraLabel === "" ) {
              return this.selectAll(".spent-labels")
                .data([data[data.length - 1]], function(d) { return d.spent.value; });
            }
            else {
              return this.selectAll(".spent-labels")
                .data(data.filter(function (milestone, index, data) {
                  if ( index > 0 && milestone.spent.value > data[index - 1].spent.value ) {
                    return milestone;
                  }
                }), function(d) { return d.spent.value; });
            }
          }
          else {
            return this.selectAll(".spent-labels")
              .data([]);
          }
        },

        insert: function() {
          var selection = this
            .append("g");

          return selection
            .attr("class", "spent-labels")
            .append("text")
              .attr("class", "label spent");
        },

        events: {
          "merge" : function() {
            var chart = this.chart();
            var selection = this;

            var labels = selection.selectAll("text");

            labels.selectAll("tspan").remove();

            labels
              .filter(function (d) {
                return d.extraLabel !== "";
              })
              .append("tspan")
                .attr("x", function(d) { 
                var location = chart.xScale(d.dateObject) - 2; 
                
                if (location < 120 || (d.extraLabel === "CCNPAU" && location < chart.width() - 120)) {
                  location = location + 4;
                }
                return location;
              })
                .attr("y", function(d) { return chart.yScale(d.spent.value) - 5; })
                .attr("dy", "-2em")
                .attr("class", "extra")
                .text("");

            labels.append("tspan")
              .attr("x", function(d) { return chart.xScale(d.dateObject) - 2; })
              .attr("y", function(d) { return chart.yScale(d.spent.value) - 5; })
              .attr("dy", "-1.4em")
              .attr("class", "desc")
              .text("");

            labels.append("tspan")
              .attr("x", function(d) { return chart.xScale(d.dateObject) - 2; })
              .attr("y", function(d) { return chart.yScale(d.spent.value) - 5; })
              .attr("dy", 0)
              .attr("class", "num")
              .text("");
          },

          "merge:transition" : function() {
            var chart = this.chart();
            var selection = this;

            selection.selectAll(".extra")
              .delay(chart.duration()*3)
              .text(function(d) { 
                // console.log(d);
                return d.projections.length > 0 ? d.projections[0].extraLabel : d.extraLabel;
              });

            selection.selectAll(".desc")
              .delay(chart.duration()*3)
              .text("Spent so far:");

            selection.selectAll(".num")
              .delay(chart.duration()*3)
              .text(function (d) {
                // console.log(d);
                return chart.formatMoney(d.spent.value, d.currency);
              });
          },

          "exit" : function() {
            this.remove();
          }
        }

      });


      // // add initial estimate line
      // this.layer("initline", chart.layers.initLine, {
      //   modes : ["web", "tablet"],
      //   dataBind: function(data) {
      //     return this.selectAll("line.line")
      //       .data([data]);
                
      //   },

      //   // insert line
      //   insert: function() {
      //     var selection = this.append("svg:line");

      //     return selection;
      //   },

      //   events: {
      //     "merge" : function() {
      //       var chart = this.chart();
      //       var selection = this;

      //       selection
      //         .attr("x1", 0)
      //         .attr("y1", chart.yScale(chart.data[0][chart.yData()[3].name]))
      //         .attr("y2", chart.yScale(chart.data[0][chart.yData()[3].name]));

      //       selection
      //         .attr("class", "line");
              
      //       return selection;
      //     },

      //     "merge:transition" : function() {
      //       var chart = this.chart();
      //       var selection = this;

      //       if ( chart.data[0][chart.yData()[3].name] > 0 && chart.data[0].Program !== "California's Unemployment Insurance Modernization" && chart.data.length > 1 && chart.data[chart.data.length - 1][chart.yData()[3].name] / chart.data[0][chart.yData()[3].name] > 1.05) {
      //         selection
      //           .duration(chart.duration())
      //           .attr("x2", chart.width());
      //       }
      //       else {
      //         selection
      //           .attr("x2", 0);
      //       }
            
      //     }
      //   },
      // });

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
              if ( chart.data[0].Program !== "California’s Unemployment Insurance Modernization" && selection.datum().spent.value > 0) {
                selection.append("p")
                  .append("em")
                  .text(function (d) {
                    return "Spent so far: " + chart.formatMoney(d.spent.value,d.currency);
                  });
              }

              if ( chart.data[0].Program !== "California’s Unemployment Insurance Modernization" && Math.abs(selection.datum().estimated.change) > 0 ) {
                selection.append("p")
                  .append("em")
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

      var dateFormat = d3.time.format("%Y-%m-%d");

      chart.data = data;

      data.forEach(function (datapoint) {
        datapoint.class = "datapoint";
      });

      data[0].class = "initial";
      data[data.length - 1].class = "selected";

      chart.base
        .classed("multi", function() { return data[0].extraLabel !== ""; });

      // console.log(chart.data);

      //update x scale domain
      chart.mindate = dateFormat.parse(data[0].dateOriginal.replace(/T.*Z$/,""));
      chart.maxdate = d3.max(data, function (d) {
        var seriesMaxes = []; 

        chart.data.forEach(function (milestone) {
          var milestoneMaxes = [];

          milestone.projections.forEach(function (projection) {
            milestoneMaxes.push(projection.area[1].x);
          });
          // console.log(milestoneMaxes);

          seriesMaxes.push(d3.max(milestoneMaxes));
        });
        // console.log(seriesMaxes);
        // console.log(d3.max(seriesMaxes));
        return d3.max(seriesMaxes);
          // return d3.max([formatString.parse(d.schedOriginal),formatString.parse(d.dateOriginal)]);
      });

      // console.log(chart.yData());

      chart.maxCost = d3.max(data, function (d) {  
        var seriesMaxes = []; 

        chart.data.forEach(function (milestone) {
          var milestoneMaxes = [];

          milestone.projections.forEach(function (projection) {
            milestoneMaxes.push(projection.area[1].y1);
          });
          // console.log(milestoneMaxes);

          seriesMaxes.push(d3.max(milestoneMaxes));
        });
        // console.log(seriesMaxes);
        // console.log(d3.max(seriesMaxes));
        return d3.max(seriesMaxes);

        // chart.yData().forEach(function (series) {
        //   seriesMaxes.push(d[series.name]);
        // });
        // console.log(d3.max(seriesMaxes));
        // return d3.max(seriesMaxes);
        // // return d[chart.yData()[2]] || d[chart.yData()[1]];
      });

      chart.xScale.domain([chart.mindate,chart.maxdate]);

      //update y scale domain
      chart.yScale.domain([0,chart.maxCost]);

      // data.forEach(function (d,i,data) {
      //   if (i > 0) {
      //     data[i].prevSlope = chart.yScale(data[i-1].projections[0].area[1].y1 - d.projections[0].area[0].y1) / chart.xScale(d.projections[0].area[1].x - d.projections[0].area[0].x);
      //   }
      // });

      // console.log(data);

      chart.layers.ylabels.select(".y.axis-label text")
        .text(function() {
          var yLabelText = data[0].currency;
          if ( chart.maxCost >= 1e9 ) {
            yLabelText += ", billions";
          }
          else if ( chart.maxCost >= 1e6 ) {
            yLabelText += ", millions";
          }
          else {
            yLabelText += chart.maxCost;
          }
          
          return yLabelText;
        });

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
        formatted += (amount / 1e9).toFixed(2).replace(/^(\d+\.\d*?[1-9])0+$|(\.0*?)$/, "$1") + " billion";
      }
      else if ( amount >= 1e6 ) {
        formatted += (amount / 1e6).toFixed(2).replace(/^(\d+\.\d*?[1-9])0+$|(\.0*?)$/, "$1") + " million";
      }
      else {
        formatted += amount;
      }

      return formatted;
    }

});

d3.csv("data/estimates.csv", function (data) {
  "use strict";
  var container = d3.select("#chart");
  var parWidth = container.node().parentNode.offsetWidth;
  var margins = {top: 65, bottom: 30, right: 5, left: 40};
  var width = parWidth - margins.left - margins.right;
  var height = width * 3.6 / 8;

  var milestone = 1; // counter to keep track of chart state
  var currentProjectID = 0; 

  var formatString = d3.time.format("%b %Y");

  var potentialSeries = [
    { "name": "Monies spent to date", "class": "spent" },
    // { "name": "Total committed spending", "class": "spent" },
    { "name": "Total life cycle cost", "class": "tot-est" },
    { "name": "Estimated cost to develop", "class": "dev-est" },
    { "name": "Payroll development cost", "class": "payroll-est" },
    // { "name": "Annual maintenance & operational costs", "class": "annual-est" },
    // { "name": "Maintenance & operational costs", "class": "maint-est" }
  ];

  data = d3.nest()
    .key(function(d) { return d.Program; })
    .entries(data);

  // console.log(data);

  data.forEach(function (d) {
    // var series = [
    //   "Estimated cost to develop",
    //   "Total life cycle cost",
    //   "Annual maintenance & operational costs",
    //   "Monies spent to date"
    //   ];

    // series.forEach(function(potentialSeries) {
    //   var seriesValues = d.values.map(function (milestone) {
    //       return milestone[potentialSeries];
    //     });
    // });

    var prevValue = {};
    var prevScale = {};
    var prevEndDate = {};
    
    potentialSeries.forEach (function (series) {
      prevValue[series.name] = null;
    });

    function parseCostString (data, key) {
      var cost = {};
      // console.log(data[key]);
      // console.log(prevValue);
      if (data[key] === "") {
        // console.log("no data");
        cost = {"value":prevValue[key], "change": null};
      }
      else {
        cost = {"value":+data[key], "change": null};
        if (prevValue[key] > 0) {
          cost.change = data[key] - prevValue[key];
        }
        else if (key === "Estimated cost to develop" && cost.value > prevValue["Total life cycle cost"]) {
          cost.change = cost.value - prevValue["Total life cycle cost"];
        }
        prevValue[key] = +data[key];
      }

      // console.log(cost);
      return cost;
    }

    function findBaseline (data, key) {
      var baseline;
      // console.log(data);
      // console.log(key);
      // console.log(prevScale[key]);
      // console.log(prevScale);
      var dateFormat = d3.time.format("%Y-%m-%d");

      var dateObject = dateFormat.parse(data.date.replace(/T.*Z$/,""));
      if ( data["Monies spent to date"] > 0 && !data["extra label"] ) {
        baseline = data["Monies spent to date"];
      }
      else if (prevScale[key]) {
        if (dateObject > prevEndDate[key]) {
          baseline = prevScale[key](prevEndDate[key]);
        }
        else {
          baseline = prevScale[key](dateObject);
          // console.log("baseline");
          // console.log(baseline);
        }
      }
      else if (d3.keys(prevScale).length > 0) {
        baseline = prevScale[d3.keys(prevScale)[0]](dateObject);
      }
      else {
        baseline = 0;
      }

      prevEndDate[key] = dateFormat.parse(data["Estimated schedule"].replace(/T.*Z$/,""));
      return baseline;
    }

    var currency = d.values[0].Currency;
    d.Program = d.values[0].Program;
    d.Currency = currency;

    // console.log(d.values[0].date);
    var dateFormat = d3.time.format("%Y-%m-%d");
    d.mindate = dateFormat.parse(d.values[0].date.replace(/T.*Z$/,""));
    // console.log(d.mindate);

    // console.log(d.values);
    d.nestedValues = d3.nest().key(function(d) { return d.date; }).entries(d.values);
    // console.log(d.nestedValues);

    d.milestones = d.nestedValues.map(function (nestedDate) { 
      milestone = nestedDate.values[0];
      var dateFormat = d3.time.format("%Y-%m-%d");

      var dateObject = dateFormat.parse(milestone.date.replace(/T.*Z$/,""));
      var schedObject = new Date(milestone["Estimated schedule"]);

      var estimated = parseCostString(milestone,"Estimated cost to develop");
      var total = parseCostString(milestone,"Total life cycle cost");
      var annual = parseCostString(milestone,"Annual maintenance & operational costs");
      var spent;
      spent = parseCostString(milestone,"Monies spent to date");

      

      // console.log(nestedDate.values);

      // if ( nestedDate.values.length === 1 ) {
      //   spent = parseCostString(milestone,"Monies spent to date");
      // }
      // else {
      //   spent = [];
      //   for( var i=0; i < nestedDate.values.length - 1; i++ ){
      //     spent.push(parseCostString(nestedDate.values[i], "Monies spent to date" + i));
      //   }
      // }

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

        "extrapolated": milestone.extrapolated,
        "extraLabel": milestone.extraLabel,

        "schedOriginal": milestone["Estimated schedule"],
        "formattedSched": formatString(schedObject),
        "schedObject": schedObject,

        "launch" : milestone.date === milestone["Estimated schedule"],

        "headline" : milestone.Headline,
        "notes": milestone.Notes,

        "estimated": estimated,
        "total": total,
        "annual": annual,
        "spent": spent,

        // "projection": [
        //   {
        //     x: dateObject,
        //     y0: spent.value !== null ? spent.value : 0,
        //     y1: spent.value !== null ? spent.value : 0,
        //     y2: spent.value !== null ? spent.value : 0,
        //     y3: spent.value !== null ? spent.value : 0
        //   },
        //   {
        //     x: schedObject,
        //     y0: spent.value !== null ? spent.value : 0,
        //     y1: estimated.value,
        //     y2: total.value,
        //     y3: annual.value,
        //   }
        // ],

        "projections" :  (function() {
          var projections = potentialSeries.filter(function(entry) {
            // return entry.class === "dev-est" && milestone[entry.name] !== "";
            if ( milestone["Estimated cost to develop"] === "" && milestone["Payroll development cost"] === "" && milestone.date !== milestone["Estimated schedule"] ) {
              return entry.name === "Total life cycle cost";
            }
            else {
              return entry.class !== "spent" && milestone[entry.name] !== "" && entry.name !== "Total life cycle cost";
            }
          })
          .map(function(entry) {
            // console.log(entry);
            function calcProjection (milestone, i) {
              i = typeof i !== "undefined" ? i : 0;
              var schedObject = new Date(milestone["Estimated schedule"]);
              var dateChange = prevEndDate[entry.name + i] ? schedObject - prevEndDate[entry.name + i] : null;
              // var baseline = spent.value !== null ? spent.value : 0;
              var baseline = findBaseline(milestone, entry.name + i);
              // console.log(baseline);
              // var baseline = 0;
              // var start = spent.value !== null ? dateObject : d.mindate;
              var start = dateObject;
              // prevValue = {};
              var end = parseCostString(milestone, entry.name);
              // var spend = parseCostString(milestone, entry["Monies spent to date"]);

              // var end;

              // if ( entry.name = "Estimated cost to develop" ) {
              //   end = estimated;
              // }
              // else if ( entry.name = "Total life cycle cost" ) {
              //   end = total;
              // }
              // else if ( entry.name = "Payroll development cost") {
              //   end = parseCostString(milestone, entry.name);
              // }

              var endValue = end.value;
              var newScale = d3.time.scale().range([baseline,endValue]).domain([start,schedObject]);

              // console.log(end);
              // console.log(newScale(schedObject));

              prevScale[entry.name + i] = newScale;
              return {
                  "name": entry.name,
                  "extraLabel": milestone["extra label"],
                  "class": entry.class,
                  "scale": newScale,
                  "change": end.change,
                  "dateChange": dateChange,
                  "area": [
                    { "x": start, "y1": baseline, "y0": 0 },
                    { "x": schedObject, "y1": endValue, "y0": 0 }
                  ],
                  "spent": spent
                };
            }

            if ( nestedDate.values.length > 1 ) {
              var temps = [];
              nestedDate.values.forEach(function (milestone, i) { 
                if (milestone.date !== milestone["Estimated schedule"]) {
                  temps.push(calcProjection(milestone, milestone["extra label"])); 
                }
              });
              // console.log(temps);
              return temps;
            }

            else {
              if (milestone["extra label"] !== "") {
                return calcProjection(milestone, milestone["extra label"]);
              }
              else {
                return calcProjection(milestone, 0);
              }
            }
          });
          // console.log(projections);
          if ( Array.isArray(projections[0]) ) {
            return projections[0].sort(function(a,b){return b.area[1].y1 - a.area[1].y1;});
          }
          return projections;
        })()

      };

      potentialSeries.forEach (function (series) {
        datapoint[series.name] = parseCostString(milestone, series.name).value;
      });

      return datapoint; 
    });

    d.milestones.sort(function(a,b){return a.dateObject.getTime() - b.dateObject.getTime();});

    // console.log(prevValue);

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

    // console.log("data point processed");
    // console.log(d.projection);
  });

  // data.sort(function(a,b){return a.dateObject.getTime() - b.dateObject.getTime();});

  // console.log(data);

  var projectSelector = d3.select("#project-selector");
  var gaProjectsViewed = 0;
  var navButtonsClicked = 0;

  // projectSelector.append("option")
  //   .attr("class", "placeholder")
  //   .property("selected", true)
  //   .property("disabled", true)
  //   .text("Choose a project…");

  projectSelector.selectAll("option:not(.placeholder)")
    .data(data)
  .enter().append("option")
    .attr("value", function(d, i){ return i; })
    .text(function(d){ 
      return d.Program; 
    });

  projectSelector.on("change", function() {
    currentProjectID = this.value;

    var gaEventLabel = data[currentProjectID].Program;
    ga("send", "event", "dropdown", "change", gaEventLabel, gaProjectsViewed);
    gaProjectsViewed++;
    resetChart(currentProjectID);
  });

  var longDesc = container.append("div")
    .style("width", ((parWidth - 40) / 3) + "px")
    .classed("long-description", true);

  var failure = d3.select("#chart")
    .append("svg")
    // .classed("hidden", true)
    .chart("FailureChart")
    .duration(300)
    // .width(width)
    .width(((parWidth - 40) * 2 / 3) - margins.left + 15)
    .height(height)
    .margin(margins)
    .yData(potentialSeries);

  longDesc.node().parentNode.appendChild(longDesc.node());

  var buttons = d3.selectAll(".button:not(.share)");

  if ( failure.mode() === "mobile" ) {
    buttons
      // .style("width", "100%")
      .style("margin", "0 0 .5em 2px")
      .style("padding", "0 6px")
      .style("font-size", ".8em")
      .each(function(d,i) { 
        d3.select(this).text(d3.select(this).text().replace(/Project|Chart/,""));

        if (i === 0) {
          d3.select(this).style("margin", "0 0 .5em 0");
        }
      });

    var mobMargins = margins;
    mobMargins.right = 10;
    mobMargins.top = 50;
    mobMargins.left = 35;

    // TODO: remove 1px currently needed to force recalc
    // var mobWidth = parWidth - mobMargins.left - mobMargins.right - 1;
    var mobWidth = window.parent.document.body.clientWidth - mobMargins.left - mobMargins.right;

    d3.select("body").classed("mobile-view", true);

    failure
      .width(mobWidth)
      .height(mobWidth)
      .margin(mobMargins);

    longDesc
      .style("width", null);

    // failure
    //   .margin(margins)
    //   .width(container.node().parentNode.offsetWidth - 40)
    //   .height((container.node().parentNode.offsetWidth - 40) / 1.5);
  }

  var pymChild = new pym.Child();

  function resetChart(i) {
    // location.hash = "#project-selector";

    d3.select("#chart-title")
      .text(data[i].Program);

    d3.select(".share-buttons")
      .attr("data-section", i)

    failure.base
      .classed("hidden", false)
      .classed("reset", true);

    d3.select(".buttons")
      .classed("hidden", false);

    // d3.selectAll(".projection").remove();

    milestone = 1;
    // var currentMilestone = data[currentProjectID].milestones[1];

    buttons.classed("inactive", true);
    d3.select("#next").classed("inactive", false);

    d3.selectAll(".project-clip").remove();

    d3.selectAll(".spent-clip").remove();

    d3.selectAll(".spent.area").remove();

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
      var gaEventLabel = data[currentProjectID].Program + "-" + button.attr("id");

      ga("send", "event", "buttons", "click", gaEventLabel, navButtonsClicked);
      navButtonsClicked++;

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
      // console.log(currentMilestone.formattedDate);
      
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
        failure.base
          .classed("reset", false);
      }
      else {
        buttons.classed("inactive", true);
        failure.base
          .classed("reset", true);
      }

      if ( milestone < data[currentProjectID].milestones.length ) {
        d3.select("#next").classed("inactive", false);
      } 
      else {
        d3.select("#next").classed("inactive", true);
      }
    }

  });

  
  projectSelector.node().selectedIndex = currentProjectID;
  resetChart(currentProjectID);

  (function() { // force re-render of element_name to get the styling right on-print
    var beforePrint = function() {
      parWidth = container.node().parentNode.offsetWidth; // dynamically calc width of parent contatiner
      width = parWidth - margins.left - margins.right;
      height = width * 3.6 / 8;

      // console.log("beforePrint");

      d3.select("body").classed("print-view", true);

      longDesc
        .style("width", null);

      failure
        .width(width)
        .height(height)
        .draw(failure.data);

      pymChild.sendHeight();
    };

    var afterPrint = function() {
      parWidth = container.node().parentNode.offsetWidth; // dynamically calc width of parent contatiner
      width = parWidth - margins.left - margins.right;
      height = width * 3.6 / 8;

      // console.log("afterPrint");

      d3.select("body").classed("print-view", false);

      longDesc
        .style("width", ((parWidth - 40) / 3) + "px");

      failure
        .width(((parWidth - 40) * 2 / 3) - margins.left + 15)
        .height(height)
        .draw(failure.data);

      pymChild.sendHeight();
    };

    if (window.matchMedia) {
      window.matchMedia("print").addListener(function(mql) {
        if (mql.matches) { 
          beforePrint(); 
          window.matchMedia("screen").addListener(function(newMql) {
            if (newMql.matches) {
              afterPrint();
            }
          });
        }
      });
    }

    window.onbeforeprint = beforePrint;
    window.onafterprint = afterPrint;
  }());

  var Share = function() {
    // var fbInitialized = false;
    
    function shareData() {
      var data = {
        // title: $("meta[property='og:title']").attr('content'),
        // longTitle: "",
        // url: $("meta[property='og:url']").attr('content'),
        // image: $("meta[property='og:image']").attr('content'),
        // description: $("meta[property='og:description']").attr('content')
        title: "The Life Cycles of Failed Projects",
        preTitle: "Lessons from a Decade of IT Failures:",
        url: window.parent.location.protocol + "//" + 
            window.parent.location.host +
            window.parent.location.pathname,
        // images: {
        //   "default":"/images/FiReControlSystem.png"
        //   // "modernization": "/images/modernization-timeline-fb.png",
        //   // "health": "/images/health-timeline-fb.png",
        //   // "banks": "/images/banks-timeline-fb.png",
        //   // "exchange": "/images/exchanges-timeline-fb.png",
        //   // "air": "/images/air-timeline-fb.png"
        // },
        images : [
          "/images/USAirForce.png",
          "/images/FiReControlSystem.png",
          "/images/FiReControlSystem.png",
          "/images/FiReControlSystem.png",
          "/images/Queensland.png",
          "/images/FiReControlSystem.png"
        ],
        description: "When even more money and more time can’t prevent project disasters"
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
        $(".share-fb").on("click",that.postToFacebook);
        $(".share-twtr").on("click",that.postToTwitter);
        $("#share-email").on("click",that.emailLink);
        $("#share-gpls").on("click",that.postToGooglePlus);
        $("#share-lin").on("click",that.postToLinkedIn);
      },
      
      postToFacebook: function(event) {
        event.preventDefault();
        var data = shareData();
        // data.title = $(this.parentNode).attr("data-section") !== undefined ? $("#" + $(this.parentNode).attr("data-section")).text() : data.title;
        data.image = data.images[+$(this.parentNode).attr("data-section")];
        var obj = {
          app_id: "174248889578740",
          method: "feed",
          // name: data.longTitle,
          name: data.title,
          link: data.url,
          caption: data.preTitle.slice(0,-1),
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

        // console.log(window)
        return "width=" + width + ",height=" + height + ",top=" + top + ",left=" + left;
      },
      
      postToTwitter: function(event) {
        event.preventDefault();
        var data = shareData();
        // data.title = $(this.parentNode).attr("data-section") !== undefined ? $("#" + $(this.parentNode).attr("data-section")).text() : data.title;
        var tweetUrl = "https://twitter.com/share?url=" + encodeURIComponent(data.url) + "&text=" + encodeURIComponent(data.preTitle + " " + data.title);
        var opts = that.centerPopup(500, 300) + "scrollbars=1";
        track("Twitter");
        window.parent.open(tweetUrl, "twitter", opts);
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

    that.assignButtons();
    return that;
  };

  var sharing = new Share();

});
