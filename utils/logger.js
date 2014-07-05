"use strict";
/**
 * @fileOverview The logging system for papyrus is based on [http://pimterry.github.io/loglevel/](loglevel) and slightly decorated
 * @module utils/logger
 * @requires dcl
 *
 */

var dcl = require( "dcl" );
var sys = require( "lodash" );
var logger = require( "log4js" );
/**
 * A logger class that you can mix into your classes to handle logging settings and state at an object level.
 * See {@link utils/logger} for the members of this class
 *
 * @exports utils/logger.Logger
 * @class
 * @see utils/logger
 */
var Logger = dcl( null, /** @lends  utils/logger.Logger# */{
	declaredClass : "utils/Logger",

	constructor : function ( p1, p2 ) {
		if ( sys.isString( p1 ) ) {
			this.logger = logger.getLogger( p1 );
		} else if ( sys.isObject( p1 ) ) {
			this.config = p1;
		}
		if ( sys.isObject( p2 ) ) {
			this.config = p2;
		}
		if ( !this.logger ) {
			this.logger = logger.getLogger( "papyrus" );
		}

		if ( sys.isObject( this.config ) ) {
			logger.configure( this.config );
		}

		sys.each( ['trace', 'debug', 'info', 'warn', 'error', 'fatal'], function ( item ) {
			this[item] = sys.bind( this.logger[item], this.logger );
		}, this );
	},

	/**
	 * Turn off all logging. If you log something, it will not error, but will not do anything either
	 * and the cycles are minimal.
	 *
	 */
	silent : function () {
		this.logger.setLevel( logger.levels.OFF );
	},
	/**
	 * Turns on all logging levels
	 *
	 */
	all    : function () {
		this.logger.setLevel( logger.levels.ALL );
	},
	/**
	 * Sets the logging level to one of `trace`, `debug`, `info`, `warn`, `error`.
	 * @param {string} lvl The level to set it to. Can be  one of `trace`, `debug`, `info`, `warn`, `error`.
	 *
	 */
	level  : function ( lvl ) {
		if ( lvl.toLowerCase() === "none" ) {
			this.disableAll();
		} else {
			this.logger.setLevel( lvl );
		}
	}

} );

module.exports = new Logger();
/**
 * The system global, cross-platform logger
 * @name utils/logger
 * @static
 * @type {utils/logger.Logger}
 */
module.exports.Logger = Logger;
module.exports.getLogger = function ( p1, p2 ) {
	return new Logger( p1, p2 );
};
