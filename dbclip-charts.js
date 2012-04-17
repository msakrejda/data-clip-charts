function register(acceptsFn, factoryFn) {
    // acceptsFn(specline, metadata)
    //   return true if associated factoryFn can
    //   produce a widget for this specline
    // factoryFn(specline, metadata)
    //   constructor function to produce an object to manage a widget
    //   this should expose the following function:
    //     load(parent, width, height, data);
}

/**
   Return an accessor function for getting the value of the given
   field of an object
*/
function ofField(field) {
    return function(item) {
        return item[field];
    };
}


/**
   Massage the data types of this result set to provide strongly typed
   objects corresponding to the provided String representations.   
*/
function massageData(dataset) {
	var result = [];
	for (var i = 0; i < dataset.length; i++) {
		var newrow = {};
		var oldrow = dataset[i];
		for (var key in oldrow) {
			if (oldrow.hasOwnProperty(key)) {
				newrow[key] = parse(oldrow[key]);
			}
		}
		result.push(newrow);
	}
	return result;
}

// N.B.: We currently truncate to the second
var dateregexp = /(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/

/**
   Parse the date in the given string and return a Date object represeting
   the same date; or return null if the string does not specify a date.

   The accepted format is

   2000-01-01T12:13:14+00:00
*/
function parseDate(datestr) {
	if (datestr == null) {
		return null;
	}
	var dateparts = datestr.match(dateregexp);
	if (!dateparts) {
		return null;
	} else {
		// N.B.: the date parts here are obviously strings but they
		// are coerced to numbers in building the date object, so we
		// don't need to do that by hand
		return new Date(
			Date.UTC(dateparts[1], parseInt(dateparts[2]) - 1 /* months are 0-indexed */,
					 dateparts[3], dateparts[4], dateparts[5], dateparts[6]));
	}
}

/**
   Attempt to parse the given String value using some basic heuristics.

   Essentially, if it parses as a Number, assume it's a Number. If it
   parses as a Date, assume it's a Date. Otherwise, assume it's a String.

   Note that we are currently very conservative and only guess Number
   for types with no leading or trailing spaces (this is how we expect
   the data to come in anyway).
*/
function parse(value) {
	if (value == null) {
		return value;
	}
	var result = parseDate(value);
	if (result != null) {
		return result
	}
	result = parseFloat(value)
	// N.B.; we need this second check so something like "12 Angry Men"
	// is not parsed as just 12
	if (!isNaN(result) && result.toString().length == value.length) {
		return result;
	}
	return value;
}


/**
   Determine the data types of all the columns in the given dataset.
   A dataset is expected to be an array of Objects, each with a uniform
   mapping of keys (column names) to values (the values for that column
   in each row).

   Returns an Object mapping column names to their data types.
*/
function determineTypes(dataset) {
	if (dataset == null || dataset.length == 0) {
		return null;
	}
	var result = {};
	// TODO: look at other columns to sanity-check types
	var row = dataset[0];
	for (var key in row) {
		if (row.hasOwnProperty(key)) {
			var value = row[key];
			var type;
			if (typeof value == 'number') {
				type = Number;
			} else if (typeof value == 'string') {
				type = String;
			} else if (value instanceof Date) {
				type = Date;
			}
			result[key] = type;
		}
	}
	return result;
}

function getDomain(data, field) {
    // TODO: we may want this to be more sophisticated and take the
    // previous domain (if any) into account to allow for smoother
    // scale transitions with dynamic data
    return d3.extent(data, ofField(field));
}

// create chart with given metadata by appending to given element
function BarChart(specline, metadata) {
	var spec = BarChart.parseSpecline(specline);
	for (var key in metadata) {
		if (metadata[key] == Date && (this.dateCol == null || key == spec.x)) {
			this.dateCol = key;
		} else if (metadata[key] == Number && (this.numCol == null || key == spec.y)) {
			this.numCol = key;
		}
	}
	// TODO: more informative error messages
	if (this.dateCol == null || this.numCol == null) {
		throw new Error("Bar chart not possible with this specline and metadata.");
	}

	this.metadata = metadata;
}

// N.B.: this allows some undesireable speclines (e.g., "bar with"),
// but that's probably not a huge deal and a fully correct regex would
// be monstrous
var barSpecRegex = /bar(?:\s+with(?:\s+(\S+)\s+as\s+x)?(?:,?\s+(\S+)\s+as\s+y)?)?/

BarChart.parseSpecline = function(specline) {
	if (specline == null) {
		return null;
	}
	var match = specline.match(barSpecRegex);
	if (!match) {
		return null;
	} else {
		return {
			x: match[1],
			y: match[2]
		};
	}
}

BarChart.prototype = {
	initialize: function(id, width, height) {
		this.id = id;

		this.width = width;
		this.height = height;

		this.xmargin = 50;
		this.ymargin = 40;

		this.chart = d3.select(id).append("svg")
			.attr("class", "chart")
			.attr("width", width)
			.attr("height", height);
	},

	load: function(data) {
        var that = this;

        var xScale = d3.time.scale().domain(
			d3.extent(data, function(d) {
				return d[that.dateCol].getTime();
			})
		);
        var yScale = d3.scale.linear().domain(
			// Start our scale at zero; it may be useful to support
			// scales based on data values in the future, but this
			// is a simpler default
			[0, d3.max(data, ofField(that.numCol))]
		).nice();

        var barWidth = (that.width - that.xmargin) / data.length - 5;
        var x = xScale.range([0, that.width - that.xmargin - barWidth]);
		// N.B.: the y scale is "backwards", but this is more useful
		// (especially in re: labeling axes), because the SVG coordinate
		// system itself is "backwards"
        var y = yScale.range([that.height - that.ymargin, 0]);

		// Add axes
		var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .ticks(5)
            .tickSize(5, 2, 0)
            .tickPadding(3);
		var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            .ticks(4)
            .tickSize(5, 2, 0)
            .tickPadding(3);

		that.chart.append("line")
			.attr("stroke", "black").attr("stroke-width", 1)
		    .attr("x1", that.xmargin).attr("y1", that.height - that.ymargin + 1.5)
		    .attr("x2", that.width).attr("y2", that.height - that.ymargin + 1.5)
		that.chart.append("line")
			.attr("stroke", "black").attr("stroke-width", 1)
		    .attr("x1", that.xmargin - 2.5).attr("y1", 0)
		    .attr("x2", that.xmargin - 2.5).attr("y2", that.height - that.ymargin)

		that.chart.append("text")
			.attr("transform", "translate("
				  + ((that.xmargin + that.width) / 2) + ","
				  + that.height + ")")
			.attr("text-anchor", "middle")
			.attr("font-size", "1.5em")
			.text(that.numCol);
		that.chart.append("text")
			.attr("transform", "translate(15,"
				  + ((that.height - that.ymargin) / 2) + ") rotate(-90,0,0)")
			.attr("text-anchor", "middle")
			.attr("font-size", "1.5em")
			.text(that.dateCol);

		that.chart.append("g")
			.attr("class", "x-axis")
			.attr("transform", "translate(" + (that.xmargin + 10) + ","
				  + (that.height - that.ymargin) + ")")
			.call(xAxis);
		that.chart.append("g")
			.attr("class", "y-axis")
			.attr("transform", "translate(" + that.xmargin + ",0)")
			.call(yAxis);


		// Element mapping functions
        var xFn = function(d) { return x(d[that.dateCol]) - .5; };
        var yFn = function(d) { return y(d[that.numCol]) - .5; };
        var hFn = function(d) { return that.height - that.ymargin - y(d[that.numCol]) - .5; };

        var rect = that.chart.selectAll("rect")
            .data(data, function(d) { return d[that.dateCol]; });

        // Respond to incoming data
        rect.enter().insert("rect")
		    .attr("transform", "translate(" + that.xmargin + ",0)")
            .attr("x", xFn).attr("y", yFn)
            .attr("width", barWidth).attr("height", hFn);

	}
}