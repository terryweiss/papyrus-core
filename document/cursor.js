"use strict";

/**
 * @fileOverview Allows a collection to function as a cursor with movement
 */

var Base = require( "../base" );
var sys = require( "lodash" );
var Signalable = require( "../events/signalable" );

var Cursor = Base.compose( [Base], {
	toCursor : function ( tracked ) {

		if ( !tracked && this._heap ) {
			tracked = this._heap;
		}

		var currentIndex = 0;
		var index;
		var sortExpr;

		var createIndex = function ( t ) {
			index = [];
			sys.each( t, function ( val, key ) {
				index.push( {
					val : val,
					key : key
				} );
			} );
		};

		var sortBy = function ( f ) {
			var sorted = sys.sortBy( tracked, f );
			createIndex( sorted );

		};

		createIndex( tracked );
		var length = index.length;

		var checkIndex = function () {
			if ( sys.size( tracked ) !== index.length ) {
				if ( sortExpr ) {
					sortBy( sortExpr );
				} else {
					createIndex( tracked );
				}
			}
		};
		var payload = {
			sortBy       : function ( f ) {
				sortExpr = f;
				sortBy( f );
				currentIndex = 0;
				return this;
			},
			reindex      : function () {
				createIndex( tracked );
				currentIndex = 0;
			},
			next         : function () {
				checkIndex();
				if ( currentIndex >= (length - 1) ) {
					return null;
				} else {
					currentIndex++;
					if ( payload.isLast() ) {
						payload.reachedLast.fire();
					}
					return index[currentIndex];
				}
			},
			prev         : function () {
				checkIndex();
				if ( (currentIndex - 1) < 0 ) {
					return null;
				} else {
					currentIndex--;
					if ( payload.isFirst() ) {
						payload.reachedFirst.fire();
					}
					return index[currentIndex];
				}
			},
			first        : function ( move ) {
				checkIndex();
				if ( move ) {
					currentIndex = 0;
				}
				return index[0];
			},
			last         : function ( move ) {
				checkIndex();
				if ( move ) {
					currentIndex = length - 1;
				}
				return index[length - 1];
			},
			length       : function () {
				checkIndex();
				return length;
			},
			currentIndex : function () {
				checkIndex();
				return currentIndex;
			},
			setIndex     : function ( val ) {
				checkIndex();
				if ( val >= 0 && val <= (length - 1) ) {
					currentIndex = val;
				}
				return currentIndex;
			},
			isFirst      : function () {
				return currentIndex === 0;
			},
			isLast       : function () {
				return currentIndex >= (index.length - 1);
			}

		};
		Base.mixin( payload, new Signalable() );
		payload._addSignals( {
			reachedFirst : null,
			reachedLast  : null
		} );

		return payload;
	}
} );
module.exports = Cursor;
