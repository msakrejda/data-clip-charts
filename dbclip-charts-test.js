$(document).ready(function() {
	module("data wrangling");

	test("parse", function() {
		// null
		equal(null, parse(null));

		// numbers
		equal(parse('0'), 0, "0");
		equal(parse('1'), 1, "1");
		equal(parse('-1'), -1, "-1");
		equal(parse(Number.MAX_VALUE.toString()), Number.MAX_VALUE, "MAX_VALUE");
		equal(parse(Number.MIN_VALUE.toString()), Number.MIN_VALUE, "MIN_VALUE");
		// dates
		equal(parse('2001-01-01T00:00:00').getTime(),
			  new Date('2001-01-01T00:00:00').getTime(), "a date");
		equal(parse('1970-01-01T00:00:00').getTime(), 0, "epoch");

		// strings
		equal(parse(""), "", "the emptry string");
		equal(parse("x"), "x", "one-char string");
		equal(parse("hello world"), "hello world", "a string");
		equal(parse("12 "), "12 ", "number with trailing space");
		equal(parse("12w"), "12w", "number with trailing non-space");
		equal(parse(" 12"), " 12", "number with leading space");
		equal(parse("q12"), "q12", "number with leading non-space");
	});
	test("massageData", function() {
		equal(massageData( [] ).length, [].length, "empty array");

		var result1 = massageData([
			{ col1: '12', col2: 'foo', col3: '2001-01-01T00:00:00' }
		]);
		equal(result1.length, 1, "length correct");
		ok(typeof result1[0]['col1'] == 'number', "parsed numeric value");
		ok(typeof result1[0]['col2'] == 'string', "parsed string value");
		ok(result1[0]['col3'] instanceof Date, "parsed date value");
	});
	test("determineTypes", function() {
		var result = determineTypes([ { col1: 'str', col2: 42, col3: new Date() } ]);
		var colCount = 0;
		for (var key in result) {
			if (result.hasOwnProperty(key)) {
				colCount++;
			}
		}
		equal(colCount, 3, "correct column count");
		equal(result['col1'], String, "string column recognized");
		equal(result['col2'], Number, "numeric column recognized");
		equal(result['col3'], Date, "date column recognized");
	});


});
