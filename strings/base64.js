"use strict";
/**
 * @fileOverview Base64 encoding and decoding for binary data and strings.
 * @module ink/strings/base64
 * @copyright Copyright (C) 1999 Masanao Izumo <iz@onicos.co.jp>
 * @author Masanao Izumo <iz@onicos.co.jp>
 * @author Kris Kowal
 * @author Christoph Dorn
 * @author Hannes Wallnoefer
 * @author Terry Weiss
 */

var encodeChars = [
	65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 43, 47];
var decodeChars = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1];

var padding = "=".charCodeAt( 0 );

var binary = require( './binary' );
var Binary = binary.Binary;
var ByteString = binary.ByteString;
var ByteArray = binary.ByteArray;

/**
 * Encode a string or binary to a Base64 encoded string
 * @param {String|Binary} str A string or binary object to encode
 * @param {String=} encoding Encoding to use if
 *     first argument is a string. Defaults to 'utf8'. Valid values are 'utf8', 'ascii' and 'ucs2'.
 * @returns {string} The Base64 encoded string
 * @example
 *      strings = require("ink-strings");
 *      strings.encode( "\\77/[]0987432fgfsujdnfosksuwm*&^%$#@" )
 *      ->'XDc3L1tdMDk4NzQzMmZnZnN1amRuZm9za3N1d20qJl4lJCNA'
 */
exports.encode = function ( str, encoding ) {
	var c1, c2, c3;
	encoding = encoding || 'utf8';
	var input = str instanceof Binary ? str : binary.toByteString( str, encoding );
	var length = input.length;
	var output = new ByteArray( 4 * (length + (3 - length % 3) % 3) / 3 );

	var i = 0,
		j = 0;
	while ( i < length ) {
		c1 = input.buffer[i++];
		if ( i === length ) {
			//noinspection JSHint
			output.buffer[j++] = encodeChars[c1 >> 2];
			//noinspection JSHint
			output.buffer[j++] = encodeChars[(c1 & 0x3) << 4];
			output.buffer[j++] = padding;
			output.buffer[j++] = padding;
			break;
		}
		c2 = input.buffer[i++];
		if ( i === length ) {
			//noinspection JSHint
			output.buffer[j++] = encodeChars[c1 >> 2];
			//noinspection JSHint
			output.buffer[j++] = encodeChars[((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4)];
			//noinspection JSHint
			output.buffer[j++] = encodeChars[(c2 & 0xF) << 2];
			output.buffer[j++] = padding;
			break;
		}
		c3 = input.buffer[i++];
		//noinspection JSHint
		output.buffer[j++] = encodeChars[c1 >> 2];
		//noinspection JSHint
		output.buffer[j++] = encodeChars[((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4)];
		//noinspection JSHint
		output.buffer[j++] = encodeChars[((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6)];
		//noinspection JSHint
		output.buffer[j++] = encodeChars[c3 & 0x3F];
	}
	// length should be correct already, but just to be sure
	output.length = j;
	return output.decodeToString( 'ascii' );
};

/**
 * Decodes a Base64 encoded string to a string or byte array.
 * @param {String} str the Base64 encoded string
 * @param {String=} encoding the encoding to use for the return value.
 *     Defaults to 'utf8'. Use 'raw' to get a ByteArray instead of a string. Other valid values are 'utf8', 'ascii' and 'ucs2'.
 * @returns {string|ByteArray} The decoded string or ByteArray
 * @example
 *      strings = require("ink-strings");
 *      strings.decode( "XDc3L1tdMDk4NzQzMmZnZnN1amRuZm9za3N1d20qJl4lJCNA" );
 *      -> '\\77/[]0987432fgfsujdnfosksuwm*&^%$#@'
 *
 */
exports.decode = function ( str, encoding ) {
	var c1, c2, c3, c4;
	var input = str instanceof Binary ? str : binary.toByteString( str, 'ascii' );
	var length = input.length;
	var output = new ByteArray( length * 3 / 4 );
	var i = 0,
		j = 0;
	outer: while ( i < length ) { /* c1 */
		do {
			c1 = decodeChars[input.buffer[i++]];
		} while ( i < length && c1 === -1 );

		if ( c1 === -1 ) {
			break;
		}

		/* c2 */
		do {
			c2 = decodeChars[input.buffer[i++]];
		} while ( i < length && c2 === -1 );

		if ( c2 === -1 ) {
			break;
		}
		//noinspection JSHint
		output.buffer[j++] = (c1 << 2) | ((c2 & 0x30) >> 4);

		/* c3 */
		do {
			c3 = input.buffer[i++];
			if ( c3 === padding ) {
				break outer;
			}
			c3 = decodeChars[c3];
		} while ( i < length && c3 === -1 );

		if ( c3 === -1 ) {
			break;
		}
		//noinspection JSHint
		output.buffer[j++] = ((c2 & 0xF) << 4) | ((c3 & 0x3C) >> 2);

		/* c4 */
		do {
			c4 = input.buffer[i++];
			if ( c4 === padding ) {
				break outer;
			}
			c4 = decodeChars[c4];
		} while ( i < length && c4 === -1 );

		if ( c4 === -1 ) {
			break;
		}
		//noinspection JSHint
		output.buffer[j++] = ((c3 & 0x03) << 6) | c4;
	}

	output.length = j;
	encoding = encoding || 'utf8';
	return encoding === 'raw' ? output : output.decodeToString( encoding );
};
