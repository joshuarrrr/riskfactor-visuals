/*global d3, pym, ga */
d3.chart("MarginChart").extend("BubbleTimeline", {

  transform: function(data) {
    "use strict";
    var chart = this;

    chart.data = data;

    // console.log(data);

    //get an array of unique values for a given key
    chart.categories = d3.set(data
      .filter(function (d) {
        // filter out data that has no set value (category)
        if (d[chart.yData()] !== "") {
          return d;
        } 
      })
      .map(function(d) { return d[chart.yData()]; }))
      .values().sort();

    // console.log(chart.categories);
    //update y scale domain
    chart.yScale.domain(chart.categories);

    // var sums = d3.nest()
    //   .key(function(d) { return d[chart.yData()]; })
    //   .rollup(function(values) { return d3.sum(values, function(d) {return parseInt(d.impact_qty); }) })
    //   .map(data);

    //update x scale domain

    // var sortedByDate = data.sort(function(a,b){return a.dateObject.getTime() - b.dateObject.getTime();});
    // mindate = formatString.parse(sortedByDate[0].dateOriginal);
    // console.log(mindate);
    // maxdate = formatString.parse(sortedByDate[data.length-1].dateOriginal);
    // console.log(maxdate);
    // console.log(sortedByDate[0].dateOriginal);
    // console.log(sortedByDate[0].formattedDate);
    // console.log(formatString.parse(sortedByDate[0].dateOriginal));
    // chart.xScale.domain([mindate,maxdate]).nice();

    chart.xScale.domain(d3.extent(data, function(d) { return d.dateObject; })).nice();

    //update r scale domain
    chart.min = d3.min(data, function(d) { 
      if (d[chart.rData()] > 0) {
        return d[chart.rData()]; 
      }
    });
    chart.max = d3.max(data, function(d) { return d[chart.rData()]; });

    chart.minVisible = 0;

    // console.log(chart.min);
    // console.log(chart.max);

    chart.rScale.domain([0, chart.max]);

    // console.log(chart.rScale(chart.max));
    // console.log(chart.rScale(chart.min));

    chart.dateIndexMax = d3.max(data, function(d) {
      return d.dateIndex;
    });

    return data;
  },

  initialize: function() {
    "use strict";

    var chart = this;

    chart.layers = {};
    chart.quantities = [];
    chart.sortables = [];
    chart.fillOpacity = 0.3;

    chart.gaDatapointsClicked = 0;
    chart.gaCategoriesChanged = 0;
    chart.gaMetricChanged = 0;

    chart.maxBubbleSize = 70;
    chart.instructs = "To begin exploring the timeline, select one of the circles below." + 
      "<div class=\"optional hidden\">You can also: <ul class=\"instructs-list\"><li>Change the “<span class=\"ui-label\">Size by</span>” menu to reveal failures with other types of impacts.</li><li>Change the “<span class=\"ui-label\">View range</span>” to reveal failures currently too large or small to display.</li><li>Use the “<span class=\"ui-label\">Sort by</span>” menu to change the failures are categorized.</li></ul></div>";
    
    chart.parentID = d3.select(chart.base.node().parentNode).attr("id");

    // console.log(chart);

    chart.layers.backgroundBase = chart.base.select("g").append("rect")
      .attr("class", "chart-background")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", chart.width())
      .attr("height", chart.height())
      .style("opacity", 0);

    chart.layers.axesBase = chart.base.select("g").append("g")
      .classed("axes", true);

    // chart.layers.statusBase = chart.base.select("g").append("g")
    //   .classed("status-base", true);

    chart.layers.linesBase = chart.base.select("g").append("g")
      .classed("lines", true);

    chart.layers.labelsBase = chart.base.select("g").append("g")
      .classed("labels", true);

    chart.layers.circlesBase = this.base.select("g").append("g")
      .classed("circles", true);

    // chart.layers.legendBase = this.base.append("g")
    //   .classed("legend", true);

    // chart.layers.infoBoxBase = this.base.append("g")
    //   .classed("circle-info-box", true);

    chart.layers.infoBoxBase = d3.select(chart.base.node().parentNode).select(".info-box");

    chart.layers.selectorsBase = d3.select(chart.base.node().parentNode).select(".selectors");

    chart.layers.statusBase = chart.layers.selectorsBase.select(".status-base");

    chart.layers.legendBase = chart.layers.infoBoxBase.append("svg")
      .classed("legend-base", true)
      .append("g")
        .classed("legend", true)
      .append("g")
        .classed("legend-inner", true);

    chart.layers.legendOuter = chart.layers.infoBoxBase.select(".legend")
      .append("g")
        .classed("legend-outer", true);

    // create an xScale
    chart.xScale = d3.time.scale()
      .range([0, chart.width()]);

    // when the width changes, update the x scale range
    chart.on("change:width", function(newWidth) {
      // console.log("width changed");
      chart.xScale.range([0, newWidth]);
      chart.layers.backgroundBase
        .attr("width", newWidth);
    });

    // create a yScale
    chart.yScale = d3.scale.ordinal()
      .rangeRoundBands([0, chart.height()], 0);

    // when the height changes, update the y scale range
    chart.on("change:height", function(newHeight) {
      // console.log("height changed");
      chart.yScale.rangeRoundBands([0, newHeight], 0);
      chart.layers.backgroundBase
        .attr("height", newHeight);
    });

    // // when the y data changes, update y scale domain
    // chart.on("change:yData", function(newYData) {
    //   //get an array of unique values for a given key
    //   console.log(newYData);
    //   console.log(chart.yData());
    //   // console.log(chart.data);
    //   var categories = chart.data ? d3.set(chart.data.map(function(d) { return d[chart.yData()]; })).values() : [];
    //   console.log(categories);
    //   //update y scale domain
    //   chart.yScale.domain(categories);

    // });
      
    // create a rScale
    chart.rScale = d3.scale.sqrt()
      .range([0, chart.maxBubbleSize]);

    // // when the r data changes, update r scale domain
    // chart.on("change:rData", function(newRData) {
    //   console.log(newRData);
    //   //update r scale domain
    //   var min = chart.data ? d3.min(chart.data, function(d) { return d[chart.rData()]; }) : 0;
    //   var max = chart.data ? d3.max(chart.data, function(d) { return d[chart.rData()]; }) : 0;
    //   console.log(max);
    //   chart.rScale.domain([0, max]);

    // });

    var instructions = chart.layers.infoBoxBase.append("div")
      .attr("class", "instructions")
    .append("p")
      .attr("class", "instructions")
      .html(chart.instructs);

    if ( !chart.layers.selectorsBase.select(".select-size").empty() ) {
      chart.layers.infoBoxBase.selectAll(".instructions .optional").classed("hidden", false);
    }

    // var buttons = chart.layers.infoBoxBase.append("div")
    //   .attr("class", "nav-buttons");

    // buttons.append("a")
    //   .attr("class", "prev button")
    //   .attr("href", "#")
    //   .text("← Earlier");

    // buttons.append("a")
    //   .attr("class", "next button")
    //   .attr("href", "#")
    //   .text("Later →");

    var defs = chart.layers.legendOuter.append("defs");

    var grad = defs.append("linearGradient")
      .attr("id", "mid-grad");

    grad.append("stop")
      .attr("offset", "10%")
      .attr("stop-color", "#bbb");

    grad.append("stop")
      .attr("offset", "50%")
      .attr("stop-color", "#888");

    grad.append("stop")
      .attr("offset", "90%")
      .attr("stop-color", "#bbb");

    // var zoomControls = chart.layers.legendOuter.append("g")
    //   .attr("class", "zoom-controls");

    // zoomControls.append("rect")
    //   .attr("class", "zoom-bg")
    //   .attr("x", -chart.maxBubbleSize)
    //   .attr("y", -chart.maxBubbleSize)
    //   .attr("width", 2 * chart.maxBubbleSize)
    //   .attr("height", 20)
    //   .attr("fill", "url(#mid-grad)");

    // zoomControls.append("text")
    //   .attr("class", "zoom out inactive")
    //   .attr("x", -chart.maxBubbleSize)
    //   .attr("dx", ".5em")
    //   .attr("dy", "1em")
    //   .attr("y", -chart.maxBubbleSize)
    //   .text("-");

    // zoomControls.append("text")
    //   .attr("class", "")
    //   .attr("x", 0)
    //   .attr("dx", "0")
    //   .attr("dy", "1em")
    //   .attr("y", -chart.maxBubbleSize)
    //   .attr("text-anchor", "middle")
    //   .text("zoom");

    // zoomControls.append("text")
    //   .attr("class", "zoom in")
    //   .attr("x", chart.maxBubbleSize)
    //   .attr("dx", "-.5em")
    //   .attr("dy", "1em")
    //   .attr("y", -chart.maxBubbleSize)
    //   .attr("text-anchor", "end")
    //   .text("+");

    // add size selection layer
    this.layer("size-selector", chart.layers.selectorsBase.select(".select-size"), {
      dataBind: function() {
        var chart = this.chart();

        // console.log(chart.quantities);
        return this.selectAll("option")
          .data(chart.quantities);
      },

      insert: function() {
        var selection = this.append("option");

        selection
          .attr("value", function(d) { return d.columnName; })
          .text(function(d) { return d.label; });

        return selection;
      },

      events: {
        "merge" : function() {
          var chart = this.chart();
          var selection = this;
          var selector = selection.node().parentNode;

          var visible = chart.data
            .filter(function(d) {
              // console.log(d[chart.yData()]);
              return d[chart.rData()] > 0;
            });

          selection.each(function (d,i) {
            if (d.columnName === chart.rData()) {
              selector.selectedIndex = i;
            }
          });

          d3.select(selection[0][selector.selectedIndex])
            .classed("selected", true);

          chart.layers.infoBoxBase.select(".instructions .metric")
            .text(d3.select(selection[0][selector.selectedIndex]).datum().instructsLabel);


          d3.select(selector.parentNode).select(".limits")
            .html("(" + visible.length + " of " + chart.data.length + " failures)");

          d3.select(selector).on("change", function() {
            // console.log("clicked size selector");
            var activeSelection = chart.base.select(".data-point.active");
            var selectedOption = d3.select(selection[0][selector.selectedIndex]);
            var metric = selectedOption.datum();

            // console.log(selection[0][selector.selectedIndex]);

            chart.layers.infoBoxBase.select(".instructions .metric")
              .text(metric.instructsLabel);

            selection
              .classed("selected", false);
            selectedOption
              .classed("selected", true);

            var gaEventLabel = chart.parentID + ": from " + chart.rData() + " to " + this.value;
            // console.log(gaEventLabel);
            ga("send", "event", "data metric", "change", gaEventLabel, chart.gaMetricChanged);

            chart.gaMetricChanged++;

            // console.log(metric);
            // console.log(metric.ranges);

            // chart.layer("range-selector").draw();

            // var options = chart.layers.selectorsBase.select(".select-range").selectAll("option")
            //   .data(metric.ranges);

            // options.enter()
            //   .append("option");
                
            // options.attr("value", function(d) {
            //     if ( d.label === "Less than" ) {
            //       return d.domain[1];
            //     }
            //     else if ( d.label === "More than" ) {
            //       return d.domain[0];
            //     }
            //   })
            //   .attr("class", function(d) {
            //     if ( d.label === "Less than" ) {
            //       return "max";
            //     }
            //     else if ( d.label === "More than" ) {
            //       return "min";
            //     }
            //   })
            //   .text(function(d) {
            //     var optionLabel;
            //     if ( d.label === "Less than" ) {
            //       optionLabel = d.domain[1];
            //     }
            //     else if ( d.label === "More than" ) {
            //       optionLabel = d.domain[0];
            //     }
            //     if (metric.id === "time") {
            //       if ( optionLabel === 24 ) {
            //         optionLabel = "a day";
            //       }
            //       if ( optionLabel === 24 * 7 ) {
            //         optionLabel = "a week";
            //       }
            //       if ( optionLabel === 24 * 30 ) {
            //         optionLabel = "a month";
            //       }
            //     }
            //     else {
            //       optionLabel = formatNumber(optionLabel);
            //     }
            //     return d.label + " " + optionLabel;
            //   });

            // options.exit().remove();

            // d3.selectAll("#chart-svg").classed("hidden", false);
            // // d3.select(".buttons").classed("hidden", false);
            // d3.select(".category-selection-container").classed("hidden", false);
            // d3.select(".info-box").classed("hidden", false);
            // d3.select(".totals-intro").classed("hidden", true);

            chart.rData(metric.columnName);

            d3.select("#chart-svg").attr("class", metric.id);
            d3.select("#chart .legend-base").attr("class", "legend-base");
            d3.select("#chart .legend-base").classed(metric.id, true);

            if ( activeSelection.empty() === false && (activeSelection.datum()[chart.rData()] > 0) === false ){
              activeSelection.classed("active", false).style("fill-opacity", chart.fillOpacity);
            }

            chart.draw(chart.data);
            // pymChild.sendHeight();

          });
        }
      }
    });

    // add range selection layer
    this.layer("range-selector", chart.layers.selectorsBase.select(".select-range"), {
      dataBind: function() {
        var chart = this.chart();
        var metric = chart.layers.selectorsBase.select(".select-size").select("option.selected").empty() ? null : chart.layers.selectorsBase.select(".select-size").select("option.selected").datum().ranges;

        return this.selectAll("option")
          .data(metric);
      },

      insert: function() {
        var selection = this.append("option");

        return selection;
      },

      events: {
        "merge" : function() {
          var chart = this.chart();
          var selection = this;
          var selector = selection.node().parentNode;
          var metric = chart.layers.selectorsBase.select(".select-size").select("option.selected").datum();

          var possible = chart.data
            .filter(function(d) {
              // console.log(d[chart.yData()]);
              return d[chart.rData()] <= chart.rScale.domain()[1] && d[chart.rData()] >= chart.minVisible && d[chart.rData()] > 0;
            });

          selection
            .attr("value", function(d) {
              return d.domain.toString();
            })
            .attr("class", function(d) {
              if ( d.label === "Less than" ) {
                return "max";
              }
              else if ( d.label === "More than" ) {
                return "min";
              }
              else if ( d.label === "Between" ) {
                return "range";
              }
            })
            .text(function(d) {
              var optionLabel;
              if ( d.label === "Less than" ) {
                optionLabel = makeReadable(d.domain[1]);
              }
              else if ( d.label === "More than" ) {
                optionLabel = makeReadable(d.domain[0]);
              }
              else if ( d.label === "Between" ) {
                optionLabel = makeReadable(d.domain[0]) + " and " + makeReadable(d.domain[1]);
              }

              function makeReadable(num) {
                if (metric.id === "time") {
                  if ( num === 24 ) {
                    num = "a day";
                  }
                  else if ( num === 24 * 7 ) {
                    num = "a week";
                  }
                  else if ( num === 24 * 30 ) {
                    num = "a month";
                  }
                  else if (num === 1) {
                    num = "an hour";
                  }
                  else {
                    num = num + " hours";
                  }
                }
                else if ( metric.id === "money") {
                  num = "$" + formatNumber(num);
                }
                else {
                  num = formatNumber(num);
                }
                return num;
              }
              return d.label + " " + optionLabel;
            });

          var selectedIndex = selection.size() - 1;
          selection.node().parentNode.selectedIndex = selectedIndex;

          chart.minVisible = selector.value.split(",")[0];

          var visible = possible
            .filter(function(d) {
              return d[chart.rData()] <= chart.rScale.domain()[1] && d[chart.rData()] !== 0 && d[chart.rData()] >= chart.minVisible;
            });

          d3.select(selector.parentNode).select(".limits")
            .html("(" + visible.length + " of " + possible.length + " failures)");

          d3.select(selector).on("change", function() {
            var selectedOption = d3.select(selection[0][selector.selectedIndex]);
            var cutOff = selector.value.split(",");
            // console.log(cutOff);

            if ( selectedOption.classed("min") ) {
              chart.rScale.domain([0,chart.max]);
            }
            else if ( selectedOption.classed("max") ) {
              chart.rScale.domain([0,cutOff[1]]);
            }
            else if (selectedOption.classed("range") ) {
              chart.rScale.domain([0,cutOff[1]]);
            }

            chart.minVisible = cutOff[0];

            visible = possible
              .filter(function(d) {
                return d[chart.rData()] <= chart.rScale.domain()[1] && d[chart.rData()] !== 0 && d[chart.rData()] >= chart.minVisible;
              });

            d3.select(selector.parentNode).select(".limits")
              .html("(" + visible.length + " of " + possible.length + " failures)");

            chart.layer("category-selector").draw(chart.data);

            var categorized = chart.data
              .filter(function(d) {
                // console.log(d[chart.yData()]);
                return d[chart.yData()] !== "" && d[chart.rData()] <= chart.rScale.domain()[1] && d[chart.rData()] >= chart.minVisible && d[chart.rData()] > 0;
              });

            // console.log(categorized.length);
            // console.log(visible.length);

            if ( visible.length > categorized.length ) {
              chart.layers.selectorsBase.select(".category-selection-container").select(".limits")
                .html("(" + categorized.length + " of " + visible.length + " failures)");

              // chart.draw();
            }
            else {
              chart.layers.selectorsBase.select(".category-selection-container").select(".limits")
                .html("");
            }

            chart.layer("bubbles").draw(chart.data);
              
            chart.layers.legendBase.select(".legend-ring")
              .transition()
              .duration(1000)
              .attr("r", function(d) { return chart.rScale(d[chart.rData()]); })
              .each("end", function() { return chart.layer("info-box").draw(); });

            // chart.layer("info-box").draw();
            if ( chart.mode() !== "mobile" ) {
              chart.layer("legend").draw();
              // chart.layer("status").draw();
            }
          });
        },

        "exit" : function() {
          this.remove();
        }
      }
    });

    // add category selection layer
    this.layer("category-selector", chart.layers.selectorsBase.select(".select-category"), {
      dataBind: function() {
        var chart = this.chart();

        // console.log(chart.sortables);
        return this.selectAll("option")
          .data(chart.sortables);
      },

      insert: function() {
        var selection = this.append("option");

        chart.layers.selectorsBase.select(".category-selection-container")
          .classed("hidden", function() { return chart.sortables.length < 2 ? true : false; });

        selection
          .attr("value", function(d) { return d; })
          .text(function(d) { return d; });

        return selection;
      },

      events: {
        "merge" : function() {
          var chart = this.chart();
          var selection = this;
          var selector = selection.node().parentNode;

          selection.each(function (d,i) {
            if (d === chart.yData()) {
              selector.selectedIndex = i;
            }
          });

          d3.select(selection[0][selector.selectedIndex])
            .classed("selected", true);

          var visible = chart.data
              .filter(function(d) {
                // console.log(d[chart.yData()]);
                return d[chart.yData()] !== "" && d[chart.rData()] <= chart.rScale.domain()[1] && d[chart.rData()] >= chart.minVisible && d[chart.rData()] > 0;
              });

          var invisible = chart.data
            .filter(function(d) {
              // console.log(d[chart.yData()]);
              return d[chart.yData()] === "" && d[chart.rData()] <= chart.rScale.domain()[1] && d[chart.rData()] >= chart.minVisible && d[chart.rData()] > 0;
            });

          // console.log(invisible.length);
          // console.log(visible.length);

          if ( invisible.length + visible.length > visible.length ) {
            d3.select(selector.parentNode).select(".limits")
              .html("(" + visible.length + " of " + (visible.length + invisible.length) + " failures)");

            // chart.draw();
          }
          else {
            d3.select(selector.parentNode).select(".limits")
              .html("");
          }

          d3.select(selector).on("change", function() {
            // console.log("clicked category selector");
            var activeSelection = chart.base.select(".data-point.active");
            var toFade = chart.base.selectAll(".label, .straight-line");
            var selectedOption = d3.select(selection[0][selector.selectedIndex]);
            var category = selectedOption.datum();
            
            // console.log(selection[0][selector.selectedIndex]);

            selection
              .classed("selected", false);
            selectedOption
              .classed("selected", true);

            var gaEventLabel = chart.parentID + ": from " + chart.yData() + " to " + category;
            // console.log(gaEventLabel);
            
            toFade
                .transition()
                .duration(chart.duration())
                .style("opacity", 0)
                .each("end", function (d, i) { return i === 0 ? fadeIn() : null; });

            ga("send", "event", "dropdown", "change", gaEventLabel, chart.gaCategoriesChanged);
            chart.gaCategoriesChanged++;

            function fadeIn() {
              // console.log(category);
              chart.yData(category);

              // chart.draw(chart.data);

              //get an array of unique values for a given key
              chart.categories = d3.set(chart.data
                .filter(function (d) {
                  // filter out data that has no set value (category)
                  if (d[chart.yData()] !== "") {
                    return d;
                  } 
                })
                .map(function(d) { return d[chart.yData()]; }))
                .values().sort();

              // console.log(chart.categories);
              //update y scale domain
              chart.yScale.domain(chart.categories);

              
              chart.layer("y-axis-labels").draw();
              chart.layer("bubbles").draw(chart.data);

              if ( chart.mode() !== "mobile" ) {
                chart.layer("grid-lines").draw();
                // chart.layer("status").draw();
              }
            }

            if ( activeSelection.empty() === false ){

              if ( activeSelection.datum()[category] === "" ) {
                // d3.select(bubbles.base.node().parentNode).select(".info-box").selectAll("div").remove();
                // d3.select(bubbles.base.node().parentNode).select(".legend-ring").remove();
                activeSelection.classed("active", false).style("fill-opacity", chart.fillOpacity);
                chart.layer("info-box").draw();
              }

            }

            visible = chart.data
              .filter(function(d) {
                // console.log(d[chart.yData()]);
                return d[category] !== "" && d[chart.rData()] <= chart.rScale.domain()[1] && d[chart.rData()] >= chart.minVisible && d[chart.rData()] > 0;
              });

            invisible = chart.data
              .filter(function(d) {
                // console.log(d[chart.yData()]);
                return d[category] === "" && d[chart.rData()] <= chart.rScale.domain()[1] && d[chart.rData()] >= chart.minVisible && d[chart.rData()] > 0;
              });

            // console.log(invisible.length);
            // console.log(visible.length);

            if ( invisible.length + visible.length > visible.length ) {
              d3.select(selector.parentNode).select(".limits")
                .html("(" + visible.length + " of " + (visible.length + invisible.length) + " failures)");

              // chart.draw();
            }
            else {
              d3.select(selector.parentNode).select(".limits")
                .html("");
            }
          });
        }
      }
    });

    // add lines layer
    this.layer("grid-lines", chart.layers.linesBase, {
      modes : ["web", "tablet"],
      dataBind: function() {
        var chart = this.chart();

        return this.selectAll(".straight-line")
          .data(chart.categories, function (d) { return d; });
      },

      // insert lines
      insert: function() {
        var selection =  this.append("line");

        return selection;
      },

      events: {
        "enter" : function() {
          var selection = this;

          selection
            .style("opacity", 0);
        },

        "merge" : function() {
          var chart = this.chart();
          var selection = this;

          // draw lines
          selection
          .attr("class","straight-line")
            .attr("x1",0)
            .attr("x2",chart.width())
            .attr("y1",function(d) { return chart.yScale(d) + (chart.yScale.rangeBand() / 2); })
            .attr("y2",function(d) { return chart.yScale(d) + (chart.yScale.rangeBand() / 2); })
            .attr("stroke-width", 1);


          return selection;
        },

        "merge:transition" : function() {
          var chart = this.chart();
          var selection = this;

          selection
            .duration(chart.duration())
            .style("opacity", 1);

        },

        "exit" : function() {
          this.remove();
        }
      }

    });

    // add y-axis labels
    this.layer("y-axis-labels", chart.layers.labelsBase, {
      // modes : ["web", "tablet"],
      dataBind: function() {
        return this.selectAll(".y.label")
          .data(chart.categories, function (d) { return d; });
      },

      // insert labels
      insert: function() {
        var selection =  this.append("text");

        return selection;
      },

      events: {
        "enter" : function() {
          var selection = this;

          selection
            .style("opacity", 0);
        },

        "merge" : function() {
          var chart = this.chart();
          var selection = this;

          // draw labels
          selection
          .attr("class","y label")
            .attr("x",0)
            .attr("y",function(d) { return chart.yScale(d) + (chart.yScale.rangeBand() / 2); })
            .attr("dy", "-.1em")
            .attr("dx", "0")
            .text(function(d) { return d; })
            .attr("text-anchor","beginning");

          return selection;
        },

        // "update": function() {
        //   var chart = this.chart();
        //   var selection = this;

        //   selection.text(function(d) { return d; });

        //   return selection;
        // },

        "exit" : function() {
          this.remove();
        },

        "merge:transition": function() {
          var chart = this.chart();
          var selection = this;

          // console.log(selection);

          selection
            .duration(chart.duration())
            .style("opacity", 1);
        },

        // "update:transition": function() {
        //   var chart = this.chart();
        //   var selection = this;
        //   var all = d3.selectAll(".y.label");

        //   console.log(selection);

        //   selection
        //     .transition()
        //     .duration(1000)
        //     .attr("y",function(d) { return chart.yScale(d) + (chart.yScale.rangeBand() / 2); })
        //     .transition()
        //     .duration(1000)
        //     .style("opacity", 1);

        // },

        // "exit:transition": function() {
        //   this.duration(1000)
        //   .style("opacity", 0)
        //   .remove();

        // }

      }

    });

    // add x-axis layer 
    this.layer("x-axis", chart.layers.axesBase, {
      // modes : ["web", "tablet"],
      dataBind: function(data) {
        return this.selectAll(".x")
          .data([data]);
      },

      // insert x-axis
      insert: function() {
        // var chart = this.chart();
        var selection = this.append("g")
          .attr("class", "x axis");

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
            .attr("transform", "translate(0," + chart.height() + ")")
          .transition()
            .duration(chart.duration())
            .call(xAxis);

          chart.on("change:height", function() {
            chart.base.select(".x.axis")
              .attr("transform", "translate(0," + chart.height() + ")")
              .call(xAxis);
          });

          return selection;
        },
      }

    });

    // add a circle layer
    this.layer("bubbles", chart.layers.circlesBase, {
      // modes : ["web", "tablet"],
      dataBind: function(data) {
        var chart = this.chart();

        return this.selectAll("circle")
          .data(data
            .filter(function (d) {
              // filter out data that has no set value (category)
              if (d[chart.yData()] !== "") {
                return d;
              }
              else {
                // console.log("Not included:" + d);
              } 
            })
            .sort(function(a,b) {
              return b[chart.rData()] - a[chart.rData()];
            }), function (d) { return d.Headline + d.formattedDate; });
      },

      // insert circles
      insert: function() {
        var selection =  this.append("circle");

        // console.log(selection.data());
        selection
          .attr("class", function(d) {
            var classes = "data-point";
            chart.quantities.forEach(function(q) {
              if (d[q.columnName] > 0 ) {
                classes += " " + q.id;
              }
            });
            return classes;
          })
          .attr("r", 0)
          .attr("data-date-index", function(d) { return d.dateIndex; });

        // console.log(chart.layers.circlesBase.selectAll(".data-point").size());

        return selection;
      },

      // for new and updating elements, reposition
      // them according to the updated scale.
      events: {
        "merge" : function() {
          var chart = this.chart();
          var selection = this;
          // var el = d3.select(this);

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
            .attr("cx",function(d) { return chart.xScale(d.formattedDate); });
            // .attr("cy",function(d) { return chart.yScale(d[chart.yData()]) + (chart.yScale.rangeBand() / 2); })
            

          selection.order();

          // if ( chart.layers.circlesBase.select(".active").empty() ) {
          //   selection
          //     .classed("active", function(d, i) { return i === 0; });
          // }

          // console.log(chart.preSelected)
          if ( chart.preSelected !== undefined && chart.layers.circlesBase.select(".active").empty() ) {
            selection
              .classed("active", function (d,i) { return i === 1; });
          }

          selection
            .classed("too-big", function(d) {
              return d[chart.rData()] > chart.rScale.domain()[1] && d[chart.yData()] !== "";
            })
            .classed("too-small", function(d) {
              return d[chart.rData()] !== 0 && d[chart.rData()] < chart.minVisible && d[chart.yData()] !== ""; 
            });

          selection.filter(function() {
              return !(d3.select(this).classed("too-big") || d3.select(this).classed("too-small") || d3.select(this).classed("active"));
              // return !(d[chart.rData()] === 0 || d[chart.yData()] === "" || d3.select(this).classed("too-big") || d3.select(this).classed("too-small") || d3.select(this).classed("active"));
            })
            .style("fill-opacity", chart.fillOpacity);

          // chart.base.selectAll(".too-big")
          //   .style("fill-opacity", 0);

          // chart.base.selectAll(".too-big")
          //   .classed("too-big", false)
          //   .style("fill-opacity", null);

          // chart.base.selectAll(".data-point")
          //   .filter(function (d) {
          //     if (chart.rScale(d[chart.rData()]) < 2 ) {
          //       return d;
          //     } 
          //   })
          //   .classed("too-small", true)
          //   .style("fill-opacity", 0.2)
          //   .transition()
          //   .delay(1000)
          //   .duration(chart.duration())
          //   .style("fill-opacity", 0);

          var active = chart.layers.circlesBase.select(".data-point.active");
          if ( !active.empty() && ( active.classed("too-small") || active.classed("too-big") ) ) {
            active.classed("active", false).style("fill-opacity", chart.fillOpacity);
          }


          selection
            .on("mouseover", function () {
              var el = d3.select(this);

              if ( !el.classed("too-big") && !el.classed("too-small") ) {
                d3.select(this).classed("hovered", true).style("fill-opacity", 0.5);
              }
            });

          selection
            .on("mouseout", function () {
              var el = d3.select(this);
              
              if ( !el.classed("too-big") && !el.classed("too-small") ) {
                d3.select(this).classed("hovered", false);

                if ( d3.select(this).classed("active") ) {
                  d3.select(this).style("fill-opacity", 0.8);
                }
                else {
                  d3.select(this).style("fill-opacity", chart.fillOpacity);
                }
              }
            });

          // selection
          //   .filter(".too-big,.too-small")
          //   .on("click", function() {
          //     console.log(d3.select(this));
          //     delete d3.select(this)[0][0].__onclick;
          //     console.log(d3.select(this));
          //   }, true);

          selection.filter(".too-big,.too-small").attr("pointer-events", "none");
          
          // add a mouseover listener to our circles
          // and change their color and broadcast a chart
          // brush event to any listeners.
          selection
            .filter(":not(.too-big):not(.too-small)")
            .attr("pointer-events", null)
            .on("click", function() {
              var el = d3.select(this);
              var selectedData = el.datum();
              // var infoBox = d3.select(chart.base.node().parentNode).select(".info-box");

              var gaEventLabel = chart.parentID + "-" + selectedData.Headline;

              ga("send", "event", "datapoint", "click", gaEventLabel, chart.gaDatapointsClicked);
              chart.gaDatapointsClicked++;
              // console.log(chart.gaDatapointsClicked);
              // console.log(gaEventLabel);
              
              // console.log(selectedData);
              // el.selectAll("circle")

              if ( !el.classed("active") && !el.classed("too-big") && !el.classed("too-small") ) {
                chart.base.selectAll(".active")
                  .classed("active", false).style("fill-opacity", chart.fillOpacity);

                el
                  .classed("active", true).style("fill-opacity", 0.8);

                chart.layer("info-box").draw();

                chart.trigger("selection change", el);

                chart.layers.backgroundBase.on("click", function() {
                  var active = chart.base.selectAll(".active");
                  if ( !active.empty() ) {
                    // console.log("unselect");

                    chart.base.selectAll(".active")
                      .classed("active", false).style("fill-opacity", chart.fillOpacity);

                    chart.layer("info-box").draw();
                  }
                });

                // el
                //   .append("g")
                //     .attr("class","tt")
                //   .append("text")
                //    .attr("y", function(d) { return chart.yScale(d[chart.yData()]) + (chart.yScale.rangeBand() / 2); })
                //     .attr("x", function(d) { return chart.xScale(d.formattedDate); })
                //     .attr("dy", "-.5em")
                //     .attr("dx", ".5em")
                //     .attr("class", "ttText")
                //     .text(function(d) { return d.Headline; });

                // el.select(".tt")
                //   .append("text")
                //     .attr("y", function(d) { return chart.yScale(d[chart.yData()]) + (chart.yScale.rangeBand() / 2); })
                //     .attr("x", function(d) { return chart.xScale(d.formattedDate); })
                //     .attr("dy", "-1.7em")
                //     .attr("dx", ".5em")
                //     .attr("class", "ttText")
                //     .attr("color", "red")
                //     .text(function(d) {
                //       if ( d[chart.rData()] >= 1e9 ) {
                //         return ("$ " + d[chart.rData()] / 1e9) + " billion";
                //       }
                //       else if (d[chart.rData()] >= 1e6) {
                //         return ("$ " + d[chart.rData()] / 1e6) + " million";
                //       }
                //     });

                // console.log(chart.layers.legendBase);

                

                // infoBoxContent
                //   .append("a")
                //   .attr("class", "readmore")
                //   .attr("href", function(d) { return d.url; })
                //   .attr("target", "_blank")
                //   .text("Read More");

                // chart.trigger("selection change", el);

                // console.log(el.selectAll(".tt")[0][0].parentNode.parentNode);
                // var tooltip = el.selectAll(".tt")[0][0];
                // tooltip.parentNode.parentNode.appendChild(tooltip);

                // var ttText = d3.selectAll("text.ttText");
                // if (ttText.attr("x") > chart.width() / 2 ) {
                //   ttText
                //     .attr("text-anchor","end")
                //     .attr("dx", "-.5em");
                // }
              }
            
            });

          // selection.on("mouseout", function() {
          //   var el = d3.select(this);

          //   el
          //     .classed("active", false);

          //   d3.select(".tt").remove();

          //   chart.trigger("unbrush", this);
          // });
          
          chart.on("change:height", function() {
            selection
              .attr("cy", function(d) { return chart.yScale(d[chart.yData()]) + (chart.yScale.rangeBand() / 2); });
          });

          return selection;
        },

        "merge:transition": function() {
          var chart = this.chart();
          var selection = this;

          selection
            .duration(1000)
            .attr("cy", function(d) { return chart.yScale(d[chart.yData()]) + (chart.yScale.rangeBand() / 2); })
            .attr("r", function(d) { return chart.rScale(d[chart.rData()]); })
            .filter(function(){
              return d3.select(this).classed("too-small") || d3.select(this).classed("too-big");
            })
            .style("fill-opacity", 0);
        },

        "exit:transition": function() {
          var selection = this;

          selection
            .duration(1000)
            .attr("r", 0);
        }
      }

    });

    // // add status layer
    // this.layer("status", chart.layers.statusBase, {
    //   dataBind: function(data) {
    //     var chart = this.chart();

    //     // return this.selectAll(".current-status")
    //     //   .data([data
    //     //     .filter(function (d) {
    //     //       // filter out data that has no set value (category)
    //     //       if (d[chart.yData()] !== "" && chart.rScale(d[chart.rData()]) > 2 && d[chart.rData()] <= chart.rScale.domain()[1] ) {
    //     //         return d;
    //     //       } 
    //     //     })]);

    //     // return this.selectAll(".current-status")
    //     //   .data([chart.layers.circlesBase.selectAll(":not(.too-big):not(.too-small).data-point")
    //     //     .filter(function() {
    //     //       return d3.select(this).attr("r") !== "0";
    //     //     })]);

    //     return this.selectAll(".current-status")
    //       .data([chart.data
    //         .filter(function(d) {
    //           // console.log(d[chart.yData()]);
    //           return d[chart.yData()] !== "" && d[chart.rData()] <= chart.rScale.domain()[1] && d[chart.rData()] >= chart.minVisible && d[chart.rData()] > 0;
    //         })]);
    //   },

    //   insert: function() {
    //     var selection = this.append("div")
    //       .attr("class", "current-status");
    //       // .attr("transform", "tranlate(0,20)");

    //     selection.append("span")
    //       .attr("class", "details hidden");

    //     selection.append("span");

    //     return selection;
    //   },

    //   events: {
    //     "merge" : function() {
    //       var chart = this.chart();
    //       var selection = this;
          
    //       selection.select("span:not(.details)")
    //         // .attr("x", 0)
    //         // .attr("y", 0)
    //         // .attr("dx", 150)
    //         // .attr("dy", -15)
    //         .text(function (d) { return "Currently displaying " + d.length + " of " + chart.layers.circlesBase.selectAll(".data-point").size() + " failures with a measurable"; });

    //       selection.on("mouseover", function () {
    //         d3.select(this).select(".details")
    //           .classed("hidden", false)
    //           // .attr("x", 0)
    //           // .attr("y", 0)
    //           // .attr("dx", 150)
    //           // .attr("dy", 5)
    //           .text(function () { 
    //             var explanation = "(" +
    //               chart.layers.circlesBase.selectAll(".data-point:not(.too-big):not(.too-small)").filter(function() { return d3.select(this).attr("r") === "0"; }).size() + " not defined";

    //             if ( chart.layers.circlesBase.selectAll(".data-point.too-small").size() > 0 ) {
    //               explanation += ", " + chart.layers.circlesBase.selectAll(".data-point.too-small").size() + " too small";
    //             }
    //             if ( chart.layers.circlesBase.selectAll(".data-point.too-big").size() > 0 ) {
    //               explanation += ", " + chart.layers.circlesBase.selectAll(".data-point.too-big").size() + " too big";
    //             }                
    //             return explanation + ")";
    //           });

    //         // d3.select(this).selectAll("span")
    //         //   .style("display", "block");
    //       });

    //       selection.on("mouseout", function() {
    //         d3.select(this).select(".details")
    //           .classed("hidden", true);
    //       });

    //       return selection;
    //     }
    //   }

    // });

    this.layer("legend", chart.layers.legendBase, {
      modes: ["web", "tablet"],
      dataBind: function(data) {
        var chart = this.chart();
        // var min = d3.min(data, function(d) { 
        //   if (d[chart.rData()] > 0) {
        //     return d[chart.rData()]; 
        //   }
        // });
        // var max = d3.max(data, function(d) { return d[chart.rData()]; });
        var intervals = [];

        var svg = d3.select(chart.layers.legendBase.node().parentNode.parentNode);

        if ( svg.classed("time") ) {
          intervals = [5 * (1 /60), 30 * (1 /60), 
          1, 6, 12, 24, 7 * 24, 
          30 * 24, 2 * 30 * 24, 3 * 30 * 24, 4 * 30 * 24, 6 * 30 * 24, 
          365 * 24, 5 * 365 * 24, 10 * 365 * 24];
          intervals = intervals.reverse();

          intervals = intervals.filter(function(item) {
            return item <= chart.rScale.domain()[1];
          });

          // console.log(chart.rScale.domain()[1]);
          // console.log(intervals);
        }
        else{
          // console.log(chart.rScale.domain()[1]);
          // if ( chart.max > chart.rScale.domain()[1]) {
          //   chart.max = chart.rScale.domain()[1];
          // }
          for (var i = 1; i <= chart.rScale.domain()[1]; i = i*10) {
            if ( i > chart.rScale.domain()[0] ) {
              intervals.unshift(i);
            }
          }

          intervals.splice(1, 0, intervals[0]/2);

          if ( intervals[0] * 5 === chart.rScale.domain()[1] ) {
            intervals.unshift(intervals[0] * 5);
          }
        }

        // console.log(intervals.slice(0,4));

        // chart.base.select(".legend")
        //   .attr("transform", "translate("+ 
        //   (chart.width() + (2 * chart.margin().left) + chart.rScale(intervals[0])) + 
        //   "," + 
        //   (chart.margin().top + chart.rScale(intervals[0])) +
        //   ")");

        chart.layers.infoBoxBase.select(".legend")
          .attr("transform", "translate(75,75)");

        chart.zoomIntervals = intervals.filter(function (d,i) {
            return i === 0 || chart.rScale(d) < chart.rScale(intervals[i-1]) - 10;
          });

        // console.log(chart.zoomIntervals);

        return this.selectAll(".legend-step")
          .data(chart.zoomIntervals, function (d) { return d; } );
      },

      insert: function() {
        var selection =  this.append("g")
          .attr("class", "legend-step");

        // console.log("insert legend steps");

        selection
          .append("circle")
          .classed("legend-circle", true)
          .attr("r", 0);

        selection
          .append("line")
          .classed("legend-line", true);

        selection
          .append("text")
          .classed("legend-text", true);

        // console.log(selection);

        return selection;
      },

      events: {
        "enter" : function() {
          var chart = this.chart();
          var selection = this;
          var minValue = d3.min(chart.zoomIntervals);
          // console.log(minValue);

          selection.selectAll(".legend-circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", function(d) { return chart.rScale(d); })
            .style("opacity", 0);

          selection.selectAll(".legend-line")
            .attr("x1", 0)
            .attr("x2", 0)
            .attr("y1", function(d) { return d3.select(this).datum() === minValue && chart.rScale(chart.zoomIntervals[chart.zoomIntervals.length - 2]) - chart.rScale(d) < 16 ? - chart.rScale(d) : chart.rScale(d); })
            .attr("y2", function(d) { return d3.select(this).datum() === minValue && chart.rScale(chart.zoomIntervals[chart.zoomIntervals.length - 2]) - chart.rScale(d) < 16 ? - chart.rScale(d) : chart.rScale(d); });

          selection.selectAll(".legend-text")
            .attr("x", chart.maxBubbleSize)
            .attr("dx", "0")
            .attr("dy", "0")
            .attr("y", function(d) { return d3.select(this).datum() === minValue && chart.rScale(chart.zoomIntervals[chart.zoomIntervals.length - 2]) - chart.rScale(d) < 16 ? - chart.rScale(d) : chart.rScale(d); })
            .style("opacity", 0);

          return selection;
        },

        "merge" : function() {
          var chart = this.chart();
          var selection = this;
          // var minValue = d3.min(chart.zoomIntervals);
          // var el = d3.select(this);

          selection
            .sort(function(a,b){
              return b - a;
            });

          // selection.selectAll(".legend-line")
          //   .classed("smallest", false);

          // selection.selectAll(".legend-text")
          //   .classed("smallest", false);

          // var last = selection.filter(function (d) { return d === minValue; });

          // console.log(last.datum());

          // last.select(".legend-line")
          //   .classed("smallest", true)
          //   .attr("y1", function (d) { return - chart.rScale(d); })
          //   .attr("y2", function (d) { return - chart.rScale(d); });

          // last.select(".legend-text")
          //   .classed("smallest", true)
          //   .attr("y", function (d) { return - chart.rScale(d); });

          var legendHeading = chart.layers.legendBase.selectAll(".legend-heading");

          legendHeading
            .data([chart.rData()])
            .enter()
          .append("text")
            .attr("class", "legend-heading")
            .attr("x", chart.maxBubbleSize)
            .attr("dx", "0")
            .attr("dy", ".5em")
            .attr("y", -chart.maxBubbleSize / 2)
            .style("opacity", 0)
            .text(function() {
              var svg = d3.select(chart.layers.legendBase.node().parentNode.parentNode);

              if ( svg.classed("money") ) {
                return "Cost, US $:";
              }
              else if ( svg.classed("time") ) {
                return "Duration:";
              }
              else if ( svg.classed("people") ) {
                return "People:";
              }

            })
            .style("opacity", 0)
            .transition()
            .delay(1300)
            .style("opacity", 1);

          legendHeading
            .text(function() {
              var svg = d3.select(chart.layers.legendBase.node().parentNode.parentNode);

              if ( svg.classed("money") ) {
                return "Cost, US $:";
              }
              else if ( svg.classed("time") ) {
                return "Duration:";
              }
              else if ( svg.classed("people") ) {
                return "People:";
              }

            })
            .style("opacity", 0)
            .transition()
            .delay(1300)
            .style("opacity", 1);

          // var rangeSelector = d3.select(chart.base.node().parentNode).select(".range-selection-container");

          // rangeSelector.on("change", function () {

          // });

          // var zoomControls = chart.layers.legendOuter.selectAll(".zoom");

          // console.log(chart.min + " " + (chart.max / 100));

          // if ( selection.size() < 4 ) {
          //   chart.layers.legendOuter.select(".zoom-controls .in")
          //     .classed("inactive", true);
          // }
          // else {
          //   chart.layers.legendOuter.select(".zoom-controls .in")
          //     .classed("inactive", false);
          // }

          // if ( chart.layers.legendOuter.select(".zoom-controls .in").classed("inactive") &&
          //   chart.layers.legendOuter.select(".zoom-controls .out").classed("inactive") ) {
          //   chart.layers.legendOuter.select(".zoom-controls").classed("hidden", true);
          // }

          // zoomControls.on("click", function() {
          //   chart.layers.legendOuter.selectAll(".legend-step")
          //     .sort(function(a,b){
          //       return a - b;
          //     });

          //   console.log(readableNumbers(d3.select(selection[0][0]).datum()));
          //   console.log(selection.size());
          //   // var limit = chart.layers.legendOuter.select(".legend-step").datum();

          //   // TODO: Add analytics to zoom

          //   var limit = d3.select(selection[0][0]).datum();

          //   if ( d3.select(this).classed("in") ) {
          //     if ( selection.size() < 4 ) {
          //       return;
          //     }
          //     else if ( limit === chart.rScale.domain()[1] ) {
          //       limit = limit / 10;
          //       chart.max = limit;
          //     }
          //   }
          //   else if ( d3.select(this).classed("out") ) {
          //     if ( chart.base.selectAll(".too-big").empty() ) {
          //       return;
          //     }
          //     else {
          //       console.log(readableNumbers(limit));
          //       console.log("zoom out");
          //       limit = limit * 10;
          //       chart.max = limit;
          //     }
          //   }
            
          //   console.log(readableNumbers(limit));

          //   chart.rScale.domain([0,limit]);

          //   chart.layer("bubbles").draw(chart.data);

          //   chart.base.selectAll(".too-big")
          //     .style("fill-opacity", 0);

          //   chart.base.selectAll(".too-big")
          //     .filter(function (d) {
          //       if (d[chart.rData()] < limit) {
          //         return d;
          //       } 
          //     })
          //     .classed("too-big", false)
          //     .style("fill-opacity", null);
          //     // .transition()
          //     // .delay(1000)
          //     // .duration(chart.duration())
          //     // .style("fill-opacity", 0.2);

          //   chart.base.selectAll(":not(.too-big).data-point")
          //     .filter(function (d) {
          //       if (d[chart.rData()] > limit ) {
          //         return d;
          //       } 
          //     })
          //     .classed("too-big", true)
          //     .style("fill-opacity", 0.2)
          //     .transition()
          //     .delay(1000)
          //     .duration(chart.duration())
          //     .style("fill-opacity", 0);

          //   if ( chart.base.selectAll(".too-big").empty() ) {
          //     chart.layers.legendOuter.select(".zoom-controls .out")
          //       .classed("inactive", true);
          //   }
          //   else {
          //     chart.layers.legendOuter.select(".zoom-controls .out")
          //       .classed("inactive", false);
          //   }

          //   if ( chart.min >= limit / 100) {
          //     chart.layers.legendOuter.select(".zoom-controls .in")
          //       .classed("inactive", true);
          //   }
          //   else {
          //     chart.layers.legendOuter.select(".zoom-controls .in")
          //       .classed("inactive", false);
          //   }

          //   var active = chart.base.select(".active");
          //   if ( active.classed("too-big") ) {
          //     active.classed("active", false);
          //   }

          //   chart.layers.legendBase.select(".legend-ring")
          //     .transition()
          //     .duration(1000)
          //     .attr("r", function(d) { return chart.rScale(d[chart.rData()]); })
          //     .each("end", function() { return chart.layer("info-box").draw(); });

          //   // chart.layer("info-box").draw();
          //   chart.layer("legend").draw();

          // });

          return selection;
        },

        "exit" : function () {
          this.remove();
        },

        // "exit:transition" : function() {
        //   var selection = this;

        //   selection.selectAll(".legend-circle")
        //     .duration(1000)
        //     .attr("r", function(d) { return chart.rScale(d); })
        //     .attr("fill-opacity", 0)
        //     .each("end", selection.remove());
        //   // chart.layers.legendBase.select(".legend-heading").remove();
        // },
 
        "update:transition" : function() {
          var chart = this.chart();
          var selection = this;
          var minValue = d3.min(chart.zoomIntervals);
          // console.log(minValue);
          // var active = d3.select(".data-point.active");

          selection.selectAll(".legend-circle")
            .duration(1000)
            .attr("r", function(d) { return chart.rScale(d); });

          selection.selectAll(".legend-line")
            .duration(1000)
            .attr("y1", function(d) { return d3.select(this).datum() === minValue && chart.rScale(chart.zoomIntervals[chart.zoomIntervals.length - 2]) - chart.rScale(d) < 16 ? - chart.rScale(d) : chart.rScale(d); })
            .attr("y2", function(d) { return d3.select(this).datum() === minValue && chart.rScale(chart.zoomIntervals[chart.zoomIntervals.length - 2]) - chart.rScale(d) < 16 ? - chart.rScale(d) : chart.rScale(d); });

          selection.selectAll(".legend-text")
            .duration(1000)
            .attr("y", function(d) { return d3.select(this).datum() === minValue && chart.rScale(chart.zoomIntervals[chart.zoomIntervals.length - 2]) - chart.rScale(d) < 16 ? - chart.rScale(d) : chart.rScale(d); });

          // var last = chart.layers.legendBase.select("g:last-child");

          // last.select(".legend-line")
          //   .duration(1000)
          //   .attr("y1", function(d) { return - chart.rScale(d); })
          //   .attr("y2", function(d) { return - chart.rScale(d); });

          // last.select(".legend-text")
          //   .duration(1000)
          //   .attr("y", function (d) { return - chart.rScale(d); });

          

          // if ( active.empty() === false && chart.layers.legendBase.select(".legend-ring").empty() === true && chart.mode() !== "mobile") {
          //   chart.layers.legendBase.append("circle")
          //     .attr("class", "legend-ring")
          //     .attr("cx", 0)
          //     .attr("cy", 0)
          //     .attr("stroke-width", 2)
          //     .attr("fill", "none")
          //     .style("stroke", "red")
          //     .attr("r", 0)
          //     .transition()
          //     .duration(1000)
          //     .attr("r", chart.rScale(active.datum()[chart.rData()]));
              

          // }
        },

        "enter:transition" : function() {
          // var chart = this.chart();
          var selection = this;

          selection.selectAll(".legend-circle")
            .duration(1300)
            .style("opacity", 1);

          selection.selectAll(".legend-line")
            .delay(1000)
            .duration(300)
            .attr("x2", chart.maxBubbleSize);

          selection.selectAll(".legend-text")
            .text(function (d) { 
              var svg = d3.select(chart.layers.legendBase.node().parentNode.parentNode);

              if ( svg.classed("time") ) {
                return makeReadable(d);
              }
              else {
                return readableNumbers(d); 
              }

              function makeReadable(num) {
                if ( num < 1 ) {
                  num = (num * 60) + " minutes";
                }
                else if ( num === 24 ) {
                  num = "1 day";
                }
                else if ( 24 <= num && num < 24 * 7 ) {
                  num = (num / 24 ) + " days";
                }
                else if ( num === 24 * 7 ) {
                  num = "1 week";
                }
                else if ( 24 * 7 < num && num < 24 * 30 ) {
                  num = (num / (24 * 7) ) + " weeks";
                }
                else if ( num === 24 * 30 ) {
                  num = "1 month";
                }
                else if ( 24 * 30 < num && num < 24 * 365 ) {
                  num = (num / (24 * 30) ) + " months";
                }
                else if ( num === 24 * 365 ) {
                  num = "1 year";
                }
                else if ( 24 * 365 < num) {
                  num = (num / (24 * 365) ) + " years";
                }
                else if (num === 1) {
                  num = "1 hour";
                }
                else {
                  num = num + " hours";
                }
                return num;
              }
              
            })
            .delay(1300)
            .style("opacity", 1);
        }
      }

    });

    this.layer("info-box", chart.layers.infoBoxBase, {
      dataBind: function() {
        var chart = this.chart();
        var active = chart.layers.circlesBase.select(".data-point.active");

        // console.log(this);

        if ( !active.empty() ) {
          return this.selectAll(".description")
            .data([active.datum()]);
        }
        else {
          return this.selectAll(".description")
            .data([]);
        }
      },

      insert: function() {
        // console.log(this);

        var selection = this.append("div")
          .attr("class", "description isotope-item");
        
        // console.log(selection);
        return selection;
      },

      events: {
        "merge" : function() {
          var selection = this;
          var chart = this.chart();

          // chart.layers.infoBoxBase.select(".nav-buttons").classed("hidden", false);

          chart.layers.legendBase.select(".legend-ring").remove();

          chart.layers.infoBoxBase.select(".instructions").classed("hidden", true);

          selection.classed("hidden",false);

          var ring = chart.layers.legendBase.selectAll(".legend-ring")
            .data([selection.datum()]).enter()
          .append("circle")
            .attr("class", "legend-ring")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("stroke-width", 2)
            .attr("fill", "none")
            .style("stroke", "red");
          
          ring
            .attr("r", function(d) { return chart.rScale(d[chart.rData()]); });

          selection.selectAll("*").remove();

          selection.append("span")
            .attr("class", "small-instructs")
            .classed("hidden", function() { return chart.mode !== "mobile" && chart.gaDatapointsClicked > 1; })
            .text("▼ Use these buttons to step through the timeline chronologically");

          var timeContainer = selection.append("div")
            .classed("times", true);

          timeContainer.append("a")
            .attr("class", "prev button")
            .attr("href", "#")
            .html("◂&nbsp;Earlier");

          timeContainer.append("time")
            .attr("class", "date")
            .html(function (d) { return d.date.replace(" ", "&nbsp"); });

          timeContainer.append("a")
            .attr("class", "next button")
            .attr("href", "#")
            .html("Later&nbsp;▸");

          selection.append("div")
            .attr("class", "fail-stats")
            .html(function (d) { return displayStat(chart, d); });

          selection
            .append("a")
            .attr("href", function(d) { return d.url.split("; ")[0]; })
            .attr("target", "_blank")
            .attr("class", "fail-hed-link")
            .append("h3")
            .attr("class", "fail-hed")
            .text(function (d) { return d.Headline; });

          var failImpact = selection
            .append("p")
            .attr("class", "fail-impact")
            .text(function(d) { return d["Impact - Raw"]; });


          var links = failImpact.selectAll(".readmore")
              .data(function(d) { return d.url.split("; "); });

          failImpact.append("br").attr("class", "sources hidden");

          failImpact.append("span").attr("class", "sources hidden").text("Sources:");

          // if ( links.size() !== 1 ) {
          //   
          // }

          // var sourceLabel = failImpact.selectAll(".sources")
          //   .data(function() {
          //     if ( links.size() === 1 ) {
          //       return ["Only one:"];
          //     }
          //     else {
          //       return ["Sources:"];
          //     }
          //   });

          // sourceLabel.enter().append("span")
          //   .classed("sources", true)
          //   .text(function (d) { return d; });

          // sourceLabel.exit().remove();

          links.enter().append("a")
            .attr("class", "readmore")
            .attr("href", function(d) { return d; })
            .attr("target", "_blank")
            .html(function(d,i) {
              if ( links.size() === 1 ) {
                failImpact.selectAll(".sources").classed("hidden", true);
                return "Read&nbsp;More";
              }
              else {
                failImpact.selectAll(".sources").classed("hidden", false);
                return "["+ (i + 1) +"]";
              }
            });

          // if ( selection.datum().url.split("; ").length > 1 ) {
          //   selection.select(".fail-impact").append("span").style("margin-left", "1em").html("(Othery Sources:");

          //   selection.select(".fail-impact").selectAll(".readmore secondary-source")
          //     .data(function(d) { return d.url.split("; ").slice(1); })
          //   .enter().append("a")
          //   .attr("class", "readmore secondary-source-source")
          //   .attr("href", function(d) { return d; })
          //   .attr("target", "_blank")
          //   .html(function(d,i) {
          //     return "["+ (i + 1) +"]";
          //   });

          //   selection.select(".fail-impact").append("span").html(" )");

          // }

          // if (selection.selectAll(".readmore").size() > 1) {
          //   selection.select(".readmore:nth-child(0)").append("span").text(" (additional sources:");
          //   selection.select(".readmore:last-child").append("span").text(")");
          // }
          

          var buttons = chart.layers.infoBoxBase.select(".times").selectAll(".button");

          buttons.on("click", function () {
            var el = chart.base.select(".active");
            var dateIndex = +el.attr("data-date-index");

            event.preventDefault();

            if ( !el.empty() ) {

              // console.log("clicked");

              do {
                if ( d3.select(this).classed("prev") ) {
                  if ( dateIndex === 0 ) {
                    dateIndex = chart.dateIndexMax;
                  }
                  else {
                    dateIndex--;
                  }
                }
                else if ( d3.select(this).classed("next") ) {
                  if ( dateIndex >= chart.dateIndexMax ) {
                    // console.log("maxed");
                    dateIndex = 0;
                  }
                  else {
                    dateIndex++;
                  }
                }
                // console.log(dateIndex);
              } while (chart.base.select("[data-date-index=\"" + dateIndex + "\"]").empty() || 
                chart.base.select("[data-date-index=\"" + dateIndex + "\"]").datum()[chart.rData()] === 0 ||
                chart.base.select("[data-date-index=\"" + dateIndex + "\"]").classed("too-big") ||
                chart.base.select("[data-date-index=\"" + dateIndex + "\"]").classed("too-small") ||
                chart.base.select("[data-date-index=\"" + dateIndex + "\"]").datum()[chart.yData()] === "");

              var next = chart.base.select("[data-date-index=\"" + dateIndex + "\"]");
              var gaEventLabel = chart.parentID + "-" + next.datum().Headline;

              ga("send", "event", "datapoint", "click", gaEventLabel, chart.gaDatapointsClicked);
              chart.gaDatapointsClicked++;

              chart.base.selectAll(".active")
                .classed("active", false).style("fill-opacity", chart.fillOpacity);

              next
                .classed("active", true).style("fill-opacity", 0.8);

              chart.layer("info-box").draw();

              chart.trigger("selection change", el);

            }

          });

        },

        "exit" : function() {
          var selection = this;
          var chart = this.chart();

          selection.selectAll("*").remove();

          chart.layers.legendBase.select(".legend-ring").remove();

          selection.classed("hidden", true);

          chart.layers.infoBoxBase.select(".instructions").classed("hidden", false);

          // chart.layers.infoBoxBase.select(".nav-buttons").classed("hidden", true);
        }
      }

    });

  },
});


d3.csv("data/timeline.csv", function (data) {
  // Main callback starts after CSV data is loaded
  "use strict";

  // Pym is used for embedding in another page as an iframe
  var pymChild = new pym.Child();



  // Metadata constants
  var quantities = [
    {
      "columnName":"Impact - USD",
      "id":"money",
      "label":"Monetary cost",
      "instructsLabel":"with measurable costs",
      "ranges": [
        {"label":"Less than", "domain": [0,50000000]},
        {"label":"More than", "domain": [20000000,"max"]}
      ]
    },
    {
      "columnName":"Impact - hours",
      "id":"time",
      "label":"Duration",
      "instructsLabel":"with measurable durations",
      "ranges": [
        {"label":"Less than", "domain": [0,1]},
        {"label":"Less than", "domain": [0,12]},
        {"label":"Between", "domain": [1,24 * 30]},
        // {"label":"Less than", "domain": [0,24 * 30]},
        // {"label":"more than", "domain": [24 * 30,"max"]}
        {"label":"More than", "domain": [24 * 7,"max"]}
      ]
    },
    {
      "columnName":"Impact - customers affected",
      "id":"people",
      "label":"# of people affected",
      "instructsLabel":"that affected a measurable number of people",
      "ranges": [
        // {"label":"Less than", "domain": [0,10000]},
        {"label":"Less than", "domain": [0,50000]},
        {"label":"Between", "domain": [1000,1000000]},
        {"label":"More than", "domain": [150000,"max"]}
      ]
    }
  ];

  // var mapped = d3.map(quantities, function(d) { return d.id; });

  // console.log(mapped);

  var categories = [
    "Region",
    "Failure type",
    "Organization type",
    "Government type",
    "Government department",
    "Industry area",
    // "Companies"
  ];



  // Setup the chart dimensions
  var container = d3.select("#chart");
  var parWidth = container.node().parentNode.offsetWidth; // dynamically calc width of parent contatiner
  var margins = {top: 65, bottom: 50, right: 20, left: 20};
  var width = parWidth - margins.left - margins.right;
  var height = width * 1 / 3;
  var format, formatString;

  // margins = {top: 50, bottom: 50, right: 20, left: 20};
  // width = 620 - margins.left - margins.right;
  // height = 325 - margins.top - margins.bottom;

  // console.log(parWidth);

  // add non-SVG container elements
  var infoBox = container.append("div")
    .attr("class","info-box timeline-chart");

  var selectors = container.append("div")
    .attr("class","selectors");

  // selectors.append("div")
  //     .classed("status-base", true);

  var sizeSelector = selectors.append("div")
    .attr("class", "size-selection-container")
    .html("Size by:<br>");
    
  sizeSelector.append("select")
      .attr("class", "select-size dropdown");

  var rangeSelector = selectors.append("div")
    .attr("class", "range-selection-container")
    .html("View range:<br>");

  rangeSelector.append("select")
      .attr("class", "select-range dropdown");

  var selector = selectors.append("div")
    .attr("class", "category-selection-container")
    .html("Sort by:<br>");

  selector.append("select")
      .attr("class", "select-category dropdown");

  selectors.selectAll("div")
    .append("div")
      .attr("class", "limits");


  // initialize main chart    
  var bubbles = container
    .append("svg")
    .attr("class", "")
    .attr("id", "chart-svg")
    .chart("BubbleTimeline")
    .width(width)
    .height(height)
    .margin(margins)
    .dateParse("iso")
    .dateDisplay("%B 20%y")
    .yData("Region")
    .duration(300);

  bubbles.quantities = quantities;
  bubbles.sortables = categories;

  format = bubbles.dateDisplay();
  formatString = bubbles.dateParse();

    // .margins([20,90,70,90])

  // console.log(bubbles.mode());

  
  // Add total counters
  quantities.forEach(function (quantity) {
    quantity.sum = d3.sum(data, function (d) { return d[quantity.columnName]; });
    // console.log(quantity.sum);
  });

  var totalCounters = d3.selectAll(".total")
    .data(quantities);

  if ( bubbles.mode() === "mobile" ) {
    d3.select("body").classed("mobile-view", true);

    totalCounters
      .style("width", "100%")
      .style("margin", "0 0 1em");

    bubbles
      .width(container.node().parentNode.offsetWidth - 40)
      // .height((container.node().parentNode.offsetWidth - 40) / 1.5);
      .height((container.node().parentNode.offsetWidth - 40) * 3 / 4)
      .margin({top: 45, bottom: 45, right: 30, left: 10});
  }

  totalCounters.select(".number")
    .transition()
    .duration(1000)
    .delay(function (d, i) { return i *1000; })
    .tween("text", function (d) {
      var interp = d3.interpolateRound(0, d.sum);
      return function(t) {
        this.textContent = readableNumbers(interp(t));
        // console.log(this.textContent);
      };
    });

  // Process Data
  data.forEach(function(d) {
    d.dateOriginal = d.date;
    d.formattedDate = formatString.parse(d.date);
    d.dateObject = new Date(d.date);
    d.date = format(d.dateObject);
    d.month = d.dateObject.getMonth();

    // group recalls with # of people affected
    if (d["Impact - customers affected"] === "" && d["Impact - units recalled"] !== "") {
      d["Impact - customers affected"] = d["Impact - units recalled"];
    }

    quantities.forEach(function (quantity) {
      //coerce to number
      if (d[quantity.columnName] === null) {
        d[quantity.columnName] = 0;
      }
      else {
        d[quantity.columnName] = +d[quantity.columnName];
      }
    });
    
    // d.impact_qty = (parseInt(d.impact_qty) > 0) ? parseInt(d.impact_qty) : 0;
  });
  
  // sort data chronologically
  data.sort(function(a,b){return a.dateObject.getTime() - b.dateObject.getTime();});

  data.forEach(function(d, i) {
    d.dateIndex = i; // used for chronological step navigation
  });

  // selector.selectAll("option")
  //   .data(categories)
  //   .enter()
  //   .append("option")
  //     .attr("value", function(d) { return d; })
  //     .text(function(d) { return d.replace("Government", "Gov"); });

  // selector.select("[value=\"" + bubbles.yData() + "\"]")
  //   .property("selected", true);

  // selector.on("change", function() {
  //   var selection = this;
  //   var toFade = bubbles.base.selectAll(".label, .straight-line");
  //   var category = selection.value;
  //   var activeSelection = bubbles.base.select(".data-point.active");

  //   var gaEventLabel = bubbles.parentID + ": from " + bubbles.yData() + " to " + category;

  //   console.log(activeSelection);
  //   console.log(activeSelection.empty());

  //   console.log(category);

  //   if (category !== bubbles.yData()) {
  //     toFade
  //       .transition()
  //       .duration(bubbles.duration())
  //       .style("opacity", 0)
  //       .each("end", fadeIn);

  //     ga("send", "event", "dropdown", "change", gaEventLabel, bubbles.gaCategoriesChanged);
  //     bubbles.gaCategoriesChanged++;

  //   }
    
  //   function fadeIn() {
  //     console.log(category);
  //     bubbles.yData(category);

  //     bubbles.draw(data);
  //   }

  //   if ( activeSelection.empty() === false ){

  //     if ( activeSelection.datum()[category] === "" ) {
  //       // d3.select(bubbles.base.node().parentNode).select(".info-box").selectAll("div").remove();
  //       // d3.select(bubbles.base.node().parentNode).select(".legend-ring").remove();
  //       activeSelection.classed("active", false).style("fill-opacity", 0.2);
  //       bubbles.layer("info-box").draw();
  //     }

  //   }
  // });

  // sizeSelector.selectAll("option")
  //   .data(quantities)
  //   .enter()
  //   .append("option")
  //     .attr("value", function(d) { return d.id; })
  //     .text(function(d) { return d.label; });

  // console.log(sizeSelector.select("option"));

  // sizeSelector.select("option")
  //   .property("selected", true);

  // sizeSelector.on("change", function() {
  //   console.log("clicked size selector");
  //   var selection = this;
  //   var activeSelection = bubbles.base.select(".data-point.active");
  //   var metric = d3.select(selection).select("[value=" + selection.value + "]").datum();

  //   console.log(selection);

  //   var gaEventLabel = bubbles.parentID + ": from " + (d3.select(".selected").empty() ? "initial" : d3.select(".selected").attr("id")) + " to " + selection.value;
  //   console.log(gaEventLabel);

  //   if (d3.select(selection).select("[value=" + selection.value + "]") !== true) {
  //     ga("send", "event", "data metric", "change", gaEventLabel, bubbles.gaMetricChanged);
  //     bubbles.gaMetricChanged++;

  //     var options = rangeSelector.selectAll("option")
  //       .data(metric.ranges);

  //     options.enter()
  //       .append("option");
          
  //     options.attr("value", function(d) {
  //         if ( d.label === "Less than" ) {
  //           return d.domain[1];
  //         }
  //         else if ( d.label === "More than" ) {
  //           return d.domain[0];
  //         }
  //       })
  //       .attr("class", function(d) {
  //         if ( d.label === "Less than" ) {
  //           return "max";
  //         }
  //         else if ( d.label === "More than" ) {
  //           return "min";
  //         }
  //       })
  //       .text(function(d) {
  //         var optionLabel;
  //         if ( d.label === "Less than" ) {
  //           optionLabel = d.domain[1];
  //         }
  //         else if ( d.label === "More than" ) {
  //           optionLabel = d.domain[0];
  //         }
  //         if (metric.id === "time") {
  //           if ( optionLabel === 24 ) {
  //             optionLabel = "a day";
  //           }
  //           if ( optionLabel === 24 * 7 ) {
  //             optionLabel = "a week";
  //           }
  //           if ( optionLabel === 24 * 30 ) {
  //             optionLabel = "a month";
  //           }
  //         }
  //         else {
  //           optionLabel = formatNumber(optionLabel);
  //         }
  //         return d.label + " " + optionLabel;
  //       });

  //     options.exit().remove();

  //     // d3.selectAll("#chart-svg").classed("hidden", false);
  //     // // d3.select(".buttons").classed("hidden", false);
  //     // d3.select(".category-selection-container").classed("hidden", false);
  //     // d3.select(".info-box").classed("hidden", false);
  //     // d3.select(".totals-intro").classed("hidden", true);

  //     bubbles.rData(metric.columnName);

  //     d3.select("#chart-svg").attr("class", metric.id);
  //     d3.select("#chart .legend-base").attr("class", "legend-base");
  //     d3.select("#chart .legend-base").classed(metric.id, true);

  //     if ( activeSelection.empty() === false && (activeSelection.datum()[bubbles.rData()] > 0) === false ){
  //       activeSelection.classed("active", false);
  //     }

  //     bubbles.draw(data);
  //     pymChild.sendHeight();
  //   }
  //   else {
  //     console.log("Already selected");
  //   }

  // });

  // totalCounters.on("click", function() {
  //   console.log("clicked total");
  //   var selection = d3.select(this);
  //   var activeSelection = bubbles.base.select(".data-point.active");
  //   // var infoBox = d3.select(bubbles.base.node().parentNode).select(".info-box");
  //   // var ring = d3.select(bubbles.base.node().parentNode).select(".legend-ring");

  //   var gaEventLabel = bubbles.parentID + ": from " + (d3.select(".selected").empty() ? "initial" : d3.select(".selected").attr("id")) + " to " + selection.attr("id");
  //   console.log(gaEventLabel);

  //   if (selection.classed("selected") !== true) {
  //     ga("send", "event", "data metric", "change", gaEventLabel, bubbles.gaMetricChanged);
  //     bubbles.gaMetricChanged++;

  //     // d3.select(".legend").selectAll(".legend-step").remove();

  //     totalCounters.classed("selected", false);

  //     selection.classed("selected", true);

  //     d3.selectAll("#chart-svg").classed("hidden", false);
  //     // d3.select(".buttons").classed("hidden", false);
  //     d3.select(".category-selection-container").classed("hidden", false);
  //     d3.select(".info-box").classed("hidden", false);
  //     d3.select(".totals-intro").classed("hidden", true);

  //     bubbles.rData(selection.datum().columnName);

  //     d3.select("#chart-svg").attr("class", selection.datum().id);
  //     d3.select("#chart .legend-base").attr("class", "legend-base");
  //     d3.select("#chart .legend-base").classed(selection.datum().id, true);

  //     if ( activeSelection.empty() === false && (activeSelection.datum()[bubbles.rData()] > 0) === false ){
  //       activeSelection.classed("active", false);
  //     }

  //     bubbles.draw(data);
  //     pymChild.sendHeight();
  //   }
  //   else {
  //     console.log("Already selected");
  //   }

  // });

  bubbles.on("selection change", function() {
      // console.log("The element ", d, "was selected");
      pymChild.sendHeight();
    });


  bubbles.rData(quantities[0].columnName);
  // d3.selectAll("#chart-svg").classed("hidden", false);
  // // d3.select(".buttons").classed("hidden", false);
  // d3.select(".category-selection-container").classed("hidden", false);
  // d3.select(".info-box").classed("hidden", false);
  // d3.select(".totals-intro").classed("hidden", true);

  d3.select("#chart-svg").attr("class", quantities[0].id);
  d3.select("#chart .legend-base").attr("class", "legend-base");
  d3.select("#chart .legend-base").classed(quantities[0].id, true);
  d3.select(".fallback").remove();
  bubbles.draw(data);

  // console.log(data.length);

  var modernization = makeThemeChart("#modernization-chart","project termination/cancellation",quantities[0]);
  var health = makeThemeChart("#health-chart","health",quantities[0]);
  var bank = makeThemeChart("#banks-chart","bank",quantities[2]);
  var exchange = makeThemeChart("#exchange-chart","stock exchange",quantities[1]);
  var air = makeThemeChart("#air-chart","airport/port/customs systems",quantities[1]);

  (function() { // force re-render of element_name to get the styling right on-print
    var beforePrint = function() {
      parWidth = container.node().parentNode.offsetWidth; // dynamically calc width of parent contatiner
      width = parWidth - margins.left - margins.right;
      height = width * 1 / 3;

      bubbles
        .width(width)
        .height(height);

      modernization
        .width(width)
        .height(height / 1.5)
        .draw(modernization.data);

      health
        .width(width)
        .height(height / 1.5)
        .draw(health.data);

      bank
        .width(width)
        .height(height / 1.5)
        .draw(bank.data);


      exchange
        .width(width)
        .height(height / 1.5)
        .draw(exchange.data);

      air
        .width(width)
        .height(height / 1.5)
        .draw(air.data);

      // totalCounters
      //   .style("width", "30%")
      //   .style("margin", "0 20px 0 0");

      // d3.selectAll(".data-point.too-small, .data-point.too-big")
      //   // .filter(function(){
      //   //   return d3.select(this).classed("too-small") || d3.select(this).classed("too-big");
      //   // })
      //   .style("fill-opacity", 0);

      // console.log(d3.selectAll(".data-point.too-small, .data-point.too-big"));

      // bubbles.draw(data);

      bubbles.layer("grid-lines").draw(data);
      bubbles.layer("y-axis-labels").draw(data);
      bubbles.layer("bubbles").draw(data);

      pymChild.sendHeight();
    };

    var afterPrint = function() {
      parWidth = container.node().parentNode.offsetWidth; // dynamically calc width of parent contatiner
      width = parWidth - margins.left - margins.right;
      height = width * 1 / 3;

      bubbles
        .width(width)
        .height(height);

      modernization
        .width(width)
        .height(height / 3)
        .draw(modernization.data);

      health
        .width(width)
        .height(height / 3)
        .draw(health.data);

      bank
        .width(width)
        .height(height / 3)
        .draw(bank.data);


      exchange
        .width(width)
        .height(height / 3)
        .draw(exchange.data);

      air
        .width(width)
        .height(height / 3)
        .draw(air.data);

      totalCounters
        .attr("style", null);

      bubbles.layer("grid-lines").draw(data);
      bubbles.layer("y-axis-labels").draw(data);
      bubbles.layer("bubbles").draw(data);

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

  function makeThemeChart (id, filter, impact) {
    var infoBox = d3.select(id).append("div")
      .attr("class","info-box timeline-chart");

    var selectors = d3.select(id).append("div")
      .attr("class","selectors");

    var selector = selectors.append("div")
      .attr("class", "category-selection-container")
      .html("Sort by:<br>")
      .append("select")
        .attr("class", "select-category dropdown");

    var theme = d3.select(id)
      .append("svg")
      .attr("class", impact.id)
      .chart("BubbleTimeline")
      .width(width)
      .height(height / 3)
      .margin({top: 60, bottom: 65, right: 20, left: 20})
      .dateParse("iso")
      .dateDisplay("%B 20%y")
      .yData("Region")
      .rData(impact.columnName)
      .duration(300);

    // margins = {top: 50, bottom: 50, right: 20, left: 20}; 
    // width = 620 - margins.left - margins.right;
    // height = 300 - margins.top - margins.bottom;
    // theme
    //   .width(width)
    //   .height(height);

    theme.quantities = quantities;

    theme.layers.infoBoxBase.select(".instructions .metric")
        .text(impact.instructsLabel);

    if ( theme.mode() === "mobile" ) {
      theme
        .width(container.node().parentNode.offsetWidth - 40)
        .height(((container.node().parentNode.offsetWidth - 40) / 1.5) / 2);
    }

    d3.select(id).select(".legend-base").classed(impact.id, true);

    // console.log("[value=" + theme.yData() + "]");

    selector.select("[value=" + theme.yData() + "]")
      .property("selected", true);

    var themeData = data.filter(function (d) {
      // filter out data that has no set value (category)
      if (d.Theme.indexOf(filter) !== -1 && d[impact.columnName] !== 0) {
        return d;
      } 
    });

    theme.sortables = categories.filter(function (cat) {
        return themeData.some(function (d) {
          return d[cat] !== ""; 
        });
      });

    // console.log(theme.sortables);

    theme.sortables = theme.sortables.filter(function (cat) {
      return d3.set(themeData
        .filter(function(d) {
          return d[cat] !== "";
        })
        .map(function(d) { return d[cat]; }))
      .values().length > 1;
    });
    

    // selector.selectAll("option")
    //   .data(categories.filter(function (cat) {
    //     return themeData.some(function (d) {
    //       return d[cat] !== ""; 
    //     });
    //   }))
    //   .enter()
    // .append("option")
    //   .attr("value", function(d) { return d; })
    //   .text(function(d) { return d.replace("Government", "Gov"); });

    theme.preSelected = 0;

    theme.draw(themeData);

    // selector.on("change", function() {
    //   var selection = this;
    //   var toFade = theme.base.selectAll(".label, .straight-line");
    //   var category = selection.value;
    //   var activeSelection = theme.base.select(".data-point.active");

    //   var gaEventLabel = theme.parentID + ": from " + theme.yData() + " to " + category;

    //   console.log(category);

    //   if (category !== theme.yData()) {
    //     toFade
    //       .transition()
    //       .duration(theme.duration())
    //       .style("opacity", 0)
    //       .each("end", fadeIn);

    //     ga("send", "event", "dropdown", "change", gaEventLabel, theme.gaCategoriesChanged);
    //     theme.gaCategoriesChanged++;
    //   }
      
    //   function fadeIn() {
    //     console.log(category);
    //     theme.yData(category);

    //     theme.draw(themeData);
    //   }

    //   if ( activeSelection.empty() === false ){

    //     if ( activeSelection.datum()[category] === "" ) {
    //       // d3.select(theme.base.node().parentNode).select(".info-box").selectAll("div").remove();
    //       // theme.base.select(".legend-ring").remove();
    //       activeSelection.classed("active", false).style("fill-opacity", 0.2);
    //     }

    //   }
    // });

    theme.on("selection change", function() {
      // console.log("The element ", d, "was selected");
      pymChild.sendHeight();
    });

    return theme;
  }

  var Share = function() {
    // var fbInitialized = false;
    
    function shareData() {
      var data = {
        // title: $("meta[property='og:title']").attr('content'),
        // longTitle: "",
        // url: $("meta[property='og:url']").attr('content'),
        // image: $("meta[property='og:image']").attr('content'),
        // description: $("meta[property='og:description']").attr('content')
        title: "A Timeline of Costs",
        preTitle: "Lessons from a Decade of IT Failures:",
        url: window.parent.location.protocol + "//" + 
            window.parent.location.host +
            window.parent.location.pathname,
        images: {
          "default":"/images/main-timeline-fb.png",
          "modernization": "/images/modernization-timeline-fb.png",
          "health": "/images/health-timeline-fb.png",
          "banks": "/images/banks-timeline-fb.png",
          "exchange": "/images/exchanges-timeline-fb.png",
          "air": "/images/air-timeline-fb.png"
        },
        description: "Explore the many ways in which IT failures have squandered money, wasted time, and generally disrupted people’s lives"
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
      
      postToFacebook: function() {
        event.preventDefault();
        var data = shareData();
        data.title = $(this.parentNode).attr("data-section") !== undefined ? $("#" + $(this.parentNode).attr("data-section")).text() : data.title;
        data.image = $(this.parentNode).attr("data-section") !== undefined ? data.images[$(this.parentNode).attr("data-section")] : data.images.default;
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
      
      postToTwitter: function() {
        event.preventDefault();
        var data = shareData();
        data.title = $(this.parentNode).attr("data-section") !== undefined ? $("#" + $(this.parentNode).attr("data-section")).text() : data.title;
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

  pymChild.sendHeight();
  
});




function readableNumbers (n) {
  "use strict";
  var hundreds = d3.format(",3f");
  var bigNumbers = d3.format(" >3");

  // console.log(n);
  if ( n < 1e3 ) {
    // console.log("under 1K");
    // console.log(hundreds(n));
    return hundreds(n);
  }
  else if ( n < 1e6 ) {
    // console.log("under 1M");
    // console.log(bigNumbers(n/1e3) + " Thousand");
    return bigNumbers(n/1e3) + ",000";
  }
  else if ( n < 1e9 ) {
    // console.log("under 1B")
    // console.log(bigNumbers(n / 1e6) + " million");
    return bigNumbers(n / 1e6) + " million";
  }
  else {
    return bigNumbers(n / 1e9) + " billion";
  }
}

function formatNumber(amount) {
  "use strict";
  var formatted = "";
  var comma = d3.format(",");
  amount = Math.abs(amount);

  if ( typeof amount !== "number" && !isNaN(amount) ) {
    return "";
  }

  if ( amount === 0) {
    return "";
  }

  if ( amount >= 1e9 ) {
    formatted += (amount / 1e9).toPrecision(3).replace(/^(\d+\.\d*?[1-9])0+$|(\.0*?)$/, "$1") + " billion";
  }
  else if ( amount >= 1e6 ) {
    formatted += (amount / 1e6).toPrecision(3).replace(/^(\d+\.\d*?[1-9])0+$|(\.0*?)$/, "$1") + " million";
  }
  else {
    formatted += comma(amount);
  }

  return formatted;
}

function displayStat (chart, d) {
  "use strict";

  var svg = chart.base;
  var pre = "";
  var fullNum = readableNumbers(d[chart.rData()]);
  // console.log(fullNum);
  var num = fullNum.split(" ")[0];
  var post = fullNum.split(" ")[1] || "";
  var elem = "";
  var header = "Impact";

  var quantities = [
    {"columnName":"Impact - Qty", "id":"money"},
    {"columnName":"Impact - hours", "id":"time"},
    {"columnName":"Impact - customers affected", "id":"people"}
  ];

  quantities.forEach(function (quant) {
    var fullNum = null;
    var num = "";
    var pre = "";
    var post = "";
    var elemClass = "fail-stat";

    if ( +d[quant.columnName] > 0 ) {
      fullNum = formatNumber(d[quant.columnName]);
      num = fullNum.split(" ")[0];
      post = fullNum.split(" ")[1] || "";

      if ( chart.base.classed(quant.id) ) {
        elemClass += " current";
      }

      elemClass += " " + quant.id;

      if ( quant.id === "money" ) {
        if ( d["Currency Symbol"] === "$" ) {
          pre = d["Impact - Currency"].slice(0,2) + " " + d["Currency Symbol"];
        }
        else {
          pre = d["Currency Symbol"];
        }
        if ( pre !== "US $" ) {
          post += " <span class=\"conversion\">(US $"+ formatNumber(d["Impact - USD"]) +")</span>";
        }
      }
      else if ( quant.id === "time" ) {
        num = readableNumbers(d["Impact - duration"]).split(" "[0]);
        post = d["Impact - duration unit"];
        // console.log(d["Impact - duration"]);
        if (+d["Impact - duration"] === 1) {
          // console.log("singular");
          post = post.replace(/s$/,"");
        }
      }
      else if ( quant.id === "people" ) {
        post += " people";
      }
      elem +="<p class=\"" + elemClass + "\">" + 
        pre + 
        "<span class=\"number\">" + num + "</span> " + 
        post + "</p>";

      // console.log(elem); 
    }
  });

  if ( quantities.filter(function (quant) {
      return +d[quant.columnName] > 0;
    }).length > 1 ) {
    header += "s:";
  }
  else {
    header += ":";
  }

  return "<p class=\"fail-stat\">" + header + "</p>" + elem;

  // if ( svg.attr("class").indexOf("money") !== -1 ) {
  //   console.log("money value");
  //   console.log(d["Currency Symbol"]);
  //   pre = d["Currency Symbol"];
  // }
  // else if ( svg.attr("class").indexOf("time") !== -1 ) {
  //   num = readableNumbers(d["Impact - duration"]).split(" "[0]);
  //   post = d["Impact - duration unit"];
  //   console.log(d["Impact - duration"]);
  //   if (d["Impact - duration"] == 1) {
  //     console.log("singular");
  //     post = post.replace(/s$/,"");
  //   }
  // }
  // else if ( svg.attr("class").indexOf("people") !== -1 ) {
  //   post += " people";
  // }
  // console.log(pre);
  // return pre + " <span class=\"number\">" + num + "</span> " + post;

}