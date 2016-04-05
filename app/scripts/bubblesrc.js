/*global d3, pym, ga */
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
  var container = d3.select("#modernization-chart");
  var parWidth = container.node().parentNode.offsetWidth; // dynamically calc width of parent contatiner
  var margins = {top: 65, bottom: 50, right: 20, left: 20};
  var width = parWidth - margins.left - margins.right;
  var height = width * 1 / 3;
  var format, formatString;

  // add non-SVG container elements
  var infoBox = container.append("div")
    .attr("class","info-box timeline-chart");

  var selectors = container.append("div")
    .attr("class","selectors");

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

  // // initialize main chart    
  // var bubbles = container
  //   .append("svg")
  //   .attr("class", "")
  //   .attr("id", "chart-svg")
  //   .chart("MarginChart")
  //   .width(width)
  //   .height(height)
  //   .margin(margins)
  //   .dateParse("iso")
  //   .dateDisplay("%B 20%y")
  //   .yData("Region")
  //   .duration(300);

  var dateDisplay = d3.time.format("%B 20%y");
  // var yData = "Region";
  // var duration = 300;
  var dateParse = d3.time.format.iso;

  var bubbles = container
    .append("svg")
    .attr("class", "")
    .attr("id", "chart-svg")
    .attr("width", parWidth + "px")
    .attr("height", height + margins.top + margins.bottom + "px")    
    .append("g").attr("transform", "translate(" + margins.left + "," + margins.top + ")");


  bubbles.quantities = quantities;
  bubbles.sortables = categories;

  format = dateDisplay;
  formatString = dateParse;

  var dataMax = d3.max(data, (d) => +d["Impact - USD"]);

  // Process Data
  data.forEach(function(d) {
    d.dateOriginal = d.date;
    d.formattedDate = formatString.parse(d.date);
    d.dateObject = new Date(d.date);
    d.date = format(d.dateObject);
    d.month = d.dateObject.getMonth();

    // TEST: For bar chart only
    d.time = d.month;
    d.value = +d["Impact - USD"];
    d.value = (d.value === 0) ? 0 : d.value * 100 / dataMax;

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
    // TEST: For bar chart only
    d.time = d.dateIndex;
    // d.value = +d["Impact - USD"];
  });

  bubbles.on("selection change", function() {
      // console.log("The element ", d, "was selected");
      pymChild.sendHeight();
    });

  // TEST: Bar Chart
  var barChart = new KotoBarChart(container.select("#chart-svg>g"));
  // console.log(barChart.config("width") + " " + barChart.config("height"));
  barChart.config({
    height: height,
    width: width,
    duration: 300
  });
  // console.log(barChart.config("width") + " " + barChart.config("height"));

  barChart
    .unlayer("bars");

  barChart 
    .unlayer("labels");
  
  barChart
    .accessor("y", (d) => d.Region)
    .accessor("r", (d) => d[quantities[0].columnName])
    .accessor("id", (d) => d.Headline + d.formattedDate);

  // console.log(barChart.accessor("y"));
  barChart
    .draw(data);

  // console.log(data);
  // bubbles.rData(quantities[0].columnName);


  // d3.select("#chart-svg").attr("class", quantities[0].id);
  // d3.select("#chart .legend-base").attr("class", "legend-base");
  // d3.select("#chart .legend-base").classed(quantities[0].id, true);
  // d3.select(".fallback").remove();
  // bubbles.draw(data);

  // // console.log(data.length);

  // var modernization = makeThemeChart("#modernization-chart","project termination/cancellation",quantities[0]);
  // var health = makeThemeChart("#health-chart","health",quantities[0]);
  // var bank = makeThemeChart("#banks-chart","bank",quantities[2]);
  // var exchange = makeThemeChart("#exchange-chart","stock exchange",quantities[1]);
  // var air = makeThemeChart("#air-chart","airport/port/customs systems",quantities[1]);

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
      
      postToFacebook: function(event) {
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
      
      postToTwitter: function(event) {
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