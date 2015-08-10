/*global d3, pym, Isotope, Modernizr, ga */

d3.csv("data/timeline.csv", function (data) {
  "use strict";

  console.log(data);
  var container = d3.select("#chart");
  var width = container.node().parentNode.offsetWidth;

  var format = d3.time.format("%B 20%y");
  var formatString = d3.time.format.iso;

  var gaDatapointsClicked = 0;

  data = data.filter(function (d) {
    if (d.Theme.indexOf("project termination/cancellation") !== -1 ) {
        return d;
      } 
  });

  console.log(data);

  data.forEach(function(d) {
    d.dateOriginal = d.date;
    d.formattedDate = formatString.parse(d.date);
    d.dateObject = new Date(d.date);
    d.date = format(d.dateObject);
    d.month = d.dateObject.getMonth();

    //coerce to number
    if (d["Impact - USD"] === null) {
      d["Impact - USD"] = 0;
    }
    else {
      d["Impact - USD"] = +d["Impact - USD"];
    }
    

    // d.impact_qty = (parseInt(d.impact_qty) > 0) ? parseInt(d.impact_qty) : 0;
  });

  // data.sort(function(a,b) {
  //     return b["Impact - Qty"] - a["Impact - Qty"];
  //   });

  data.sort(function(a,b){return a.dateObject.getTime() - b.dateObject.getTime();});

  console.log(data);

  var isMobile = /ip(hone|od|ad)|android|blackberry.*applewebkit|bb1\d.*mobile/i.test(navigator.userAgent);

  var maxSize = isMobile && Modernizr.mq("only all and (max-width: 480px)") ? width - 10 : 610;
  var ttWidth = isMobile && Modernizr.mq("only all and (max-width: 480px)") ? (width - 40 - 4 - 20) : 300; 

  var sizer = d3.scale.sqrt()
    .range([0, maxSize])
    .domain([0,d3.max(data, function(d) { return d["Impact - USD"]; })]);

  var fontScale = d3.scale.sqrt()
    .range([0, maxSize / 5.1])
    .domain([0,d3.max(data, function(d) { return d["Impact - USD"]; })]);

  // var linFontScale = d3.scale.linear()
  //   .range([0, 120])
  //   .domain([0,d3.max(data, function(d) { return d["Impact - Qty"]; })]);

  // container
  //   .style("background", "url(\"images/GrassGreenTexture0003.jpg\")")
  //   .style("background-size", "100% 20%");

  var projects = container.selectAll("div")
    .data(data)
  .enter().append("div")
    .attr("class", "cancelled-project")
    .style("margin", "5px")
    .style("width", function(d) { return sizer(d["Impact - USD"]) + "px"; })
    .style("height", function(d) { return sizer(d["Impact - USD"]) + "px"; })
    // .style("background", "url(\"images/cgbug_Halloween_Rounded_Tombstone.svg\")")
    // .style("background-size", "100% 100%")
    // .style("background-repeat", "no-repeat")
    // .style("background-position", "center")
    .style("text-align", "center");

  projects.filter(function(d) { return d["Impact - USD"] >= 2e+7; })
    .append("h3")
    .style("font-size", function (d) { return fontScale(d["Impact - USD"]) + "px"; })
    .style("position", "relative")
    .style("line-height", "1em")
    .style("left", "5%")
    .style("width", "70%")
    .style("margin", ".5em auto 0")
    // .style("margin", function (d) {
    //   return (sizer(d["Impact - Qty"]) * 0.25) + "px 0 0 30%"; })
    .text(function (d) { return formatMoney(d["Impact - Qty"],d["Currency Symbol"]); });


    
  // $("#chart").isotope({
  //   // options
  //   itemSelector: ".cancelled-project",
  //   layoutMode: "packery"
  // });

  projects.on("click", function() {
    var selection = d3.select(this);
    var datum = selection.datum();

    var gaEventLabel = "graveyard-" + datum.Headline;

    ga("send", "event", "datapoint", "click", gaEventLabel, gaDatapointsClicked);
    gaDatapointsClicked++;

    container.select(".tooltip").remove();

    var el = container.append("div")
      .attr("class", "tooltip")
      .style("width", ttWidth + "px")
      .style("position", "absolute")
      .style("padding", "20px")
      // .style("top", "200px")
      // .style("left", "50%")
      // .style("transform", "translate(-50%, 0)")
      .style("top", function () {
        var top = selection.style("top");
        var height = container.style("height");
        console.log(top);
        console.log(height);

        if (parseInt(height, 10) - parseInt(top, 10) < 300) {
          console.log("move it!");
          return (parseInt(top, 10) - 300) + "px";
        }
        else {
          return top;
        }
      }) 
      .style("left", ((width - ttWidth - 40 - 4) / 2) + "px")
      // .style("left", function() { 
      //   var position = selection.style("left").replace("px","");
      //   console.log(position);
      //   position = +position;
      //   if (position < 150) {
      //     return "0";
      //   }
      //   else if (150<=position<620-150) {
      //     return (position - 150) + "px";
      //   }
      //   else {
      //     return "320px";
      //   }
      //   // return position < 310 ? (position + "px" : (position - 300) + "px";
      // })
      .style("background", "rgba(255,255,255,.8)")
      .style("border", "2px #ddd solid");

    el.append("time")
      .attr("class", "date")
      .text(datum.date);

    el.append("h3")
      .append("a")
        .attr("href", datum.url)
        .attr("target", "_blank")
        .text(datum.Headline);

    el.append("p")
      .text(formatMoney(datum["Impact - Qty"],datum["Currency Symbol"]));

    el.on("click", function() {  
      this.remove();
    });

  });


  isofy();

  function isofy () {
    // element argument can be a selector string
    //   for an individual element
    return new Isotope( "#chart", {
      // options
      // isInitLayout: false,
      itemSelector: ".cancelled-project",
      layoutMode: "masonry"
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

  var pymChild = new pym.Child();
  pymChild.sendHeight();

});
