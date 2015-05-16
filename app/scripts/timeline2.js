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


// var data = [1,3,4,6,10];

// var chart = d3.select("#chart2")
//   .append("svg")
//   .chart("Circles")
//     .width(100)
//     .height(50)
//     .radius(5);

// chart.draw(data);


d3.chart("MarginChart").extend("BubbleTimeline", {

  transform: function(data) {
    var chart = this;

    chart.data = data;

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

      //coerce to number
      d[chart.rData()] = +d[chart.rData()];
      // d.impact_qty = (parseInt(d.impact_qty) > 0) ? parseInt(d.impact_qty) : 0;
    });

    //get an array of unique values for a given key
    var categories = d3.set(data.map(function(d) { return d[chart.yData()]; })).values();
    console.log(categories);
    //update y scale domain
    chart.yScale.domain(categories);

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
    var min = d3.min(data, function(d) { return d[chart.rData()]; });
    var max = d3.max(data, function(d) { return d[chart.rData()]; });

    console.log(min);
    console.log(max);

    chart.rScale.domain([0, max]);

    return data;
  },

  initialize: function() {

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


    // create an xScale
    this.xScale = d3.time.scale()
      .range([0, chart.width()]);

    // when the width changes, update the x scale range
    chart.on("change:width", function(newWidth) {
      chart.xScale.range([0, newWidth]);
    });

    // create a yScale
    this.yScale = d3.scale.ordinal()
      .rangeRoundBands([0, chart.height()], 0);

    // when the height changes, update the y scale range
    chart.on("change:height", function(newHeight) {
      chart.yScale.rangeRoundBands([0, chart.height()], 0);
    });
      
    // create a rScale
    this.rScale = d3.scale.sqrt()
      .range([0, 70]);


    // add lines layer
    this.layer("grid-lines", chart.layers.linesBase, {
      modes : ["web", "tablet"],
      dataBind: function(data) {
        var chart = this.chart();

        return this.selectAll(".line")
          .data(d3.set(data.map(function(d) { return d[chart.yData()]; })).values());
      },

      // insert lines
      insert: function() {
        var chart = this.chart();
        var selection =  this.append("line");

        return selection;
      },

      events: {
        "merge" : function() {
          var chart = this.chart();
          var selection = this;

          // draw lines
          selection
          .attr("class","line")
            .attr("x1",0)
            .attr("x2",chart.width())
            .attr("y1",function(d) { return chart.yScale(d) + (chart.yScale.rangeBand() / 2); })
            .attr("y2",function(d) { return chart.yScale(d) + (chart.yScale.rangeBand() / 2); })
            .attr("stroke","black")
            .attr("stroke-width", 1);


          return selection;
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
          .data(d3.set(data.map(function(d) { return d[chart.yData()]; })).values());
      },

      // insert labels
      insert: function() {
        var chart = this.chart();
        var selection =  this.append("text");

        return selection;
      },

      events: {
        "merge" : function() {
          var chart = this.chart();
          var selection = this;

          // when the y data changes, update y scale domain
          chart.on("change:yData", function(newYData) {
            //get an array of unique values for a given key
            console.log(newYData);
            console.log(chart.yData())
            // console.log(chart.data);
            var categories = d3.set(chart.data.map(function(d) { return d[chart.yData()]; })).values();
            console.log(categories);
            //update y scale domain
            chart.yScale.domain(categories);

          });

          // draw labels
          selection
          .attr("class","y label")
            .attr("x",0)
            .attr("y",function(d) { return chart.yScale(d) + (chart.yScale.rangeBand() / 2); })
            .attr("dy", ".35em")
            .attr("dx", "-.5em")
            .text(function(d) { return d; })
            .attr("text-anchor","end");

          return selection;
        },
        "exit" : function() {
          this.remove();
        }

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
            .duration(300)
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
            .duration(300)
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
          .data(data.sort(function(a,b) {
            return b[chart.rData()] - a[chart.rData()];
          }));
      },

      // insert circles
      insert: function() {
        var chart = this.chart();
        var selection =  this.append("circle");

        selection
          .classed("data-point", true);

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
            .attr("cx",function(d) { return chart.xScale(d.formattedDate); })
            .attr("cy",function(d) { return chart.yScale(d[chart.yData()]) + (chart.yScale.rangeBand() / 2); })
            .attr("r", function(d) { return chart.rScale(d[chart.rData()]); });

          
          // add a mouseover listener to our circles
          // and change their color and broadcast a chart
          // brush event to any listeners.
          selection
          .on("mouseover", function() {
            var el = d3.select(this);
            // el.selectAll("circle")

            el
              .classed("active", true);

            el
              .append("g")
                .attr("class","tt")
              .append("text")
                .attr("y", function(d) { return chart.yScale(d[chart.yData()]) + (chart.yScale.rangeBand() / 2); })
                .attr("x", function(d) { return chart.xScale(d.formattedDate); })
                .attr("dy", "-.5em")
                .attr("dx", ".5em")
                .attr("class", "ttText")
                .text(function(d) { return d.hed; });

            el.select(".tt")
              .append("text")
                .attr("y", function(d) { return chart.yScale(d[chart.yData()]) + (chart.yScale.rangeBand() / 2); })
                .attr("x", function(d) { return chart.xScale(d.formattedDate); })
                .attr("dy", "-1.7em")
                .attr("dx", ".5em")
                .attr("class", "ttText")
                .attr("color", "red")
                .text(function(d) { return d[chart.rData()] / 1000000; });

            console.log(el.selectAll(".tt")[0][0].parentNode.parentNode);
            var tooltip = el.selectAll(".tt")[0][0];
            tooltip.parentNode.parentNode.appendChild(tooltip);

            var ttText = d3.selectAll("text.ttText");
            if (ttText.attr("x") > chart.width() * .5 ) {
              ttText
                .attr("text-anchor","end")
                .attr("dx", "-.5em");
            }
          });

          selection.on("mouseout", function() {
            var el = d3.select(this);

            el
              .classed("active", false);

            d3.select(".tt").remove();

            chart.trigger("unbrush", this);
          });


          return selection;
        }
      }

    });

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
            return "There are " + d + " boxes painted on the screen";
          });
        }
      }
    });
  },
});

var data = d3.csv("RiskFactor-monetary-test.csv", function (data) {
  var categories = [
    "country",
    "failure_type",
    "org_type",
    "gov_type",
    "gov_dept",
    "industry_area"
  ];

  var buttons = d3.select("#chart").append("div")
    .attr("class", "select-category")
    .selectAll("button")
    .data(categories)
    .enter()
  .append("button")
    .attr("id", function(d) { return d; })
    .text(function(d) { return d; });

  var bubbles = d3.select("#chart")
    .append("svg")
    .chart("BubbleTimeline")
    .width(700)
    .height(400)
    .margin({top: 20, bottom: 70, right: 0, left: 240})
    .dateParse("iso")
    .dateDisplay("%B %d, 20%y")
    .yData("gov_dept")
    .rData("impact_qty");

    // .margins([20,90,70,90])


  buttons.on("click", function() {
    var button = d3.select(this);
    console.log(button.datum());

    bubbles.yData(button.datum());

    bubbles.draw(data);
  });


  bubbles.draw(data);
});