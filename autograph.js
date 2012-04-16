
function register(acceptsFn, factoryFn) {
    // acceptsFn(specline, metadata)
    //   return true if associated factoryFn can
    //   produce a widget for this specline
    // factoryFn(specline, metadata)
    //   produce an object to manage a widget
    //   this should expose the following functions:
    //     initialize(parent, width, height);
    //     update(outgoing, current, incoming);
    //     dispose();
    // TODO: spec out interactivity
}


function ofField(field) {
    return function(item) {
        return item[field];
    };
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
