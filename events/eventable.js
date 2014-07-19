"use strict";

var Base = require( "../base/index" );
var EventEmitter = require( 'eventemitter2' ).EventEmitter2;

var Eventable = Base.compose( [Base, EventEmitter], {
	declareClass : "utils/Bussable",
	constructor  : function () {
		this.trigger = this.emit;
	}
} );
module.exports = Eventable;
