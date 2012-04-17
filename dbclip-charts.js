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

function getScale(domain, rounded) {
    var scale = d3.scale.linear().domain(domain);
    if (rounded) {
		scale.nice();
    }
    return scale;
}

function createBarChart(specline, metadata, data) {
    /* */
}

// create chart with given metadata by appending to given element
function BarChart(id, width, height, metadata) {
	for (var key in metadata) {
		if (metadata[key] == Date) {
			this.dateCol = key;
		} else if (metadata[key] == Number) {
			this.numCol = key;
		}
	}
	if (this.dateCol == null || this.numCol == null) {
		throw new Error("Bar chart not possible with this metadata.");
	}

	window.console.log('dateCol', this.dateCol);
	window.console.log('numCol', this.numCol);

	this.id = id;
	this.width = width;
	this.height = height;
	this.metadata = metadata;
}

BarChart.prototype = {
	load: function(data) {
        var that = this;

		// N.B.: we add the chart here; if we want to be able to
		// refresh data, we shoul move that elsewhere
		var chart = d3.select(that.id).append("svg")
			.attr("class", "chart")
			.attr("width", that.width)
			.attr("height", that.height);	


        var xScale = getScale(d3.extent(data, function(d) {
			window.console.log('d is', d);
			window.console.log('dateCol is', that.dateCol);
			window.console.log(that);
			
			return d[that.dateCol].getTime();
		}));
        var yScale = getScale(getDomain(data, that.numCol), true);

        var x = xScale.range([0, that.width]);
        var y = yScale.range([0, that.height]);

        var xFn = function(d) { return x(d[that.dateCol].getTime()) - .5; };
        var yFn = function(d) { return h - y(d[that.numCol]) - .5; };

        var wFn = function(d) { return w / data.length - 3; };
        var hFn = function(d) { return y(d[that.numCol]); };


        var rect = chart.selectAll("rect")
            .data(data, function(d) { return d.time; });

        // Respond to incoming data
        rect.enter().insert("rect", "line")
            .attr("x", xFn).attr("y", yFn)
            .attr("width", wFn).attr("height", hFn);

	}
}