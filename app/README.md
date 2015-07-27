There are currently 5 pages in this project:

Landing page:
	index.html

Timeline page:
	timeline.html
		scripts/marginChart.js
		scripts/timeline.js
		data/timeline.csv
		styles/main.css

Complexity page:
	complexity.html
		scripts/marginChart.js
		scripts/complexity.js
		data/complexity.csv
		styles/main.css

Estimates page:
	estimates.html
		scripts/marginChart.js
		scripts/estimates.js
		data/estimates.csv
		styles/main.css

Quiz page:
	blame.html
		scripts/blame.js
		data/timeline.csv (uses same data)
		styles/main.css

Graveyard page:
	graveyard.html
		scripts/graveyard.js
		data/timeline.csv (uses same data)
		styles/main.css
		styles/graveyard.css (will most likely be merged into main stylesheet)

To embed any of the pages, follow this example:
<div id="PAGE_NAME">
  <script src="PATH_TO_PROJECT_DIR_ON_NETSTORAGE/pym/pym.min.js"></script>
  <script>
    /* global pym */
    var pymParent = new pym.Parent("PAGE_NAME", "PATH_TO_PROJECT_DIR_ON_NETSTORAGE/PAGE_NAME.html", {});
  </script>
  <noscript>
    <img src="/images/PAGE_NAME.png">
  </noscript>
</div>

PATH_TO_PROJECT_DIR_ON_NETSTORAGE is the path the the uploaded project directory and PAGE_NAME is the slug of the page you want to embed ("timeline" in the case of timeline.html).
