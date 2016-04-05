/*global d3, pym, ga */

"use strict";
class KotoBarChart extends Koto {
  constructor(selection) {
    super(selection);

    // Setup
    var chart = this;

    chart.layers = {};

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
      }
    };

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
        .classed("legend-outer", true);chart.layers.infoBoxBase = d3.select(chart.base.node().parentNode).select(".info-box");

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
    // add a layer
    this.layer("bars", this.base.append("g"), {
      // destructuring ftw
      dataBind(data) {
        return this.selectAll("rect")
          .data(data, d => d.time);
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
          .data(data, d => d.time);
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