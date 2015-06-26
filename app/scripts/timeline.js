/*global d3, pym */
d3.chart("MarginChart").extend("BubbleTimeline", {

  transform: function(data) {
    "use strict";
    var chart = this;

    // chart.data = data;

    // console.log(data);

    var format = chart.dateDisplay();
    var formatString = chart.dateParse();

    // console.log(format);
    // console.log(formatString);

    data.forEach(function(d) {
      d.dateOriginal = d.date;
      d.formattedDate = formatString.parse(d.date);
      d.dateObject = new Date(d.date);
      d.date = format(d.dateObject);
      d.month = d.dateObject.getMonth();

      //coerce to number
      if (d[chart.rData()] === null) {
        d[chart.rData()] = 0;
      }
      else {
        d[chart.rData()] = +d[chart.rData()];
      }
      

      // d.impact_qty = (parseInt(d.impact_qty) > 0) ? parseInt(d.impact_qty) : 0;
    });

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

    console.log(chart.categories);
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
    var min = d3.min(data, function(d) { 
      if (d[chart.rData()] > 0) {
        return d[chart.rData()]; 
      }
    });
    var max = d3.max(data, function(d) { return d[chart.rData()]; });

    console.log(min);
    console.log(max);

    chart.rScale.domain([0, max]);

    return data;
  },

  initialize: function() {
    "use strict";

    var chart = this;

    chart.layers = {};

    console.log(chart);

    chart.layers.axesBase = chart.base.select("g").append("g")
      .classed("axes", true);

    chart.layers.labelsBase = chart.base.select("g").append("g")
      .classed("labels", true);

    chart.layers.linesBase = chart.base.select("g").append("g")
      .classed("lines", true);

    chart.layers.circlesBase = this.base.select("g").append("g")
      .classed("circles", true);

    chart.layers.legendBase = this.base.append("g")
      .classed("legend", true);

    chart.layers.infoBoxBase = this.base.append("g")
      .classed("circle-info-box", true);

    // create an xScale
    chart.xScale = d3.time.scale()
      .range([0, chart.width()]);

    // when the width changes, update the x scale range
    chart.on("change:width", function(newWidth) {
      chart.xScale.range([0, newWidth]);
    });

    // create a yScale
    chart.yScale = d3.scale.ordinal()
      .rangeRoundBands([0, chart.height()], 0);

    // when the height changes, update the y scale range
    chart.on("change:height", function(newHeight) {
      chart.yScale.rangeRoundBands([0, newHeight], 0);
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
      .range([0, 70]);

    // // when the r data changes, update r scale domain
    // chart.on("change:rData", function(newRData) {
    //   console.log(newRData);
    //   //update r scale domain
    //   var min = chart.data ? d3.min(chart.data, function(d) { return d[chart.rData()]; }) : 0;
    //   var max = chart.data ? d3.max(chart.data, function(d) { return d[chart.rData()]; }) : 0;
    //   console.log(max);
    //   chart.rScale.domain([0, max]);

    // });


    // add lines layer
    this.layer("grid-lines", chart.layers.linesBase, {
      modes : ["web", "tablet"],
      dataBind: function(data) {
        var chart = this.chart();

        return this.selectAll(".straight-line")
          .data(chart.categories, function (d) { return d; });
      },

      // insert lines
      insert: function() {
        var chart = this.chart();
        var selection =  this.append("line");

        return selection;
      },

      events: {
        "enter" : function() {
          var chart = this.chart();
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
      modes : ["web", "tablet"],
      dataBind: function(data) {
        var chart = this.chart();

        return this.selectAll(".y.label")
          .data(chart.categories, function (d) { return d; });
      },

      // insert labels
      insert: function() {
        var chart = this.chart();
        var selection =  this.append("text");

        return selection;
      },

      events: {
        "enter" : function() {
          var chart = this.chart();
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

          console.log(selection);

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
      modes : ["web", "tablet"],
      dataBind: function(data) {
        var chart = this.chart();

        return this.selectAll(".x")
          .data([data]);
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
            .duration(chart.duration())
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
            .duration(chart.duration())
            .call(xAxis);
        }
      }

    });

    // add a circle layer
    this.layer("breach-dots", chart.layers.circlesBase, {
      modes : ["web", "tablet"],
      dataBind: function(data) {
        var chart = this.chart();

        return this.selectAll("circle")
          .data(data
            .filter(function (d) {
              // filter out data that has no set value (category)
              if (d[chart.yData()] !== "") {
                return d;
              } 
            })
            .sort(function(a,b) {
              return b[chart.rData()] - a[chart.rData()];
            }), function (d) { return d.Headline; });
      },

      // insert circles
      insert: function() {
        var chart = this.chart();
        var selection =  this.append("circle");

        selection
          .classed("data-point", true)
          .attr("r", 0);

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
            .attr("cx",function(d) { return chart.xScale(d.formattedDate); });
            // .attr("cy",function(d) { return chart.yScale(d[chart.yData()]) + (chart.yScale.rangeBand() / 2); })
            

          selection.order();

          
          // add a mouseover listener to our circles
          // and change their color and broadcast a chart
          // brush event to any listeners.
          selection
            .on("click", function() {
              var el = d3.select(this);
              var selectedData = el.datum();
              var infoBox = d3.select(".info-box");
              
              console.log(selectedData);
              // el.selectAll("circle")

              if ( el.classed("active") !== true ) {
                d3.selectAll(".active")
                  .classed("active", false);

                el
                  .classed("active", true);

                d3.select(".legend-ring").remove();

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
                //         return ("$ " + d[chart.rData()] / 1e9) + " Billion";
                //       }
                //       else if (d[chart.rData()] >= 1e6) {
                //         return ("$ " + d[chart.rData()] / 1e6) + " Million";
                //       }
                //     });

                d3.select(".legend").append("circle")
                  .attr("class", "legend-ring")
                  .attr("cx", 0)
                  .attr("cy", 0)
                  .attr("r", chart.rScale(selectedData[chart.rData()]))
                  .attr("stroke-width", 2)
                  .attr("fill", "none")
                  .style("stroke", "red");

                infoBox.selectAll("div").remove();

                var infoBoxContent = infoBox.selectAll("div")
                .data([selectedData]).enter().append("div")
                .attr("class", "isotope-item");
                  
                infoBoxContent.append("p")
                  .attr("class", "fail-stat")
                  .html(function (d) { return displayStat(chart, d); });

                infoBoxContent.append("time")
                  .attr("class", "date")
                  .text(function (d) { return d.date; });

                infoBoxContent
                  .append("a")
                  .attr("href", function(d) { return d.url; })
                  .attr("target", "_blank")
                  .append("h3")
                  .attr("class", "fail-hed")
                  .text(function (d) { return d.Headline; });

                infoBoxContent
                  .append("p")
                  .attr("class", "fail-impact")
                  .text(function(d) { return d["Impact - Raw"]; });

                infoBoxContent
                  .append("a")
                  .attr("class", "readmore")
                  .attr("href", function(d) { return d.url; })
                  .attr("target", "_blank")
                  .text("Read More");

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


          return selection;
        },

        "merge:transition": function() {
          var chart = this.chart();
          var selection = this;

          selection
            .duration(1000)
            .attr("cy",function(d) { return chart.yScale(d[chart.yData()]) + (chart.yScale.rangeBand() / 2); })
            .attr("r", function(d) { return chart.rScale(d[chart.rData()]); });
        },

        "exit:transition": function() {
          var chart = this.chart();
          var selection = this;

          selection
            .duration(1000)
            .attr("r", 0);
        }
      }

    });

    this.layer("legend", chart.layers.legendBase, {
      modes: ["web", "tablet"],
      dataBind: function(data) {
        var chart = this.chart();
        var min = d3.min(data, function(d) { 
          if (d[chart.rData()] > 0) {
            return d[chart.rData()]; 
          }
        });
        var max = d3.max(data, function(d) { return d[chart.rData()]; });
        var intervals = [];

        for (var i = 1; i < max; i = i*10) {
          if ( i > min ) {
            intervals.unshift(i);
          }
        }

        intervals.splice(1, 0, intervals[0]/2);

        console.log(intervals.slice(0,4));

        d3.select(".legend")
          .attr("transform", "translate("+ 
          (chart.width() + (2 * chart.margin().left) + chart.rScale(intervals[0])) + 
          "," + 
          (chart.margin().top + chart.rScale(intervals[0])) +
          ")");

        return this.selectAll("g")
          .data(intervals.slice(0,4), function (d) { return d; } );
      },

      insert: function() {
        var chart = this.chart();
        var selection =  this.append("g");

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

        return selection;
      },

      events: {
        "enter" : function() {
          var chart = this.chart();
          var selection = this;
          var el = d3.select(this);

          selection.selectAll(".legend-circle")
            .attr("cx", 0)
            .attr("cy", 0);

          selection.selectAll(".legend-line")
            .attr("x1", 0)
            .attr("x2", 0)
            .attr("y1", function(d) { console.log(d); return - chart.rScale(d); })
            .attr("y2", function(d) { return - chart.rScale(d); })
            .attr("stroke", "gray")
            .attr("stroke-width", 1);

          selection.selectAll(".legend-text")
            .attr("x", 70)
            .attr("dy", ".5em")
            .attr("dy", ".5em")
            .attr("y", function (d) { return - chart.rScale(d); })
            .style("opacity", 0);

          var last = d3.select(".legend").select("g:last-child");

          last.select(".legend-line")
            .attr("y1", function(d) { return chart.rScale(d); })
            .attr("y2", function(d) { return chart.rScale(d); });

          last.select(".legend-text")
            .attr("y", function (d) { return chart.rScale(d); });

          return selection;
        },

        "exit" : function() {
          this.remove();
        },
 
        "merge:transition": function() {
          var chart = this.chart();
          var selection = this;
          var active = d3.select(".data-point.active");

          selection.selectAll(".legend-circle")
            .duration(1000)
            .attr("r", function(d) { return chart.rScale(d); });

          selection.selectAll(".legend-line")
            .delay(1000)
            .duration(300)
            .attr("x2", 70);

          selection.selectAll(".legend-text")
            .delay(1300)
            .text(function (d) { return readableNumbers(d); })
            .style("opacity", 1);

          if ( active.empty() === false && d3.select(".legend-ring").empty() === true) {
            d3.select(".legend").append("circle")
              .attr("class", "legend-ring")
              .attr("cx", 0)
              .attr("cy", 0)
              .attr("stroke-width", 2)
              .attr("fill", "none")
              .style("stroke", "red")
              .attr("r", 0)
              .transition()
              .duration(1000)
              .attr("r", chart.rScale(active.datum()[chart.rData()]));
              

          }
        }
      }

    });

    // this.layer("item-info", this.base.append("g"), {
    //   modes: ["web", "tablet"],
    //   dataBind: function(data) {
    //     var chart = this.chart();
    //     return this.select(".info-box").selectAll("isotope-item")
    //       .data(d3.select(".datapoint.active").datum());
    //   },

    //   insert: function() {
    //     var chrt = this.chart();
    //     return this.append("div")
    //       .attr("class", "isotope-item");
    //   }

    // });


    // for mobile, add a small text layer
    this.layer("mobile-text", this.base.append("g"), {
      modes: ["mobile"],
      dataBind: function(data) {
        return this.selectAll("text")
          .data([data.length]);
      },

      insert: function() {
        var chart = this.chart();
        return this.append("text")
          .style("fill", "blue")
          .attr("y", "10%")
          .attr("x", 10);
      },
      events: {
        merge : function() {
          return this.text(function(d) {
            return "There are " + d + " items painted on the screen";
          });
        }
      }
    });
  },
});


d3.csv("timeline-data-6-18.csv", function (data) {
  "use strict";

  var quantities = [
    {"columnName":"Impact - Qty", "id":"money"},
    {"columnName":"Impact - hours", "id":"time"},
    {"columnName":"Impact - customers affected", "id":"people"}
  ];

  quantities.forEach(function (quantity) {
    quantity.sum = d3.sum(data, function (d) { return d[quantity.columnName]; });
    console.log(quantity.sum);
  });
  
  var totalCounters = d3.selectAll(".total")
    .data(quantities);

  totalCounters.select(".number")
    .transition()
    .duration(1000)
    .delay(function (d, i) { return i *1000; })
    .tween("text", function (d) {
      var interp = d3.interpolateRound(0, d.sum);
      return function(t) {
        this.textContent = readableNumbers(interp(t));
        console.log(this.textContent);
      };
    });

  var categories = [
    "Country",
    "Failure Type",
    "Organization Type",
    "Government Type",
    "Government Department",
    "Industry Area"
  ];

  var infoBox = d3.select("#chart").append("div")
      .attr("class","info-box");

  var bubbles = d3.select("#chart")
    .append("svg")
    .attr("class", "hidden")
    .chart("BubbleTimeline")
    .width(680)
    .height(400)
    .margin({top: 50, bottom: 70, right: 240, left: 20})
    .dateParse("iso")
    .dateDisplay("%B 20%y")
    .yData("Country")
    .duration(300);

    // .margins([20,90,70,90])

  var buttons = d3.select("#chart").append("div")
    .attr("class", "select-category buttons hidden")
    .selectAll("a.button")
    .data(categories)
    .enter()
  .append("a")
    .attr("class", "button")
    .attr("id", function(d) { return d.toLowerCase().replace(" ","-"); })
    .text(function(d) { return d.replace("Government", "Gov"); });

  d3.select("#country")
    // .property("disabled", true);
    .classed("inactive", true);

  buttons.on("click", function() {
    var button = d3.select(this);
    var toFade = d3.selectAll(".label, .straight-line");
    var category = button.datum();
    var activeSelection = d3.select(".data-point.active");

    // console.log(toFade);
    
    if (category !== bubbles.yData()) {
      toFade
      .transition()
      .duration(bubbles.duration())
      .style("opacity", 0)
      .each("end", fadeIn);
    }
    
    function fadeIn() {
      console.log(category);
      bubbles.yData(category);

      // bubbles.draw(data.filter(function (d) {
      //   // console.log(d[button.datum()]);
      //   if (d[button.datum()] !== "") {
      //     return d;
      //   } 
      // }));

      bubbles.draw(data);
    }

    if ( activeSelection.empty() === false ){

      if ( activeSelection.datum()[category] === "" ) {
        infoBox.selectAll("div").remove();
        d3.select(".legend-ring").remove();
        activeSelection.classed("active", false);
      }

    }

    buttons
      // .property("disabled", true);
      .classed("inactive", false);

    button
      // .property("disabled", true);
      .classed("inactive", true);
    
  });

  totalCounters.on("click", function() {
    console.log("clicked total");
    var selection = d3.select(this);
    var activeSelection = d3.select(".data-point.active");
    var infoBox = d3.select(".info-box");
    var ring = d3.select(".legend-ring");

    if (selection.classed("selected") !== true) {
      totalCounters.classed("selected", false);

      selection.classed("selected", true);

      d3.select("#chart svg").classed("hidden", false);
      d3.select(".buttons").classed("hidden", false);
      d3.select(".totals-intro").classed("hidden", true);

      bubbles.rData(selection.datum().columnName);

      d3.select("#chart").select("svg").attr("id", selection.datum().id);

      if ( activeSelection.empty() === false ){
        console.log(activeSelection.datum()[bubbles.rData()]);
        ring.remove();

        if ( activeSelection.datum()[bubbles.rData()] > 0 ) {
          infoBox.select(".fail-stat")
            .html(function (d) { return displayStat(bubbles, d); });

          // ring
          //   .transition()
          //   .duration(bubbles.duration())
          //   .attr("r", bubbles.rScale(activeSelection.datum()[selection.datum().columnName]));

        }
        else {
          infoBox.selectAll("div").remove();
          
          activeSelection.classed("active", false);
        }
      }

      bubbles.draw(data);
      pymChild.sendHeight();
    }
    else {
      console.log("Already selected");
    }

  });

  var pymChild = new pym.Child();

  // bubbles.draw(data);

  
});


function readableNumbers (n, mode) {
  "use strict";
  var hundreds = d3.format(",3g");
  var bigNumbers = d3.format("f");

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
    // console.log(bigNumbers(n / 1e6) + " Million");
    return bigNumbers(n / 1e6) + " Million";
  }
  else {
    return bigNumbers(n / 1e9) + " Billion";
  }
}

function displayStat (chart, d) {
  "use strict";

  var svg = d3.select("#chart").select("svg");
  var pre = "";
  var fullNum = readableNumbers(d[chart.rData()]);
  console.log(fullNum);
  var num = fullNum.split(" ")[0];
  var post = fullNum.split(" ")[1] || "";

  if ( svg.attr("id") === "money" ) {
    pre = d["Currency Symbol"];
  }
  else if ( svg.attr("id") === "time" ) {
    num = readableNumbers(d["Impact - duration"]).split(" "[0]);
    post = d["Impact - duration unit"];
  }
  else if ( svg.attr("id") === "people" ) {
    post += " people";
  }

  return pre + " <span class=\"number\">" + num + "</span> " + post;

}