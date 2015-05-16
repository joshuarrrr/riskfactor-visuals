var timelineSelection = d3.select(".timeline");
var summary = d3.select(".summary");

var margin = {top: 10, right: 60, bottom: 60, left: 0},
	width = 700 - margin.left - margin.right,
	height = 450 - margin.top - margin.bottom;

function getBinnedDate (d) {
	return d.getFullYear() + " " + (1);
}
var parseDate = d3.time.format("%-m/%-d/%Y").parse;
var parsePubDate = d3.time.format.iso.parse;
var parseBinnedDate = d3.time.format("%Y %m").parse;
var displayMonthYear = d3.time.format("%B, %Y");

var x = d3.scale.linear()
	.range([width, 0]);


var y = d3.time.scale()
	.range([0, height]);


var yAxis = d3.svg.axis()
	.scale(y)
	.orient("right");

var svg = timelineSelection.append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("riskfactor-us-federal-cancelled.csv", function(error, data) {
	var dateIterator;
	var dateIndex = 1;
	var categories = [];
	var catIndex = {
		"customs":0,
		"commerce":0,
		"defense":0,
		"education":0,
		"treasury":0,
		"hhs":0,
		"IT":0,
		"labor":0,
		"law":0,
		"space":0,
		"transportation":0,
		"utilities":0,
		"other":0
	};


	data.forEach(function (d) {
		
		d.Dateline = parsePubDate(d.Dateline);

		/*
		if (d.Dateline === null) {
			d.date = parsePubDate(d.date);
			//console.log(d.Dateline);
		}
		else {
			d.date = d.Dateline;
		}
		*/
		
		d.date = d.Dateline;

		d.Impact = d.Impact / 1000000;
		
		console.log(d.date);
		//d.date = parseDate(d.date);
		//d.Fatalities = d.Fatalities.split(",");
		//d.Injured = d.Injured.split(",");

		if (d.Customs == "x") {
			setCategory("customs");
		}
		else if (d.CommerceCommunications == "x") {
			setCategory("commerce");
		}
		else if (d.DefenseVA == "x") {
			setCategory("defense");
		}
		else if (d.Education == "x") {
			setCategory("education");
		}
		else if (d.FinanceTreasury == "x") {
			setCategory("treasury");
		}
		else if (d.HealthHumanServices == "x") {
			setCategory("hhs");
		}
		else if (d.InformationTechnology == "x") {
			setCategory("IT");
		}
		else if (d.Labor == "x") {
			setCategory("labor");
		}
		else if (d.LawEnforcementLegal == "x") {
			setCategory("law");
		}
		else if (d.Space == "x") {
			setCategory("space");
		}
		else if (d.Transportation == "x") {
			setCategory("transportation");
		}
		else if (d.Utilities == "x") {
			setCategory("utilities");
		} 

		else {
			setCategory("other");
		}

		function setCategory(catName) {
			categories.push(catName);
			d.category = catName;
			d.catIndex = catIndex[catName];
			catIndex[catName] += 1;
		}
		
	});

	//data.sort(function(a,b) {return a.date-b.date;});

	data.forEach(function (d,i) {
		if (d.date == dateIterator) {
			dateIndex = dateIndex + 1; 
		}
		else {
			dateIndex = 1;
		}
		dateIterator = d.date;

		d.dateIndex = dateIndex;
		d.totalIndex = i;
	});


	var nest = d3.nest()
		.key(function (d) { return d.date.getFullYear(); })
		.entries(data);
	//console.log(data);
	
	
	nest.forEach(function (d) {
		var x0 = 0;
		d.values.forEach(function (d) {
			d.x0 = x0;
			x0 += d.Impact;
			console.log(d.x0);
		});
	});
	//console.log(nest);

console.log(data.length);

y.domain(d3.extent(data, function (d) { return d.date; })).nice();

var xmax = d3.max(nest, function (d) { 
	var last = d.values[d.values.length - 1];
	return last.x0 + last.Impact;
});
console.log("xmax" + xmax)

x.domain([0,xmax]);

//var radius = 5;
//var radius = d3.min([x(xmax-1),y(nest[1].values[0].date)/2]) - 5;
var radius = d3.min([x(xmax-.5),y(nest[1].values[0].date)/2]) / 2;
//var radius = nest[0].values[0].date + d3.time.day;
//console.log(nest);
console.log(nest[1].values[0].date); 
console.log(x(xmax-.5) + " " + y(nest[1].values[0].date)/2);
console.log(radius);



//d3.select(".summary").selectAll("p").data(data).enter().append("p").text(function (d) { return d.date.toDateString(); });

var incidentDate = svg.selectAll(".incident-date")
	.data(nest)
	.enter().append("g")
	.attr("class","incident-date")
	.attr("transform", function (d, i) { 
		return "translate(0," + y(parseBinnedDate(getBinnedDate(d.values[0].date))) + ")";
	});

var incident = incidentDate.selectAll(".incident")
	.data(function (d) { return d.values; })
	.enter().append("rect")
	.attr("class",function(d) { return d.category + " incident"; })
	.attr("x", function(d) { 
		console.log(x(d.x0) + " " + d.x0);
		console.log(x(d.Impact) + " " + d.Impact);
		console.log(x(d.Impact + d.x0)+ " " + (d.x0 + d.Impact));
		return x(d.Impact + d.x0); })
	.attr("y", -10)
	.attr("width", function(d, i) { return width - x(d.Impact); })
	.attr("height", 20);

/*
			// Add a group for each column.
            var valgroup = svg.selectAll("g.valgroup")
            .data(stacked)
            .enter().append("svg:g")
            .attr("class", "valgroup")
            .style("fill", function(d, i) { return z(i); })
            .style("stroke", function(d, i) { return d3.rgb(z(i)).darker(); });

            // Add a rect for each date.
            var rect = valgroup.selectAll("rect")
            .data(function(d){return d;})
            .enter().append("svg:rect")
            .attr("x", function(d) { return x(d.x); })
            .attr("y", function(d) { return -y(d.y0) - y(d.y); })
            .attr("height", function(d) { return y(d.y); })
            .attr("width", x.rangeBand());

            */

function updateBox (selection) {
	var selectedData = selection.datum();
	console.log(allIncidents);
	console.log("." + selectedData.category);
	var allCatIncidents = svg.selectAll("." + selectedData.category);
	
	//console.log(currentGovIndex);

	svg.select(".next").classed("next", false);
	svg.select(".prev").classed("prev", false);
	svg.select(".next-cat").classed("next-cat", false);
	svg.select(".prev-cat").classed("prev-cat", false);

	summary.attr("style","position:fixed; top: " + (summary.property("offsetTop") - window.pageYOffset) + "px; right: " + (width + margin.left + margin.right) + "px; margin-top: 0; margin-right: 8px;");
	summary.attr("style","margin-top: " + (window.pageYOffset + 5 + radius ) + "px;");
	d3.transition()
		.duration(300)
		.tween("scroll", scrollTween(svg.property("offsetTop") + 
			y(parseBinnedDate(getBinnedDate(selectedData.date)))))
		.each("end", function () { updateBoxContent(); return; });

	
	console.log((y(parseBinnedDate(getBinnedDate(selectedData.date))) + radius + 5) + 
			"px");
	summary.transition()
		//.style("top", "99px")
		.duration(300);
		


	function updateBoxContent () {
		summary.selectAll("*").remove();
		summary.classed("empty", false);

		
		summary.attr("style","margin-top: " + 
			(y(parseBinnedDate(getBinnedDate(selectedData.date))) + radius + 5) + 
			"px; ");

		summary.append("p").append("em").text(displayMonthYear(selectedData.date));
		summary.append("h3").text(selectedData.Description).attr("class",selectedData.category);
		if (selectedData.Impact != "") {
			summary.append("p").attr("class","impact").text("Impact: " + selectedData.Nonmonetary);
		}
		summary.append("p").append("a").attr("href",selectedData.url).text("Read the original news story");
		var nav = summary.append("p").attr("class","timeline-nav");
		nav.append("a").attr("href","#summary").attr("class","prev-incident").text("Previous");
		nav.append("a").attr("href","#summary").attr("class","next-incident").text("Next");
		var catNav = summary.append("p").attr("class","timeline-nav").attr("style","text-align:center;");
		catNav.append("a").attr("href","#summary").attr("class","prev-incident-cat").text("Previous");
		catNav.append("a").attr("href","#summary").attr("class","next-incident-cat").text("Next");
		catNav.append("span").text(function (d) { return "in " + selectedData.category; });

		/*
		summary.selectAll("*").remove();
		summary.attr("style",function () {

			console.log(d);
			return "margin-top: " + 
			(y(parseBinnedDate(getBinnedDate(d.date))) + radius + 5) + 
			"px; border: black 2px solid; padding: 6px 10px 10px;";
		});
		summary.append("p").append("em").text(function (d) { return displayMonthYear(d.date); });
		summary.append("h3").text(function (d, i) { return i + " " + d.Description; });
		summary.append("p").attr("class","impact").text(function (d) { return "Impact: " + d.Impact; });
		summary.append("p").append("a").attr("href",function (d) { return d.url; }).text("Read the original news story");
		summary.append("p").append("a").attr("href","#").attr("class","next-incident").text("Next");
		*/
		/*
		var endOfGroup = false;
		if (i == incident[j].length - 1) {
			endOfGroup = true;
			next = incident[j+1][0];
		}
		else {
			next = incident[j][i+1];
		}
		*/

		//console.log(allIncidents);
		console.log(allCatIncidents);
		d3.select(allIncidents[0][selectedData.totalIndex+1])
			.classed("next", true);
		d3.select(allIncidents[0][selectedData.totalIndex-1])
			.classed("prev", true);
		d3.select(allCatIncidents[0][selectedData.catIndex + 1])
			.classed("next-cat", true);
		d3.select(allCatIncidents[0][selectedData.catIndex - 1])
			.classed("prev-cat", true);

		
		/*		
		console.log(selection);
		console.log(d);
		console.log(i);
		console.log(j);
		console.log(incident[j][i]);
		console.log(incident[j][i+1]);
		console.log(incident[j][i+1].__data__);
		console.log(incident[j].length);
		*/

		var nextLink = summary.select(".next-incident");
		var nextIncident = svg.select(".next");
		var prevLink = summary.select(".prev-incident");
		var prevIncident = svg.select(".prev");
		var nextCatLink = summary.select(".next-incident-cat");
		var nextCatIncident = svg.select(".next-cat");
		var prevCatLink = summary.select(".prev-incident-cat");
		var prevCatIncident = svg.select(".prev-cat");
		/*
		console.log(nextIncident);
		console.log(d3.select(".selected"));
		*/

		nextLink
			.on("click", function () {
				event.preventDefault();
				d3.select(".selected").classed("selected", false);
				nextIncident.classed("selected", true);
				console.log(nextIncident);
				updateBox(nextIncident);
				/*
				if (endOfGroup === false) {
					updateBox(nextIncident, next.__data__, i+1, j);
				}
				else {
					updateBox(nextIncident, next.__data__, 0, j+1);
					console.log("end reached!");
				}
				*/			
			});
		prevLink
			.on("click", function () {
				event.preventDefault();
				d3.select(".selected").classed("selected", false);
				prevIncident.classed("selected", true);
				console.log(prevIncident);
				updateBox(prevIncident);

			});
		nextCatLink
			.on("click", function () {
				event.preventDefault();
				d3.select(".selected").classed("selected", false);
				nextCatIncident.classed("selected", true);
				console.log(nextCatIncident);
				updateBox(nextCatIncident);	
			});
		prevCatLink
			.on("click", function () {
				event.preventDefault();
				d3.select(".selected").classed("selected", false);
				prevCatIncident.classed("selected", true);
				console.log(prevCatIncident);
				updateBox(prevCatIncident);
			});
		}
}

var allIncidents = svg.selectAll(".incident")
	.on("click", function (d, i) {
		console.log(this);
		console.log(d3.select(this));
		console.log(d);
		console.log(i);
		//console.log(j);
		d3.select(".selected").classed("selected", false);
		d3.select(".next").classed("next", false);
		d3.select(this)
			.classed("selected", true);

		updateBox(d3.select(this));

		/*
		d3.transition()
			.duration(500)
			.tween("scroll", scrollTween(svg.property("offsetTop") + y(parseBinnedDate(getBinnedDate(d.date)))));
		*/
		
		//window.scroll(0,svg.property("offsetTop") + y(parseBinnedDate(getBinnedDate(d.date))));
/*
		d3.select(this)
			.append("text")
				.attr("x", function(d) { return x(d.date); })
				.attr("y", 0)
				.attr("class", "hover-label")
				.text(d.date.toDateString());
*/
/*
		var summary = d3.select(".summary");
		summary.selectAll("*").remove();
		summary.attr("style","margin-top: " + (y(d.date) + radius + 5) + "px; border: black 2px solid; padding: 6px 10px 10px;");
		summary.append("p").append("em").text(displayMonthYear(d.date));
		summary.append("h3").text(d.Description);
		if (d.Impact != "") {
			summary.append("p").attr("class","impact").text("Impact: " + d.Impact);
		}
		summary.append("p").append("a").attr("href",d.url).text("Read the original news story");
	*/	

	});
/*
	.on("mouseout", function (d) {
		d3.select(this).classed("selected", false);
		
	});
*/

/*
incident.append("text")
	.attr("x", 0)
	.attr("y", 0)
	.attr("dy", ".35em")
	.text(function(d) { return d.Summary; });
*/

/*
d3.select(".summary").selectAll("p")
	  .data(data)
	.enter().append("p")
	  .attr("class", "hidden")
	  .text(function(d) { return d.Summary; });
*/
svg.append("g")
	.attr("class", "y axis")
	.attr("transform", "translate("+ width +",0)")
	.call(yAxis);

function scrollTween(offset) {
	return function() {
		var i = d3.interpolateNumber(window.pageYOffset || document.documentElement.scrollTop, offset);
		return function(t) { scrollTo(0, i(t)); };
	};
};

});