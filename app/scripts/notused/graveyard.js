/*global d3, pym, Isotope, Modernizr, ga */

d3.csv("data/timeline.csv", function (data) {
  "use strict";

  // console.log(data);
  var container = d3.select("#chart");
  var width = container.node().parentNode.offsetWidth;

  var format = d3.time.format("%B 20%y");
  var shortFormat = d3.time.format("%b 20%y");
  var formatString = d3.time.format.iso;

  var gaDatapointsClicked = 0;

  data = data.filter(function (d) {
    if (d.Theme.indexOf("termination/cancellation") !== -1 ) {
        return d;
      } 
  });

  // console.log(data);

  var total = 0;

  data.forEach(function(d) {
    d.dateOriginal = d.date;
    d.formattedDate = formatString.parse(d.date);
    d.dateObject = new Date(d.date);
    d.date = format(d.dateObject);
    d.shortDate = shortFormat(d.dateObject);
    d.month = d.dateObject.getMonth();

    d.displayCurrency = d["Impact - Currency"] === "CAD" || d["Impact - Currency"] === "AUD" ? d["Impact - Currency"].slice(0,2) + "&nbsp;" + d["Currency Symbol"] : d["Currency Symbol"];
    //coerce to number
    if (d["Impact - USD"] === null) {
      d["Impact - USD"] = 0;
    }
    else {
      d["Impact - USD"] = +d["Impact - USD"];
    }

    total += d["Impact - USD"];
    
  });

  // console.log(formatMoney(total,"$"));

  // data.sort(function(a,b) {
  //     return b["Impact - Qty"] - a["Impact - Qty"];
  //   });

  data.sort(function(a,b){return a.dateObject.getTime() - b.dateObject.getTime();});

  // console.log(data);

  var buckets = [1e+7,1e+8,1e+9,1e+10,1e+11];
  var reverseBuckets = buckets.slice(0).reverse();
  // reverseBuckets.reverse();

  var isMobile = /ip(hone|od|ad)|android|blackberry.*applewebkit|bb1\d.*mobile/i.test(navigator.userAgent);

  if (isMobile) {
    d3.select("body").classed("mobile-view", true);

    width = window.parent.document.body.clientWidth;
  }

  var gutter = 20;
  var columnWidth = isMobile && Modernizr.mq("only all and (max-width: 480px)") ? ((width - (2 * gutter)) / 3 ) : 60; 
  var graveWidth = isMobile && Modernizr.mq("only all and (max-width: 480px)") ? columnWidth : (2 * columnWidth) + gutter; 
  var ttWidth = isMobile && Modernizr.mq("only all and (max-width: 480px)") ? ((columnWidth * 2) + gutter) : 220; 


  var sizerh = d3.scale.threshold()
    .range([1,2,3,4,5])
    .domain(buckets);

  var legend = d3.select("#legend")
    .style("border-right", width - columnWidth - gutter < 300 ? "0" : "2px solid #ddd")
    .style("width", width - columnWidth - gutter < 300 ? "100%" : "300px");

  var legendItems = legend.append("div")
    .classed("legend-graphic", true)
    .selectAll(".legend-project")
    .data(reverseBuckets)
  .enter().append("div")
    .attr("class", function (d) {
      return "failure-size-" + sizerh(d / 10) + " legend-project";
    });

  legendItems.append("div")
    .classed("legend-text", true)
    .text(function (d) { return formatMoney(d / 10,"US $"); })
    .style("top", function (d) { return (((reverseBuckets.length + 0 - sizerh(d / 10)) * 22.5) + 2) + "px"; });

  legendItems.append("div")
    .classed("legend-line", true)
    .style("top", function (d) { return (((reverseBuckets.length + 0 - sizerh(d / 10)) * 22.5) + 19) + "px"; })
    .style("width", function (d) { 
      var startingWidth = 307.5;

      if ( width - columnWidth - gutter < 300 ) {
        startingWidth = width + 7.5;
      }
      return (startingWidth - (45 * (reverseBuckets.length + 1 - sizerh(d / 10)))) + "px"; 
    });

  legend.append("h3")
    .text("before cancellation");

  var projects = container.selectAll("div")
    .data(data)
  .enter().append("div")
    .attr("class", function (d) {
      return "failure-size-" + sizerh(d["Impact - USD"]) + " cancelled-project";
    })
    .style("width", graveWidth + "px")
    .style("height", function(d) { return (sizerh(d["Impact - USD"]) * graveWidth * ( 90/140 )) + "px"; });

  projects
    .append("div")
    .attr("class", "rip")
    .text("R.I.P.");

  projects
    .append("div")
    .attr("class", "death-date")
    .text(function (d) { return d.shortDate; });

  projects
    .append("h3")
    .html(function (d) { 
      var cost = "<div class=\"cost\">" + formatMoney(d["Impact - Qty"],d.displayCurrency) + "</div>";
      var size = sizerh(d["Impact - USD"]);

      if ( isMobile ) {
        return cost;
      }
      if ( size > 2 && size < 5 ) {
        return "Here lies" + cost + "of wasted spending";
      }
      else if ( size === 5 ) {
        return "Here lies" + cost + "wasted";
      }
      else if ( size === 2 ) {
        return cost + "wasted";
      }
      else {
        return cost;
      }
      
    });

  projects.on("click", function(d,i) {
    updateToolTip(d, i, d3.select(this));
  });


  isofy();

  function updateToolTip (datum, i, selection) {
    // var selection = d3.select(selection);
    // var datum = d;

    var gaEventLabel = "graveyard-" + datum.Headline;

    // console.log(i);
    // console.log(datum);
    // console.log(selection);

    ga("send", "event", "datapoint", "click", gaEventLabel, gaDatapointsClicked);
    gaDatapointsClicked++;

    container.select(".tooltip").remove();

    projects
      .classed("selected", false);

    selection
      .classed("selected", true);

    var el = container.append("div")
      .attr("class", "tooltip")
      .style("width", ttWidth + "px")
      .style("top", function () {
        var top = selection.style("top");
        var height = container.style("height");
        // console.log(top);
        // console.log(height);

        
        if (parseInt(height, 10) - parseInt(top, 10) < 500) {
          // console.log("move it!");
          // return (parseInt(top, 10) - 300) + "px";
          return null;
        }
        else if ( isMobile && Modernizr.mq("only all and (max-width: 620px)") ) {
          return (parseInt(top, 10) + (parseInt(selection.style("height"),10) / 2)) + "px"; 
        }
        else {
          return top;
        }
      })
      .style("bottom", function () {
        var top = selection.style("top");
        var height = container.style("height");
        // console.log(top);
        // console.log(height);

        if (parseInt(height, 10) - parseInt(top, 10) < 500) {
          // console.log("move it!");
          // return (parseInt(top, 10) - 300) + "px";
          return 0;
        }
        else {
          return null;
        }
      }) 
      .style("left", function() {
        // ((width - ttWidth - 40 - 4) / 2) + "px")
        var gravePosition = +selection.style("left").slice(0,-2);
        // console.log(gravePosition);
        if ( isMobile && Modernizr.mq("only all and (max-width: 620px)") ) {
          return ((width - ttWidth - 40) / 2) + "px";
        }
        else if ( gravePosition < width / 2 ) {
          return (gravePosition + 140) + "px";
        }
        else {
          return (gravePosition - ttWidth - 40) + "px";
        }
      });

    // var timeContainer = el.append("div")
    //         .classed("times", true);

    // var prev = timeContainer.append("a")
    //   .attr("class", "prev button")
    //   .classed("hidden", i === 0)
    //   .html("◂&nbsp;Earlier");

    // timeContainer.append("time")
    //   .attr("class", "date")
    //   .html(datum.date);

    // var next = timeContainer.append("a")
    //   .attr("class", "next button")
    //   .classed("hidden", i === data.length - 1 )
    //   .html("Later&nbsp;▸");

    el.append("time")
      .attr("class", "date")
      .text(datum.date);

    el.append("div")
      .classed("close", true)
      .html("&times;");

    el.append("h3")
      .append("a")
        .attr("href", datum.url)
        .attr("target", "_blank")
        .text(datum.Headline);

    el.append("p")
      .text(datum["Impact - Raw"]);

    // var links = summary.selectAll(".readmore")
    //   .data(datum.url.split("; "));

    // summary.append("br").attr("class", "sources hidden");

    // summary.append("span").attr("class", "sources hidden").text("Read More:");

    // links.enter().append("a")
    //   .attr("class", "readmore")
    //   .attr("href", function(d) { return d; })
    //   .attr("target", "_blank")
    //   .html(function(d,i) {
    //     if ( links.size() === 1 ) {
    //       summary.selectAll(".sources").classed("hidden", true);
    //       return "Read&nbsp;More";
    //     }
    //     else {
    //       summary.selectAll(".sources").classed("hidden", false);
    //       return "["+ (i + 1) +"]";
    //     }
    //   });

    if ( datum["Impact - Currency"] !== "USD" ) {
      el.append("p")
        .classed("currency-conversion", true)
        .text("(" + formatMoney(datum["Impact - USD"], "US $") + ")");
    }

    if ( isMobile && Modernizr.mq("only all and (max-width: 620px)") ) {
      selection.node().scrollIntoView();
    } 

    // el.append("p")
    //   .text(formatMoney(datum["Impact - Qty"],datum["Currency Symbol"]) + " spent before cancellation");

    // prev.on("click", function() {
    //   updateToolTip(data[i-1], i-1, d3.select(projects[0][i-1]));
    // });

    // next.on("click", function() {
    //   updateToolTip(data[i+1], i+1, d3.select(projects[0][i+1]));
    // });

    el.on("click", function() {  
      this.remove();
    });
  }

  function isofy () {
    // element argument can be a selector string
    //   for an individual element
    return new Isotope( "#chart", {
      // options
      // isInitLayout: false,
      itemSelector: ".cancelled-project, .legend",
      masonry: {
        columnWidth: columnWidth,
        gutter: gutter
      }
      // layoutMode: "fitRows",
      // fitRows: {
      //   gutter: 20
      // }
    });
  }

  function formatMoney (amount, currency) {
    var formatted = currency ? currency : "";
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
      formatted += amount;
    }

    return formatted;
  }

  var pymChild = new pym.Child();
  pymChild.sendHeight();

  // window.parent.onorientationchange = function() { console.log("change"); window.location.reload(); };

});
