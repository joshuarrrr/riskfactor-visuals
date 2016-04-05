/*global d3, pym, ga */

"use strict";
class KotoBarChart extends Koto {
  constructor(selection) {
    super(selection);

    // Setup
    var chart = this;

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
      }
    };

    // Scales
    this.x = d3.scale.linear()
      .range([0, this.config("width")]);

    this.y = d3.scale.linear()
      .domain([0, 100])
      .rangeRound([0, this.config("height")]);

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
  }
}