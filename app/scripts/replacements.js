d3.chart("BaseChart", {
  // handles sizing and margins for charts
  initialize: function() {

    // setup some reasonable defaults
    this._margin = {top: 20, right: 20, bottom: 20, left: 20};
    this._width  = this.base.attr("width") ? this.base.attr("width") - this._margin.left - this._margin.right : 200;
    this._height = this.base.attr("height") ? this.base.attr("height") - this._margin.top - this._margin.bottom : 200;

    this.base.append("g");

    // make sure container height and width are set.
    
    this.updateContainerWidth();
    this.updateContainerHeight();
    this.updateMargins();
    
    // non data driven areas (as in not to be independatly drawn)
    this.areas = {};

    // cache for selections that are layer bases.
    this.layers = {};
  },

  updateContainerWidth: function() { this.base.attr("width", this._width + this._margin.left + this._margin.right); },

  updateContainerHeight: function() { this.base.attr("height", this._height + this._margin.top + this._margin.bottom); },

  // Adjust the margins
  updateMargins: function () { 
    this.base.select("g").attr("transform", "translate(" + this._margin.left + "," + this._margin.top + ")"); 
    this.updateContainerWidth();
    this.updateContainerHeight();
  },

  width: function(newWidth) {
    if (arguments.length === 0) {
      return this._width;
    }

    // only if the width actually changed:
    if (this._width !== newWidth) {

      var oldWidth = this._width;

      this._width = newWidth;

      // set higher container width
      this.updateContainerWidth();

      // trigger a change event
      this.trigger("change:width", newWidth, oldWidth);
    }

    // always return the chart, for chaining magic.
    return this;
  },

  height: function(newHeight) {
    if (arguments.length === 0) {
      console.log("return height");
      console.log(this._height);
      return this._height;
    }

    var oldHeight = this._height;

    this._height = newHeight;

    if (this._height !== oldHeight) {

      this.updateContainerHeight();

      this.trigger("change:height", newHeight, oldHeight);
    }

    return this;
  },

  margin: function(newMargin) {
    if (arguments.length === 0) {
      return this._margin;
    }

    var oldMargin = this._margin;

    this._margin = newMargin;

    if (this._margin !== oldMargin) {

      this.updateContainerHeight();
      this.updateContainerWidth();
      this.updateMargins();

      this.trigger("change:margin", newMargin, oldMargin);
    }

    return this;
  }
});

d3.chart("BaseChart").extend("SystemsChart", {
    
    modes: {
      mobile : function() {
        return Modernizr.mq("only all and (max-width: 480px)");
      },
      tablet: function() {
        return Modernizr.mq("only all and (min-width: 481px) and (max-width: 768px)");
      },
      web: function() {
        return Modernizr.mq("only all and (min-width: 769px)");
      }
    },

    initialize: function() {

      var chart = this;
      var areas = {};

      var yAxisBase = chart.base.select("g").append("g")
        .classed("axes", true);

      var xAxisBase = chart.base.select("g").append("g")
        .classed("axes", true);

      var datapointBase = chart.base.select("g").append("g")
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
      this.layer("x-axis", xAxisBase, {
        modes : ["web", "tablet"],
        dataBind: function(data) {
          var chart = this.chart();

          return this.selectAll(".x")
            .data([data]);
        },

        // insert area 1
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
              .ticks(5)
              .outerTickSize(0);

            selection.append("g")
            .attr("class", "x axis-label")
            .append("text")
              .attr("y", 0)
              .attr("x", chart.width() / 2)
              .attr("dy", "3em")
              .attr("dx", "0")
              .text("Number of Legacy Systems to Replace")
              .attr("text-anchor", "middle");

            chart.base.select(".x.axis")
            .transition()
              .duration(300)
              .call(xAxis);

            return selection;
          }
        }

      });

      this.layer("y-axis", yAxisBase, {
        modes : ["web", "tablet"],
        dataBind: function(data) {
          var chart = this.chart();

          return this.selectAll(".y")
            .data([data]);
        },

        // insert area 1
        insert: function() {
          var chart = this.chart();
          var selection = this.append("g")
            .attr("class", "y axis");

          return selection;
        },

        events: {
          "merge" : function() {
            var chart = this.chart();
            var selection = this;

            selection.append("g")
              .attr("class", "y axis-label")
              .append("text")
                .attr("y", 0)
                .attr("x",0)
                .attr("dy", ".3em")
                .attr("dx", ".3em")
                .text("Cost, US$");

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

      // create a layer of circles that will go into
      // a new group element on the base of the chart
      this.layer("circles", datapointBase, {

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

            selection.append("line")
              .attr("x1", function(d) {
                return chart.xScale(d.milestones[0].systems_to_replace);
              })
              .attr("y1", function(d) {
                var systems;
                if ( d.milestones[0].cost !== null ) {
                  return chart.yScale(d.milestones[0].cost);
                }
                else {
                  return chart.yScale(d.milestones[1].cost);
                }
              })
              .attr("x2", function(d) {
                return chart.xScale(d.milestones[0].systems_to_replace);
              })
              .attr("y2", function(d) {
                var systems;
                if ( d.milestones[0].cost !== null ) {
                  return chart.yScale(d.milestones[0].cost);
                }
                else {
                  return chart.yScale(d.milestones[1].cost);
                }
              })
              .attr("class", "line")
              .attr("stroke", "black")
              .attr("stroke-width", 0)

            selection.append("circle")
              .attr("cx", function(d) {
                console.log(d.milestones[1].systems_to_replace);
                console.log(chart.xScale(0));
                return chart.xScale(d.milestones[1].systems_to_replace);
              })
              .attr("cy", function(d) {
                var systems;
                if ( d.milestones[1].cost !== null ) {
                  return chart.yScale(d.milestones[1].cost);
                }
                else {
                  return chart.yScale(d.milestones[0].cost);
                }
              })
              .attr("r", 0)
              .attr("class", function(d) { return d.milestones[1].milestone; })
              .style("fill", "red");


            selection.append("circle")
              .attr("cx", function(d) {
                return chart.xScale(d.milestones[0].systems_to_replace);
              })
              .attr("cy", function(d) {
                var systems;
                if ( d.milestones[0].cost !== null ) {
                  return chart.yScale(d.milestones[0].cost);
                }
                else {
                  return chart.yScale(d.milestones[1].cost);
                }
              })
              .attr("r", 0)
              .attr("class", function(d) { return d.milestones[0].milestone; })
              .style("fill", "green");

            

            // add a mouseover listener to our circles
            // and change their color and broadcast a chart
            // brush event to any listeners.
            this.on("mouseover", function() {
              var el = d3.select(this);
              el.selectAll("circle.complete")
                .style("stroke", function(d) { 
                if (d.milestones[1].systems_to_replace === 0 || null && this.classed("start")) {
                  return "none";
                }
                else {
                  return "gray";
                }
              })
                .style("stroke-width", "3")
                .attr("r", function(d) { 
                if (d.milestones[1].systems_to_replace === 0 || null) {
                  return 0;
                }
                else {
                  return 8;
                }
              });

              el.selectAll("circle.start")
                .style("stroke", "gray")
                .style("stroke-width", "3")
                .attr("r", 8);

              el.selectAll("line")
                .style("stroke", "gray")
                .style("stroke-width", "3");

              el
                .append("g")
                  .attr("class","tt")
                .append("text")
                  .attr("y", function(d) { return chart.yScale(d.milestones[1].cost); })
                  .attr("x", function(d) { return chart.xScale(d.milestones[0].systems_to_replace); })
                  .attr("dy", "-.5em")
                  .attr("dx", ".5em")
                  .attr("class", "ttText")
                  .text(function(d) { return d.project; });

              var ttText = d3.select("text.ttText");
              if (ttText.attr("x") > chart.width() * .8 ) {
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

              el.selectAll("line")
                .style("stroke", "black")
                .style("stroke-width", "2");

              var el = d3.select(this);
              el.select(".tt").remove();

              chart.trigger("unbrush", this);
            });

          },
          // then transition them to a radius of 5 and change
          // their fill to blue
          "enter:transition": function() {
            var chart = this.chart();
            this.selectAll("circle.start").delay(500)
              .attr("r", 5);

            this.selectAll("line.line").delay(500)
              .attr("stroke-width", 2)
              .attr("marker-end", "")
            .transition().duration(1000)
              .attr("x2", function(d) {
                return chart.xScale(d.milestones[1].systems_to_replace);
              })
              .attr("y2", function(d) {
                var systems;
                if ( d.milestones[1].cost !== null ) {
                  return chart.yScale(d.milestones[1].cost);
                }
                else {
                  return chart.yScale(d.milestones[0].cost);
                }
              })
              .transition()
              .attr("marker-end", function(d) {
                if (d.milestones[1].systems_to_replace === 0 || null) {
                  return "url(#markerExplode)";
                }
                else{
                  return "";
                }
              });


            this.selectAll("circle.complete").delay(1500)
              .attr("r", 5);

          }
        }
      });

      // // create a layer of circles that will go into
      // // a new group element on the base of the chart
      // this.layer("tooltip", this.base.append("g"), {

      //   // select the elements we wish to bind to and
      //   // bind the data to them.
      //   dataBind: function(data) {
      //     return this.selectAll(".tt")
      //       .data(data);
      //   },

      //   // insert actual circles
      //   insert: function() {
      //     return this.append("g");
      //   },

      //   // define lifecycle events
      //   events: {

      //     // paint new elements, but set their radius to 0
      //     // and make them red
      //     "enter": function() {
      //       var chart = this.chart();
      //       var selection = this;

      //       selection
      //         .attr("class","tt")
      //         .attr("transform", function(d) {
      //           return "translate(" +
      //           chart.xScale(d.milestones[0].systems_to_replace)  + 
      //           "," +
      //           chart.yScale(d.milestones[1].cost) + 
      //           ")";
      //         })

      //       selection
      //         .append("text")
      //           .attr("y", 0)
      //           .attr("x",0)
      //           .attr("dy", "-.5em")
      //           .attr("dx", ".5em")
      //           .attr("class", "ttText hidden")
      //           .text(function(d) { return d.project; });
      //     }
      //   }
      // });

      // // add area layer 1
      // this.layer("totarea", areaBase1, {
      //   modes : ["web", "tablet"],
      //   dataBind: function(data) {
      //     var chart = this.chart();


      //     // var lineSvg = chart.base.select("g").append("g");

      //     // var focus = chart.base.select("g").append("g")
      //     //   .style("display", "none");

      //     // // append the tooltip at the intersection 
      //     // focus.append("path")
      //     //   .attr("class", "tooltip x-line")
      //     //   .style("fill", "none")
      //     //   .style("stroke-width", "2")
      //     //   .style("stroke", "black");

      //     // focus.append("path")
      //     //   .attr("class", "tooltip pointer")
      //     //   .style("fill", "none")
      //     //   .style("stroke-width", "2")
      //     //   .style("stroke", "black");

      //     // focus.append("rect")
      //     //   .attr("class", "tt-bg");

      //     // var ttText = focus.append("text")
      //     //   .attr("class", "tooltip text")
      //     //   .attr("text-anchor", "middle");
            
      //     // ttText.append("tspan")
      //     //       .attr("class", "tt-text1")
      //     //       .attr("x", 0)
      //     //       .attr("y", "1.4em")
      //     // ttText.append("tspan")
      //     //       .attr("class", "tt-text2")
      //     //       .attr("x", 0)
      //     //       .attr("y", "2.8em")
      //     // ttText.append("tspan")
      //     //       .attr("class", "tt-text3")
      //     //       .attr("x", 0)
      //     //       .attr("y", "4.2em")
      //     // ttText.append("tspan")
      //     //       .attr("class", "tt-text4")
      //     //       .attr("x", 0)
      //     //       .attr("y", "5.6em")
      //     // ttText.append("tspan")
      //     //       .attr("class", "tt-text5")
      //     //       .attr("x", 0)
      //     //       .attr("y", "7.0em")

      //     // // focus.append("circle")
      //     // //   .attr("class", "tooltip circle")
      //     // //   .style("fill", "none")
      //     // //   .style("stroke", "red")
      //     // //   .attr("r", 4);
        
      //     // // append the rectangle to capture mouse
      //     // chart.base.select("g").append("rect")
      //     //   .attr("width", chart.width())
      //     //   .attr("height", chart.height())
      //     //   .style("fill", "none")
      //     //   .style("pointer-events", "all")
      //     //   .on("mouseover", function() { focus.style("display", null); })
      //     //   .on("mouseout", function() { focus.style("display", "none"); })
      //     //   .on("mousemove", mousemove);

      //     // function mousemove() {
      //     //   var x0 = chart.xScale.invert(d3.mouse(this)[0]),
      //     //     i = bisectDate(data, x0, 1),
      //     //     d0 = data[i - 1],
      //     //     d1 = data[i],
      //     //     d = x0 - d0.dateObject > d1.dateObject - x0 ? d1 : d0;

      //     //   console.log(i);

      //     //   // focus.select("circle.circle")
      //     //   //   .attr("transform",
      //     //   //     "translate(" + chart.xScale(d.dateObject) + "," +
      //     //   //                    chart.yScale(d.spentMillions) + ")");

      //     //   focus.select("path.x-line")
      //     //     .attr("transform",
      //     //       "translate(" + chart.xScale(d.dateObject) + ",0)")
      //     //     .attr("d", "M 0 " + chart.height() +" L 0 " + chart.yScale(d.totMillions));

      //     //   focus.select("path.pointer")
      //     //     .attr("transform",
      //     //       "translate(" + chart.xScale(d.dateObject) + ",0)")
      //     //     .attr("d", "M 0 " + chart.yScale(d.totMillions) +
      //     //                 " L " + ((chart.width() / 2) - chart.xScale(d.dateObject)) +
      //     //                 " " + (chart.height() / 5));

      //     //   focus.select(".tt-bg")
      //     //     .attr("transform", "translate(" + chart.width() / 2 + ",0)")
      //     //     .attr("width", chart.width() / 3.3)
      //     //     .attr("height", function() { return d.notes === "" ? "6.6em" : "8.0em" })
      //     //     .attr("x", - chart.width() / 3.3 / 2)
      //     //     .attr("y", 0)
      //     //     .style("fill", "white")
      //     //     .style("stroke", "black")
      //     //     .style("stroke-width", "2");

      //     //   ttText
      //     //     .attr("transform",
      //     //       "translate(" + (chart.width() / 2) + ",0)")
      //     //     .attr("x", 0)
      //     //     .attr("y", 0);

      //     //   ttText.select("tspan.tt-text1")
      //     //       .text("Project Update: " + d.date);
      //     //   ttText.select("tspan.tt-text2")
      //     //       .text("Spent so far (US$ Millions): " + d.spentMillions)
      //     //   ttText.select("tspan.tt-text3")
      //     //       .text("Estimated development cost: " + d.estMillions)
      //     //   ttText.select("tspan.tt-text4")
      //     //       .text("Estimated total lifecycle cost: " + d.totMillions)
      //     //   ttText.select("tspan.tt-text5")
      //     //       .text(d.notes);
      //     // }

      //     return this.selectAll("g")
      //       .data(data);
      //     // var segment = function(d) { return d.totProjection; };

      //     // return this.selectAll("g")
      //     //     .data(data)
      //     //   .enter().append("g").selectAll("path")
      //     //     .data(function(d) { return [d.totProjection]; });
                
      //   },

      //   // insert area 1
      //   insert: function() {
      //     var chart = this.chart();
      //     var selection = this.append("g");
      //     return selection;
      //   },

      //   events: {
      //     "merge" : function() {
      //       var chart = this.chart();
      //       var selection = this;
      //       var area1 = d3.svg.area()
      //         .x(function(d) { console.log(d.x); return chart.xScale(d.x); })
      //         .y0(function(d) { return chart.yScale(d.y0); })
      //         .y1(function(d) { return chart.yScale(d.y1); }); 

      //       var area2 = d3.svg.area()
      //         .x(function(d) { console.log(d.x); return chart.xScale(d.x); })
      //         .y0(function(d) { return chart.yScale(d.y0); })
      //         .y1(function(d) { return chart.yScale(d.y2); });           

      //       console.log(selection);

      //       selection.selectAll("path.total")
      //         .data(function(d) { console.log(d); return [d.projection]; })
      //         .attr("d", area2)
      //       .enter()
      //         .append("path")
      //         .attr("class", "area total")
      //         .transition().delay(300)
      //         .attr("d", area2)
      //         .style("stroke", "none");

      //       selection.selectAll("path.dev")
      //         .data(function(d) { console.log(d); return [d.projection]; })
      //         .attr("d", area1)
      //       .enter()
      //         .append("path")
      //         .style("stroke", "none")
      //         .attr("class", "area dev")
      //         .transition().delay(300).duration(300)
      //         .attr("d", area1);
          
      //       // function pathTween() {
      //       //   var interpolate = d3.scale.quantile()
      //       //     .domain([0,1])
      //       //     .range(d3.range(1, data.length + 1));
      //       //   return function(t) {
      //       //     return area1(data.slice(0, interpolate(t)));
      //       //   };
      //       // }

      //       // selection
      //       //   .attr("class", "area total")
      //       //   .attr("d", function(d) {
      //       //     return "M " +
      //       //     chart.xScale(d.dateObject) +
      //       //     " " +
      //       //     chart.yScale(d.spentMillions) +
      //       //     " L " + 
      //       //     chart.xScale(d.schedObject) + 
      //       //     " " + 
      //       //     chart.yScale(d.totMillions) +
      //       //     " V " +
      //       //     chart.yScale(d.spentMillions) + 
      //       //     " Z ";
      //       //   });
      //       // .transition()
      //       //   .duration(2000)
      //       //   .attrTween("d", pathTween);
          
      //       // function pathTween() {
      //       //   var interpolate = d3.scale.quantile()
      //       //     .domain([0,1])
      //       //     .range(d3.range(1, data.length + 1));
      //       //   return function(t) {
      //       //     return area(data.slice(0, interpolate(t)));
      //       //   };
      //       // }
      

      //       return selection;
      //     },

      //     "exit" : function() {
      //       this.remove();
      //     }
      //   }

      // });



      // // add line layer 1
      // this.layer("totline", lineBase1, {
      //   modes : ["web", "tablet"],
      //   dataBind: function(data) {
      //     var chart = this.chart();

      //     return this.selectAll("path.line")
      //       .data([data]);
                
      //   },

      //   // insert line 1
      //    insert: function() {
      //     var chart = this.chart();
      //     var selection = this.append("path");

      //     return selection;
      //   },

      //   events: {
      //     "merge" : function() {
      //       var chart = this.chart();
      //       var selection = this;
      //       var line = d3.svg.line()
      //         .x(function(d) {
      //           return chart.xScale(d.dateObject);
      //         })
      //         .y(function(d) {
      //           return chart.yScale(d.totMillions);
      //         })
      //         .interpolate("linear");

      //       selection
      //         .style("fill", "none")
      //         .style("opacity", ".7")
      //         .style("stroke-width", "2")
      //         .style("stroke", "black");

      //       selection
      //         .attr("class", "line")
      //         .attr("d", line)    
      //       .transition()
      //         .duration(2000)
      //         .attrTween("d", pathTween);
          
      //       function pathTween() {
      //         var interpolate = d3.scale.quantile()
      //           .domain([0,1])
      //           .range(d3.range(1, data.length + 1));
      //         return function(t) {
      //           return line(data.slice(0, interpolate(t)));
      //         };
      //       }
              

      //       return selection;
      //     }
      //   }

      // });

    },

    transform: function(data) {
      var chart = this;

      var format = d3.time.format("%B 20%y");
      var formatString = d3.time.format("%-d-%b-%Y");
      var bisectDate = d3.bisector(function(d) { return d.dateObject; }).left; 

      chart.data = data;

      data.forEach(function(d) {

        if ( d.cost_unit === "C$" ) {
          console.log("Canadian $!");
          for (i in d.milestones) {
            console.log(i);
            if (d.milestones[i].cost !== null) {
              d.milestones[i].cost = d.milestones[i].cost * .9;
            }
          }
        }

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
      });

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
      chart.xScale.domain([0,d3.max(data, function (d) { 
          var maxSystems = d.milestones.reduce(function (a,b) {
            return {"systems": d3.max([a.systems_to_replace,b.systems_to_replace])};
          });
          return maxSystems.systems;
        })])
        .nice();

      //update y scale domain
      chart.yScale.domain([0,d3.max(data, function (d) { 
          var maxCost = d.milestones.reduce(function (a,b) {
            return {"cost": d3.max([a.cost,b.cost])};
          });
          return maxCost.cost;
        })])
        .nice(6);

      return data;
    },

});

var data = d3.json("../systems.json", function (data) {

  var title = d3.select("#chart-title")
    .text("Project Complexity and Cost");

  console.log(data)

  var systems = d3.select("#chart")
    .append("svg")
    .chart("SystemsChart")
    .width(760)
    .height(300)
    .margin({top: 20, bottom: 70, right: 90, left: 90});


  systems.draw(data);
});

function wrap(text, width) {
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
    while (word = words.pop()) {
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