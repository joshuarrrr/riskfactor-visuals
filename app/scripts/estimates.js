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

      chart.layers.infoBoxBase = d3.select(".info-box");

      chart.layers.defs = chart.base.select("g").append("defs");

      // create an xScale

      var parWidth = chart.base.node().parentNode.parentNode.offsetWidth;
      var margins = {top: 30, bottom: 30, right: 20, left: 100};
      var width = parWidth - margins.left - margins.right;
      var height = width * 3.5 / 8;
      this.xScale = d3.time.scale()
        .range([0, width - 1]);

      // when the width changes, update the x scale range
      chart.on("change:width", function(newWidth) {
        chart.xScale.range([0, newWidth - 1]);
      });

      // create a yScale
      this.yScale = d3.scale.linear()
        .range([height,0]);

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
          .text("US $");

      chart.layers.xAxisBase.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")");

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
                return chart.formatMoney(d);
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

      this.layer("projectedMask", chart.layers.defs, {
        dataBind: function(data) {
          return this.selectAll("clipPath.project-clip")
            .data(data
              .filter(function(d,i,arr) {
                return !d.launch && (i === 0 || arr[i].projections[0].area[1].y1 > arr[i - 1].projections[0].area[1].y1 || arr[i].projections[0].area[1].x > arr[i - 1].projections[0].area[1].x);
              })
              , function(d,i) { return i; });
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
              console.log(i);
              console.log(selection.size() - 1);
              console.log(d);
              console.log(i === selection.size() - 1 && (d.projections[0].change !== 0 || d.projections[0].dateChange) && !chart.data[chart.data.length - 1].launch);
              return i === selection.size() - 1 && (d.projections[0].change !== 0 || d.projections[0].dateChange) && !chart.data[chart.data.length - 1].launch;
            }).select("rect")
              .attr("width", 0);
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
              .classed("launch", function(d) { console.log(d.launch); return d.launch; });

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
              .attr("x", function(d) { return chart.xScale(d.area[d.area.length - 1].x) - 2; })
              .attr("y", function(d) { return chart.yScale(d.area[d.area.length - 1].y1) - 5; })
              .attr("dy", "-1em")
              .attr("class", "desc")
              .text("");

            labels.append("tspan")
              .attr("x", function(d) { return chart.xScale(d.area[d.area.length - 1].x) - 2; })
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
                var value = chart.formatMoney(d.area[d.area.length-1].y1, chart.data[0].currency);
                if ( chart.data[chart.data.length - 1].extrapolated === "yes" ) {
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
            .data([data.filter(function (milestone, index, data) {
              if ( index === 0 || index === data.length - 1 || milestone.spent.value >  data[index - 1].spent.value ) {
                return milestone;
              }
            })]);
                
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
            return this.selectAll(".spent-labels")
              .data([data[data.length - 1]], function(d) { return d.spent.value; });
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

            labels.append("tspan")
              .attr("x", function(d) { return chart.xScale(d.dateObject) - 2; })
              .attr("y", function(d) { return chart.yScale(d.spent.value) - 5; })
              .attr("dy", "-1em")
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

            selection.selectAll(".desc")
              .delay(chart.duration()*3)
              .text("Spent so far:");

            selection.selectAll(".num")
              .delay(chart.duration()*3)
              .text(function (d) {
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

      // console.log(chart.data);

      //update x scale domain
      chart.mindate = formatString.parse(data[0].dateOriginal);
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
        .text(data[0].currency);

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
  var margins = {top: 40, bottom: 30, right: 20, left: 100};
  var width = parWidth - margins.left - margins.right;
  var height = width * 3.5 / 8;

  var milestone = 1; // counter to keep track of chart state
  var currentProjectID = 0; 

  var formatString = d3.time.format("%b %Y");

  var potentialSeries = [
    { "name": "Monies spent to date", "class": "spent" },
    // { "name": "Total committed spending", "class": "spent" },
    { "name": "Total life-cycle cost", "class": "tot-est" },
    { "name": "Estimated cost to develop", "class": "dev-est" },
    { "name": "Payroll development cost", "class": "payroll-est" },
    // { "name": "Annual maintenance & operational costs", "class": "annual-est" },
    // { "name": "Maintenance & operational costs", "class": "maint-est" }
  ];

  data = d3.nest()
    .key(function(d) { return d.Program; })
    .entries(data);

  console.log(data);

  data.forEach(function (d) {
    // var series = [
    //   "Estimated cost to develop",
    //   "Total life-cycle cost",
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
    var prevEndDate;
    
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
        if (prevValue[key] > 0) {
          cost.change = data[key] - prevValue[key];
        }
        else if (key === "Estimated cost to develop" && cost.value > prevValue["Total life-cycle cost"]) {
          cost.change = cost.value - prevValue["Total life-cycle cost"];
        }
        prevValue[key] = +data[key];
      }
      return cost;
    }

    function findBaseline (data, key) {
      var baseline;
      console.log(data);
      console.log(key);
      console.log(prevScale[key]);
      console.log(prevScale);
      var dateFormat = d3.time.format("%Y-%m-%d");

      var dateObject = dateFormat.parse(data.date.replace(/T.*Z$/,""));
      if ( data["Monies spent to date"] > 0 ) {
        baseline = data["Monies spent to date"];
      }
      else if (prevScale[key]) {
        if (dateObject > prevEndDate) {
          baseline = prevScale[key](prevEndDate);
        }
        else {
          baseline = prevScale[key](dateObject);
        }
      }
      else if (d3.keys(prevScale).length > 0) {
        baseline = prevScale[d3.keys(prevScale)[0]](dateObject);
      }
      else {
        baseline = 0;
      }

      prevEndDate = dateFormat.parse(data["Estimated schedule"].replace(/T.*Z$/,""));
      return baseline;
    }

    var currency = d.values[0].Currency;
    d.Program = d.values[0].Program;
    d.Currency = currency;

    console.log(d.values[0].date);
    var dateFormat = d3.time.format("%Y-%m-%d");
    d.mindate = dateFormat.parse(d.values[0].date.replace(/T.*Z$/,""));
    console.log(d.mindate);

    console.log(d.values);
    d.nestedValues = d3.nest().key(function(d) { return d.date; }).entries(d.values);
    console.log(d.nestedValues);

    d.milestones = d.nestedValues.map(function (nestedDate) { 
      milestone = nestedDate.values[0];
      var dateFormat = d3.time.format("%Y-%m-%d");

      var dateObject = dateFormat.parse(milestone.date.replace(/T.*Z$/,""));
      var schedObject = new Date(milestone["Estimated schedule"]);

      var estimated = parseCostString(milestone,"Estimated cost to develop");
      var total = parseCostString(milestone,"Total life-cycle cost");
      var annual = parseCostString(milestone,"Annual maintenance & operational costs");
      var spent = parseCostString(milestone,"Monies spent to date");

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

        "projections" :  (function() {
          var projections = potentialSeries.filter(function(entry) {
            // return entry.class === "dev-est" && milestone[entry.name] !== "";
            if (milestone["Estimated cost to develop"] === "" && milestone["Payroll development cost"] === "") {
              return entry.name === "Total life-cycle cost";
            }
            else {
              return entry.class !== "spent" && milestone[entry.name] !== "" && entry.name !== "Total life-cycle cost";
            }
          })
          .map(function(entry) {
            console.log(entry);
            function calcProjection (milestone, i) {
              i = typeof i !== "undefined" ? i : 0;
              var schedObject = new Date(milestone["Estimated schedule"]);
              var dateChange = prevEndDate ? schedObject - prevEndDate : null;
              // var baseline = spent.value !== null ? spent.value : 0;
              var baseline = findBaseline(milestone, entry.name + i);
              console.log(baseline);
              // var baseline = 0;
              // var start = spent.value !== null ? dateObject : d.mindate;
              var start = dateObject;
              var end = parseCostString(milestone, entry.name);
              var endValue = end.value;
              var newScale = d3.time.scale().range([baseline,endValue]).domain([start,schedObject]);

              console.log(endValue);
              console.log(newScale(schedObject));

              prevScale[entry.name + i] = newScale;
              return {
                  "name": entry.name,
                  "class": entry.class,
                  "scale": newScale,
                  "change": end.change,
                  "dateChange": dateChange,
                  "area": [
                    { "x": start, "y1": baseline, "y0": 0 },
                    { "x": schedObject, "y1": endValue, "y0": 0 }
                  ]
                };
            }

            if ( nestedDate.values.length > 1 ) {
              var temps = [];
              nestedDate.values.forEach(function (milestone, i) { temps.push(calcProjection(milestone, i)); });
              console.log(temps);
              return temps;
            }

            else {
              return calcProjection(milestone, 0);
            }
          });
          console.log(projections);
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

    console.log("data point processed");
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
    .text(function(d){ return d.Program; });

  projectSelector.on("change", function() {
    currentProjectID = this.value;

    var gaEventLabel = data[currentProjectID].Program;
    ga("send", "event", "dropdown", "change", gaEventLabel, gaProjectsViewed);
    gaProjectsViewed++;
    resetChart(currentProjectID);
  });

  var failure = d3.select("#chart")
    .append("svg")
    // .classed("hidden", true)
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

    var mobMargins = margins;
    mobMargins.left = mobMargins.right * 2;

    // TODO: remove 1px currently needed to force recalc
    var mobWidth = parWidth - mobMargins.left - mobMargins.right - 1;

    d3.select("body").classed("mobile-view", true);

    failure
      .width(mobWidth)
      .height(mobWidth / 1.5)
      .margin(mobMargins);

    // failure
    //   .margin(margins)
    //   .width(container.node().parentNode.offsetWidth - 40)
    //   .height((container.node().parentNode.offsetWidth - 40) / 1.5);
  }

  var pymChild = new pym.Child();

  function resetChart(i) {
    location.hash = "#project-selector";

    d3.select("#chart-title")
      .text(data[i].Program);

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

});
