"use strict";
var strRepeat = function ( str, qty ) {
	if ( qty < 1 ) {return '';}
	var result = '';
	while ( qty > 0 ) {
		//noinspection JSHint
		if ( qty & 1 ) {result += str;}
		//noinspection JSHint
		qty >>= 1, str += str;
	}
	return result;
};
/**
 * Pads the striong with characters until the total string length is equal to the passed length parameter. By
 * default, pads on the left with the space char (" "). padStr is truncated to a single character if necessary
 *
 * @param str {string}
 *             The string to pad
 * @param length {integer}
 *            The length to pad out
 * @param padStr {string=}
 *             The string to pad with
 * @param type {string=}
 *             How to pad the string, choices are "right", "left", "both"
 * @returns {string}
 */
module.exports = function ( str, length, padStr, type ) {
	str = str === null ? '' : String( str );
	//noinspection JSHint
	length = ~~length;

	var padlen = 0;

	if ( !padStr ) {
		padStr = ' ';
	} else if ( padStr.length > 1 ) {
		padStr = padStr.charAt( 0 );
	}

	switch ( type ) {
		case 'right':
			padlen = length - str.length;
			return str + strRepeat( padStr, padlen );
		case 'both':
			padlen = length - str.length;
			return strRepeat( padStr, Math.ceil( padlen / 2 ) ) + str +
				strRepeat( padStr, Math.floor( padlen / 2 ) );
		default: // 'left'
			padlen = length - str.length;
			return strRepeat( padStr, padlen ) + str;
	}
};
/**
 * left-pad a string. Alias for pad(str, length, padStr, 'left').
 *
 * @param {string}
 *            str The string to pad
 * @param {integer}length
 *            The length to pad out
 * @param {string=}
 *            padStr The string to pad with
 * @returns {string}
 */
module.exports.lpad = function ( str, length, padStr ) {
	return module.exports( str, length, padStr );
};
/**
 * right-pad a string. Alias for pad(str, length, padStr, 'right')
 *
 * @param {string}
 *            str The string to pad
 * @param {integer}length
 *            The length to pad out
 * @param {string=}
 *            padStr The string to pad with
 * @returns {string}
 */
module.exports.rpad = function ( str, length, padStr ) {
	return module.exports( str, length, padStr, 'right' );
};
/**
 * left/right-pad a string. Alias for pad(str, length, padStr, 'both')
 *
 * @param {string}
 *            str The string to pad
 * @param {integer}length
 *            The length to pad out
 * @param {string=}
 *            padStr The string to pad with
 * @returns {string}
 */
module.exports.lrpad = function ( str, length, padStr ) {
	return module.exports.pad( str, length, padStr, 'both' );
};

