
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
function massageTypes(dataset) {

}
/**
   Attempt to parse the given String value using some basic heuristics.

   Essentially, if it parses as a Number, assume it's a Number. If it
   parses as a Date, assume it's a Date. Otherwise, assume it's a String.
*/
function parse(value) {
	var result = Date.parse(value);
	if (!isNaN(result)) {
		return new Date(result);
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

   Returns an Array of Objects with two properties, `name` and `type`,
   describing the data.
*/
function determineTypes(dataset) {
	if (dataset.length === 0) {
		return null;
	}
	
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
