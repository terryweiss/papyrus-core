"use strict";
/**
 * @fileOverview The logging system for papyrus is based on [http://pimterry.github.io/loglevel/](loglevel) and slightly decorated
 * @module utils/logger
 * @requires dcl
 *
 */

var dcl = require( "dcl" );
var sys = require( "lodash" );

var Log = dcl( null, {
	_captureLogMethod : function ( name ) {
		this[name] = this.Log[name];
	}
} );

var Level = dcl( null, {
	constructor      : function ( level, name ) {
		this.level = level;
		this.name = name;
	},
	toString         : function () {
		return this.name;
	},
	equals           : function ( level ) {
		return this.level == level.level;
	},
	isGreaterOrEqual : function ( level ) {
		return this.level >= level.level;
	}
} );

Level.ALL = new Level( Number.MIN_VALUE, "ALL" );
Level.TRACE = new Level( 10000, "TRACE" );
Level.DEBUG = new Level( 20000, "DEBUG" );
Level.INFO = new Level( 30000, "INFO" );
Level.WARN = new Level( 40000, "WARN" );
Level.ERROR = new Level( 50000, "ERROR" );
Level.FATAL = new Level( 60000, "FATAL" );
Level.OFF = new Level( Number.MAX_VALUE, "OFF" );

var EmptyLogger = dcl( null, {
	level       : Level.Off,
	constructor : function () {
		sys.each( ["trace", "debug", "info", "warn", "error", "fatal"], function ( item ) {
			this[item] = sys.identity();
		}, this );
	}
} );

var ServerLog = dcl( [Log], {
	constructor        : function () {
		var moduleName = "log4js";
		this.log = require( moduleName );
		this.levels = this.log.levels;
		this._captureLogMethod( "getDefaultLogger" );
		this._captureLogMethod( "addAppender" );
		this._captureLogMethod( "clearAppenders" );
	},
	getNullLogger      : function () {
		return new EmptyLogger();
	},
	getRootLogger      : function () {
		return new EmptyLogger();
	},
	getLogger          : function ( name ) {
		name = name || "sys";
		return this.log.getLogger( name );
	},
	disable            : function () {
		this.log.shutdown( false );
	},
	resetConfiguration : sys.identity
} );

var BrowserLog = dcl( [Log], {
	constructor    : function () {
		var moduleName = "log4javascript";

		this.log = require( moduleName );
		this.log = log4javascript;
		this.levels = this.log.Level;
		this._captureLogMethod( "getDefaultLogger" );
		this._captureLogMethod( "getNullLogger" );
		this._captureLogMethod( "getRootLogger" );
		this._captureLogMethod( "resetConfiguration" );
	},
	getLogger      : function ( name ) {
		name = name || "sys";
		return this.log.getLogger( name );
	},
	addAppender    : function ( appender ) {
		this.getRootLogger.addAppender( appender );
	},
	removeAppender : function ( appender ) {
		this.getRootLogger.removeAppender( appender );
	},
	clearAppenders : function () {
		this.getRootLogger.removeAllAppenders();
	},
	disable        : function () {
		this.log.setEnable( false );
	},
	enable         : function () {
		this.log.setEnable( true );
	},
	configure      : function ( options ) {

		options = options || {};
		options = sys.defaults( options, {
			logLevel  : this.levels.TRACE,
			appenders : []
		} );

		this.getRootLogger.setLevel( options.logLevel );

		sys.each( options.appenders, function ( apDef ) {
			var appender = new this.log[apDef.type]();
			this.addAppender( appender );
		}, this );
	}
} );

var instance;
if ( window ) {
	instance = new BrowserLog();
} else {
	instance = new ServerLog();
}

module.exports = instance;

