/*global d3, pym, ga */

"use strict";
class KotoBarChart extends Koto {
  constructor(selection) {
    super(selection);

    // Setup
    var chart = this;

    chart.layers = {};
    chart.quantities = []; // to allow bubbles to be sized by different criteria
    chart.sortables = []; // to allow different groupings of bubbles (y-axis)

    // define configs
    this.configs = {
      height: {
        name: "height",
        description: "The height of the chart.",
        value: 225,
        type: "number",
        units: "px",
        category: "Size",
        getter: function (){
          // get value
          return this.value;
        },
        setter: function (newValue){
          chart.trigger("change:height", newValue, this.value);
          // Set value
          return newValue;
        }
      },
      width: {
        name: "width",
        description: "The width of the chart.",
        value: 940,
        units: "px",
        type: "number",
        category: "Size",
        getter: function (){
          // get value
          return this.value;
        },
        setter: function (newValue){
          chart.trigger("change:width", newValue, this.value);
          console.log(newValue + " " + this.value);
          // Set value
          return newValue;
        }
      },
      maxBubbleSize: {
        name: "maxBubbleSize",
        description: "The maximum bubble radius.",
        value: 70,
        units: "px",
        type: "number",
        category: "Size",
        getter: function (){
          // get value
          return this.value;
        },
        setter: function (newValue){
          // Set value
          return newValue;
        }
      },
      duration: {
        name: "duration",
        description: "The basic transition duration for animations.",
        value: 300,
        type: "number",
        category: "Time",
        getter: function (){
          // get value
          return this.value;
        },
        setter: function (newValue){
          // Set value
          return newValue;
        }
      }
    };

    this.on("change:height", function(n, o) {
      console.log(n + " " + o);
    });

    // Scales
    this.x = d3.scale.linear()
      .range([0, this.config("width")]);

    this.y = d3.scale.linear()
      .domain([0, 100])
      .rangeRound([0, this.config("height")]);

    // create a yScale
    this.yScale = d3.scale.ordinal()
      .rangeRoundBands([0, this.config("height")], 0);

    // create an xScale
    this.xScale = d3.time.scale()
      .range([0, this.config("width")]);

    // create an rScale
    chart.rScale = d3.scale.sqrt()
      .range([0, this.config("maxBubbleSize")]);

    // console.log(chart.base);
    // console.log(chart.base.select("g"));
    // Layer Bases
    // TODO: change name from backgroundBase to background
    // Provides click target for unselecting a bubble
    chart.layers.backgroundBase = chart.base.append("rect")
      .attr("class", "chart-background")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", chart.config("width"))
      .attr("height", chart.config("height"))
      .style("opacity", 0);

    chart.layers.axesBase = chart.base.append("g")
      .classed("axes", true);

    chart.layers.linesBase = chart.base.append("g")
      .classed("lines", true);

    chart.layers.labelsBase = chart.base.append("g")
      .classed("labels", true);

    chart.layers.circlesBase = chart.base.append("g")
      .classed("circles", true);

    // TODO: refactor to add instead of select
    chart.layers.infoBoxBase = d3.select(chart.base.node().parentNode).select(".info-box");

    // TODO: refactor to add instead of select
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

    // Layers
    // add lines layer
    this.layer("grid-lines", chart.layers.linesBase, {
      // modes : ["web", "tablet"],
      dataBind() {
        var chart = this.chart();

        return this.selectAll(".straight-line")
          .data(chart.categories, function (d) { return d; });
      },

      // insert lines
      insert() {
        var selection =  this.append("line");

        return selection;
      },

    })

    .on("enter", selection => {
      selection
        .style("opacity", 0);
    })

    .on("merge", selection => {
      var chart = this;

      // draw lines
      selection
      .attr("class","straight-line")
        .attr("x1",0)
        .attr("x2",chart.config("width"))
        .attr("y1",function(d) { return chart.yScale(d) + (chart.yScale.rangeBand() / 2); })
        .attr("y2",function(d) { return chart.yScale(d) + (chart.yScale.rangeBand() / 2); })
        .attr("stroke-width", 1);


      return selection;
    })

    .on("merge:transition", selection => {
      var chart = this;

      selection
        .duration(chart.config("duration"))
        .style("opacity", 1);

    })

    .on("exit", selection => {
      this.remove();
    });

    // add y-axis labels
    this.layer("y-axis-labels", chart.layers.labelsBase, {
      // modes : ["web", "tablet"],
      dataBind() {
        return this.selectAll(".y.label")
          .data(chart.categories, function (d) { return d; });
      },

      // insert labels
      insert() {
        var selection =  this.append("text");

        return selection;
      },

    })

    .on("enter", selection => {
      selection
        .style("opacity", 0);
    })

    .on("merge", selection => {
      var chart = this;

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
    })

    .on("exit", selection => {
      this.remove();
    })

    .on("merge:transition", selection => {
      var chart = this;

      // console.log(selection);

      selection
        .duration(chart.config("duration"))
        .style("opacity", 1);
    });

    
    // add x-axis layer 
    this.layer("x-axis", chart.layers.axesBase, {
      // modes : ["web", "tablet"],
      dataBind(data) {
        return this.selectAll(".x")
          .data([data]);
      },

      // insert x-axis
      insert() {
        var selection = this.append("g")
          .attr("class", "x axis");

        return selection;
      },

    })
    .on("merge", selection => {
      var chart = this;
      // draw xaxis
      var xAxis = d3.svg.axis()
        .scale(chart.xScale)
        .orient("bottom")
        .ticks(6)
        .tickFormat(chart._xformat || d3.time.format("%Y"));

      chart.base.select(".x.axis")
        .attr("transform", "translate(0," + chart.config("height") + ")")
      .transition()
        .duration(chart.config("duration"))
        .call(xAxis);

      // chart.on("change:height", function() {
      //   chart.base.select(".x.axis")
      //     .attr("transform", "translate(0," + chart.config("height") + ")")
      //     .call(xAxis);
      // });

      return selection;
    });

    // add a circle layer
    this.layer("bubbles", chart.layers.circlesBase, {
      // modes : ["web", "tablet"],
      dataBind(data) {
        var chart = this.chart();

        return this.selectAll("circle")
          .data(data
            .filter(function (d) {
              // filter out data that has no set value (category)
              if (chart.accessor("y")(d) !== "") {
                return d;
              }
              else {
                // console.log("Not included:" + d);
              } 
            })
            .sort(function(a,b) {
              // sort from biggest to smallest so that all bubbles are clickable
              return chart.accessor("r")(b) - chart.accessor("r")(a);
            }), function (d) { return chart.accessor("id")(d); });
      },

      // insert circles
      insert() {
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
     
    })
    // for new and updating elements, reposition
    // them according to the updated scale.
    .on("merge", selection => {
      var chart = this;

      selection
        .attr("cx",function(d) { return chart.xScale(d.formattedDate); });

      selection.order();

      // console.log(chart.preSelected)
      if ( chart.preSelected !== undefined && chart.layers.circlesBase.select(".active").empty() ) {
        selection
          .classed("active", function (d,i) { return i === 1; });
      }

      selection
        .classed("too-big", function(d) {
          return chart.accessor("r")(d) > chart.rScale.domain()[1] && chart.accessor("y")(d) !== "";
        })
        .classed("too-small", function(d) {
          return chart.accessor("r")(d) !== 0 && chart.accessor("r")(d) < chart.minVisible && chart.accessor("y")(d) !== ""; 
        });

      selection.filter(function() {
          return !(d3.select(this).classed("too-big") || d3.select(this).classed("too-small") || d3.select(this).classed("active"));
        })
        .style("fill-opacity", chart.fillOpacity);

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

          var gaEventLabel = chart.parentID + "-" + selectedData.Headline;

          ga("send", "event", "datapoint", "click", gaEventLabel, chart.gaDatapointsClicked);
          chart.gaDatapointsClicked++;
          // console.log(chart.gaDatapointsClicked);
          // console.log(gaEventLabel);
          
          // console.log(selectedData);

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
          }
        
        });
      
      // console.log("circles merged");
      // chart.on("change:height", function(n, o) {
      //   console.log("height changed");
      //   selection
      //     .attr("cy", function(d) { return chart.yScale(chart.accessor("y")(d)) + (chart.yScale.rangeBand() / 2); });
      // });

      // chart.on("change:height", function(n, o) {
      //   console.log(n + " " + o);
      // });

      return selection;
    })
    .on("merge:transition", selection => {
      var chart = this;

      selection
        .duration(1000)
        .attr("cy", function(d) { return chart.yScale(chart.accessor("y")(d)) + (chart.yScale.rangeBand() / 2); })
        .attr("r", function(d) { return chart.rScale(chart.accessor("r")(d)); })
        .filter(function(){
          return d3.select(this).classed("too-small") || d3.select(this).classed("too-big");
        })
        .style("fill-opacity", 0);
      console.log("circles sized and positioned");
    })
    .on("exit:transition", selection => {
      selection
        .duration(1000)
        .attr("r", 0);
    });

    // add a layer
    this.layer("bars", this.base.append("g"), {
      // destructuring ftw
      dataBind(data) {
        return this.selectAll("rect")
          .data(data.filter( (d) => d.value > 1 ), d => d.time);
      },
      insert() {
        return this.append("rect");
      }
    })
    // lifecycle events (Arrow function syntax)
    .on("enter", selection => {
      var length = this._length = selection.data().length;
      selection.attr("x", (d, i) => this.x(i + 1) - 0.5 )
        .attr("y", (d) => this.config("height") - this.y(d.value) - 0.5)
        .attr("width", this.config("width") / length)
        .style("fill", "steelBlue")
        .attr("height", d => this.y(d.value));
    })
    .on("merge:transition", selection => {
      selection.duration(1000)
        .attr("x", (d, i) => this.x(i) - 0.5);
    })
    .on("exit:transition", selection => {
      selection.duration(1000)
        .attr("x", (d, i) => this.x(i - 1) - 0.5)
        .remove();
    });

    // add another layer 
    this.layer("labels", this.base.append("g"), {
      dataBind(data) {
        return this.selectAll("text")
          .data(data.filter( (d) => d.value > 1 ), d => d.time);
      },
      insert() {
        return this.append("text");
      }
    })
    // non arrow function syntax
    .on("enter", function() {
      var length = this.data().length;
      var twoDigit = d3.format("2f");
      this
        .attr("x", (d, i) => chart.x(i + 1) + ((chart.config("width") / length) / 2))
        .attr("y", d => chart.config("height") - chart.y(d.value) - 15)
        .style("fill", "steelBlue")
        .style("text-anchor", "middle")
        .text(d => twoDigit(d.value));
    })
    .on("merge:transition", function() {
      this.duration(1000)
        .attr("x", (d, i) => chart.x(i) + ((chart.config("width") / chart._length) / 2));
    })
    .on("exit:transition", function() {
      this.duration(1000)
        .attr("x", (d, i) => chart.x(i - 1) - 0.5)
        .remove();
    });
  }

  //override methods
  preDraw(data) {
    this.x.domain([0, data.length]);

    // Scales
    this.x.range([0, this.config("width")]);

    this.y.rangeRound([0, this.config("height")]);

    // Update yScale
    this.yScale.rangeRoundBands([0, this.config("height")], 0);
    console.log("y scale updated");
    console.log(this.config("height"));
    console.log(this.yScale.range());

    // Update xScale
    this.xScale.range([0, this.config("width")]);

    // Update rScale
    this.rScale.range([0, this.config("maxBubbleSize")]);

    // Update background size
    this.layers.backgroundBase
        .attr("height", this.config("height"))
        .attr("width", this.config("width"));
  }

  transform(data) {
    var chart = this;

    // console.log(data);

    //get an array of unique values for a given key
    chart.categories = d3.set(data
      .filter(function (d) {
        // filter out data that has no set value (category)
        // console.log(chart.accessor("y")(d));
        if (chart.accessor("y")(d) !== "") {
          return d;
        } 
      })
      .map(function(d) { return chart.accessor("y")(d); }))
      .values().sort();

    // console.log(chart.categories);
    //update y scale domain
    chart.yScale.domain(chart.categories);

    //update x scale domain
    chart.xScale.domain(d3.extent(data, function(d) { return d.dateObject; })).nice();

    //update r scale domain
    chart.min = d3.min(data, function(d) { 
      if (chart.accessor("r")(d) > 0) {
        return chart.accessor("r")(d); 
      }
    });
    chart.max = d3.max(data, function(d) { return chart.accessor("r")(d); });

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
  }
}