"use strict";
/**
 * @fileOverview A mixin that gives an object the ability to raise and respond to events within the object
 * that hosts it. This is intended to be used for communications in an object. Communications between
 * object should be handled on the system bus.
 * @module events/eventable
 */

var Base = require( "../base/index" );
var EventEmitter = require( 'eventemitter2' ).EventEmitter2;
var async = require( "async" );
var dcl = require( "dcl" );
var sys = require( "lodash" );
// split the event name on the :
var eventMethodSplitter = /(^|:)(\w)/gi;
// take the event section ("section1:section2:section3")
// and turn it in to uppercase name
function getEventName( match, prefix, eventName ) {
	return eventName.toUpperCase();
}

/**
 * A mixin that gives an object the ability to raise and respond to events within the object
 * that hosts it. This is intended to be used for communications in an object. Communications between
 * object should be handled on the system bus.
 *
 * This mixin exposes tge entirety of [EventEmitter2](https://github.com/asyncly/EventEmitter2) on your object. It also
 * add a couple features:
 *
 * + The `fire` method which allows you to fire asynchronous events
 * + The ability to respond to events emitted on the same object using "on" syntax. For example an event fired as
 * `opened` will also look for a method called `onOpened`. If you format the name of the event by splitting words with `:`,
 * such as `view:ready` it will look for a method named `onViewReady`. Keep in mind that this is in addition to
 * event responders that use `.on("view:ready", myFunc)`.
 *
 * @mixin
 * @inherits module:events/eventable~Eventable
 * @inherits EventEmitter2
 */
var Eventable = Base.compose( [Base, EventEmitter], /** @lends module:events/eventable~Eventable# */{
	declareClass         : "events/Eventable",
	constructor          : function () {
		this.trigger = this.emit;
	},
	/**
	 * Fires an event just like the `emit` function,but with an added parameter: a callback that is raised when the
	 * event has fired on all listeners. But, but, but the difference is that if a listener adds a property to
	 * the function that responds called `async` and sets it to true, the `fire` method will wait for the
	 * function to return a callback before processing the next listener.
	 *
	 * *Note*: `on` syntax methods are always synchronous for now.
	 * @example
	 * var doSomething( done ){
	 *  // do something interesting asynchronously
	 *  if (sys.isFunction(done){ // you could have been called by `emit` instead of `fire`
	 *      done();
	 *  }
	 * }
	 * doSomething.async = true;
	 * obj.on( "someEvent", doSomething );
	 * // later, when raising the event
	 * obj.fire( "someEvent", function(err){
	 *  console.info("event complete");
	 * });
	 *
	 * @param {string} event The event name
	 * @param {function(callback)} func The callback raised when the event has fired all listeners
	 *
	 */
	fire                 : function ( event, func ) {
		var listeners = this.listeners( event ) || [];
		var handlers = [];
		if ( event === 'newListener' && !this.newListener ) {
			if ( !this._events.newListener ) { return false; }
		}

		if ( this._all ) {
			listeners = all.concat( this.listeners );
		}

		if ( this.wildcard ) {
			handlers = [];
			var ns = typeof event === 'string' ? event.split( this.delimiter ) : event.slice();
			searchListenerTree.call( this, handler, ns, this.listenerTree, 0 );
			listeners = listeners.concat( handler );
		}
		else {
			listeners = this._events[event];
		}
		var args = [];
		if ( arguments.length > 2 ) {
			args = sys.toArray( arguments );
		}
		this._processEventMethods( event );
		async.eachSeries( listeners, function ( handler, done ) {

			if ( handler.async ) {
				handler.apply( null, args.concat( [done] ) );
			} else {
				handler.apply( null, args );
				done();
			}
		}, func );

	},
	/**
	 * Clean up bound listeners
	 * @private
	 */
	destroy              : function () {
		this.removeAllListeners();
	},
	/**
	 * Wrap superclass `emit` so that we can handle `on` syntax
	 */
	emit                 : dcl.superCall( function ( sup ) {

		return function ( event ) {
			sup.apply( this, arguments );
			this._processEventMethods( event );
		};
	} ),
	/**
	 * Handles `on` syntax methods
	 * @private
	 */
	_processEventMethods : function ( event ) {

		// get the method name from the event name
		var methodName = 'on' + event.replace( eventMethodSplitter, getEventName );
		var method = this[methodName];

		var args = sys.tail( arguments );

		// call the onMethodName if it exists
		if ( sys.isFunction( method ) ) {
			// pass all arguments, except the event name
			method.apply( this, args );
		}

	}

} );
module.exports = Eventable;
