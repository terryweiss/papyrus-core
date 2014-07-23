"use strict";

var Base = require( "../base/index" );
var EventEmitter = require( 'eventemitter2' ).EventEmitter2;
var async = require( "async" );
var Eventable = Base.compose( [Base, EventEmitter], {
	declareClass : "utils/Bussable",
	constructor  : function () {
		this.trigger = this.emit;
	},
	fire         : function ( event, func ) {
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

		async.eachSeries( listeners, function ( handler, done ) {

			if ( handler.async ) {
				handler.apply( null, args.concat( [done] ) );
			} else {
				handler.apply( null, args );
				done();
			}
		}, func );

	},
	destroy      : function () {
		this.removeAllListeners();
	}
} );
module.exports = Eventable;
