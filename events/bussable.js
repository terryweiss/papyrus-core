"use strict";
/**
 * @fileOverview Provides easy access to the system bus and provides some helper methods for doing so
 * @module events/bussable
 * @requires postal
 * @requires lodash
 * @requires base
 */
var bus = require( "postal" );
var Base = require( "../base/index" );
var sys = require( "lodash" );
var logger = require( "../utils/logger" );

/**
 *  @classDesc Provides easy access to the system bus and provides some helper methods for doing so
 *  @exports events/bussable
 *  @mixin
 */
var Bussable = Base.compose( [Base], /** @lends events/bussable# */{
	declaredClass : "events/Bussable",
	constructor   : function () {
		/**
		 * The list of subscriptions maintained by the mixin
		 * @type {Array}
		 * @memberof eventsevents/bussable#
		 * @name _subscriptions
		 * @private
		 */
		this._subscriptions = {};

		logger.trace( "Bussable constructor" );
	},

	/**
	 * Subscribe to an event
	 * @param {string} channel The channel to subscribe to
	 * @param {string} topic The topic to subscribe to
	 * @param {callback} callback What to do when you get the event
	 * @returns {object} The subscription definition
	 */
	subscribe : function ( channel, topic, callback ) {
		logger.trace( "Bussable subscribe" );
		var sub = bus.subscribe( {channel : channel, topic : topic, callback : callback} );
		this.subscriptions[channel + "." + topic] = sub;
		return sub;
	},

	/**
	 * Subscribe to an event once
	 * @param {string} channel The channel to subscribe to
	 * @param {string} topic The topic to subscribe to
	 * @param {callback} callback What to do when you get the event
	 * @returns {object} The subscription definition
	 */
	once : function ( channel, topic, callback ) {
		logger.trace( "Bussable once" );
		var sub = this.subscribe( channel, topic, callback );
		this.subscriptions[channel + "." + topic] = sub;
		sub.disposeAfter( 1 );
		return sub;
	},

	/**
	 * Publish an event on the system bus
	 * @param {string} channel The channel to publish to
	 * @param {string} topic The topic to publish to
	 * @param {object=} options What to pass to the event
	 */
	publish : function ( channel, topic, options ) {
		logger.trace( "Bussable publish" );
		bus.publish( {channel : channel, topic : topic, data : options} );
	},

	/**
	 * Get a subscription definition
	 *
	 * @param {string} channel
	 * @param {string} topic
	 * @returns {object=} The subscription definition
	 */
	getSubscription : function ( channel, topic ) {
		logger.trace( "Bussable getSubscription" );
		return this.subscriptions[channel + "." + topic];
	},

	/**
	 * Gets rid of all subscriptions for this object.
	 * @private
	 */
	destroy : function () {
		logger.trace( "Bussable destroy" );

		sys.each( this.subscriptions, function ( sub ) {
			sub.unsubscribe();
		} );
	}
} );

module.exports = Bussable;
