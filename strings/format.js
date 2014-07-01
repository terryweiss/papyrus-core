"use strict";
/**
 * @fileOverview String helper methods
 *
 * @module strings/format
 */

var sprintf = require( "sprintf-js" );
var sys = require( "lodash" );

/**
 * Format a string quickly and easily using .net style format strings
 * @param {string} format A string format like "Hello {0}, now take off your {1}!"
 * @param {...?} args One argument per `{}` in the string, positionally replaced
 * @returns {string}
 *
 */
module.exports = function ( format ) {
	var args = Array.prototype.slice.call( arguments, 1 );
	return format.replace( /{(\d+)}/g, function ( match, number ) {
		return typeof args[number] !== 'undefined'
			? args[number]
			: match
			;
	} );
};

module.exports.s = sprintf.sprintf;
module.exports.v = sprintf.vsprintf;

module.exports.f = function ( p1, p2 ) {
	if ( sys.isArray( p2 ) ) {
		return sprintf.vsprintf.call( null, arguments );
	} else {
		return sprintf.sprintf.call( null, arguments );
	}
};
