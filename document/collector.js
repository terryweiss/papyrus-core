"use strict";
/**
 @fileOverview An object and array collector
 @module document/collector
 */

var Base = require( "../base" );
var probe = require( "./probe" );
var Cursor = require( "./cursor" );
var sys = require( "lodash" );
var dcl = require( "dcl" );

/**
 * A collector
 * @constructor
 */
var CollectorBase = dcl( [Base, Cursor], /** @lends module:document/collector~CollectorBase#*/ {
	declaredClass : "document/collector",
	constructor   : function ( obj ) {
		var that = this;
		if ( obj && !sys.isObject( obj ) ) {
			throw new TypeError( "Collectors require an initial object or array passed to the constructor" );
		}
		/**
		 * The collection that being managed
		 * @memberOf module:document/collector~CollectorBase#
		 * @type {object|array}
		 * @name heap
		 * @private
		 */
		this._heap = obj || {};
		// mixin the probe
		probe.mixin( this, this._heap );
		/**
		 * Get the size of the collection
		 * @name length
		 * @type {number}
		 * @memberOf module:document/collector~CollectorBase#
		 */
		Object.defineProperty( this, "length", {
				get : function () {
					return sys.size( that._heap );
				}
			}
		);
		/**
		 * Creates an array of shuffled array values, using a version of the Fisher-Yates shuffle.
		 * See http://en.wikipedia.org/wiki/Fisher-Yates_shuffle.
		 * @function
		 * @memberOf module:document/collector~CollectorBase#
		 * @returns {array}
		 * @name shuffle
		 */
		this.shuffle = sys.bind( sys.shuffle, this, this._heap );

	},
	/**
	 * Adds an item to the collection
	 * @param {*} key The key to use for the item being added.
	 * @param {*} item The item to add to the collection. The item is not iterated so that you could add bundled items to the collection
	 */
	add           : function ( key, item ) {
		this._heap[key] = item;
	},
	/**
	 * Iterate over each item in the collection, or a subset that matches a query. This supports two signatures:
	 * `.each(query, function)` and `.each(function)`. If you pass in a query, only the items that match the query
	 * are iterated over.
	 * @param {object=} query A query to evaluate
	 * @param {function(val, key)} iterator Function to execute against each item in the collection
	 * @param {object=} thisobj The value of `this`
	 */
	each          : function ( query, iterator, thisobj ) {
		if ( sys.isPlainObject( query ) ) {
			thisobj = thisobj || this;
			sys.each( this.find( query ), iterator, thisobj );
		} else {
			thisobj = iterator || this;
			sys.each( this._heap, query, thisobj );
		}
	},
	/**
	 * Returns the collection as an array. If it is already an array, it just returns that.
	 * @return {array}
	 */
	toArray       : function () {
		return sys.toArray( this._heap );
	},
	/**
	 * Supports conversion to a JSON string or for passing over the wire
	 *
	 * @returns {Object|array}
	 */
	toJSON        : function () {
		return this._heap;
	},
	/**
	 * Maps the contents to an array by iterating over it and transforming it. You supply the iterator. Supports two signatures:
	 * `.map(query, function)` and `.map(function)`. If you pass in a query, only the items that match the query
	 * are iterated over.
	 * @param {object=} query A query to evaluate
	 * @param {function(val, key)} iterator Function to execute against each item in the collection
	 * @param {object=} thisobj The value of `this`
	 */
	map           : function ( query, iterator, thisobj ) {
		if ( sys.isPlainObject( query ) ) {
			thisobj = thisobj || this;
			return sys.map( this.find( query ), iterator, thisobj );
		} else {
			thisobj = iterator || this;
			return sys.map( this._heap, query, thisobj );
		}
	},
	/**
	 * Reduces a collection to a value which is the accumulated result of running each element in the collection through the
	 * callback, where each successive callback execution consumes the return value of the previous execution. If accumulator
	 * is not passed, the first element of the collection will be used as the initial accumulator value.
	 * are iterated over.
	 * @param {object=} query A query to evaluate
	 * @param {function(result, val, key)} iterator The function that will be executed in each item in the collection
	 * @param {*=} accumulator Initial value of the accumulator.
	 * @param {object=} thisobj The value of `this`
	 * @return {*}
	 */
	reduce        : function ( query, iterator, accumulator, thisobj ) {
		if ( sys.isPlainObject( query ) ) {
			thisobj = thisobj || this;
			return sys.reduce( this.find( query ), iterator, accumulator, thisobj );
		} else {
			thisobj = accumulator || this;
			return  sys.reduce( this._heap, query, iterator, thisobj );
		}
	},
	/**
	 * Creates an object composed of keys returned from running each element
	 * of the collection through the given callback. The corresponding value of each key
	 * is the number of times the key was returned by the callback.
	 * @param {object=} query A query to evaluate. If you pass in a query, only the items that match the query
	 * are iterated over.
	 * @param  {function(value, key, collection)} iterator
	 * @param {object=} thisobj The value of `this`
	 * @return {object}
	 */
	countBy       : function ( query, iterator, thisobj ) {
		if ( sys.isPlainObject( query ) ) {
			thisobj = thisobj || this;
			return sys.countBy( this.find( query ), iterator, thisobj );
		} else {
			thisobj = iterator || this;
			return sys.countBy( this._heap, query, thisobj );
		}
	},
	/**
	 * Creates an object composed of keys returned from running each element of the collection through the callback.
	 * The corresponding value of each key is an array of elements passed to callback that returned the key.
	 * The callback is invoked with three arguments: (value, index|key, collection).
	 * @param {object=} query A query to evaluate . If you pass in a query, only the items that match the query
	 * are iterated over.
	 * @param {function(value, key, collection)} iterator
	 * @param {object=} thisobj The value of `this`
	 * @return {object}
	 */
	groupBy       : function ( query, iterator, thisobj ) {
		if ( sys.isPlainObject( query ) ) {
			thisobj = thisobj || this;
			return sys.groupBy( this.find( query ), iterator, thisobj );
		} else {
			thisobj = iterator || this;
			return sys.groupBy( this._heap, query, thisobj );
		}
	},
	/**
	 * Reduce the collection to a single value. Supports two signatures:
	 * `.pluck(query, function)` and `.pluck(function)`
	 * @param {object=} query The query to evaluate. If you pass in a query, only the items that match the query
	 * are iterated over.
	 * @param {string} property The property that will be 'plucked' from the contents of the collection
	 * @return {*}
	 */
	pluck         : function ( query, property ) {
		if ( arguments.length === 2 ) {
			return sys.map( this.find( query ), function ( record ) {
				return probe.get( record, property );
			} );
		} else {
			return sys.map( this._heap, function ( record ) {
				return probe.get( record, query );
			} );
		}
	},
	/**
	 * Returns a sorted copy of the collection.
	 * @param {object=} query The query to evaluate. If you pass in a query, only the items that match the query
	 * are iterated over.
	 * @param {function(value, key)} iterator
	 * @param {object=} thisobj The value of `this`
	 * @return {array}
	 */
	sortBy        : function ( query, iterator, thisobj ) {
		if ( sys.isPlainObject( query ) ) {
			thisobj = thisobj || this;
			return sys.sortBy( this.find( query ), iterator, thisobj );
		} else {
			thisobj = iterator || this;
			return sys.sortBy( this._heap, query, thisobj );
		}
	},
	/**
	 * Retrieves the maximum value of an array. If callback is passed,
	 * it will be executed for each value in the array to generate the criterion by which the value is ranked.
	 * @param {object=} query A query to evaluate . If you pass in a query, only the items that match the query
	 * are iterated over.
	 * @param {function(value, key, collection)} iterator
	 * @param {object=} thisobj The value of `this`
	 * @return {number}
	 */
	max           : function ( query, iterator, thisobj ) {
		if ( sys.isPlainObject( query ) ) {
			thisobj = thisobj || this;
			return sys.max( this.find( query ), iterator, thisobj );
		} else {
			thisobj = iterator || this;
			return sys.max( this._heap, query, thisobj );
		}
	},
	/**
	 * Retrieves the minimum value of an array. If callback is passed,
	 * it will be executed for each value in the array to generate the criterion by which the value is ranked.
	 * @param {object=} query A query to evaluate . If you pass in a query, only the items that match the query
	 * are iterated over.
	 * @param {function(value, key, collection)} iterator
	 * @param {object=} thisobj The value of `this`
	 * @return {number}
	 */
	min           : function ( query, iterator, thisobj ) {
		if ( sys.isPlainObject( query ) ) {
			thisobj = thisobj || this;
			return sys.min( this.find( query ), iterator, thisobj );
		} else {
			thisobj = iterator || this;
			return sys.min( this._heap, query, thisobj );
		}
	},
	/**
	 * Destructor called when the object is destroyed.
	 * @private
	 */
	destroy       : function () {
		this._heap = null;
	}
} );

/**
 * An object based collector
 * @extends module:document/collector~CollectorBase
 * @constructor
 */
var OCollector = dcl( CollectorBase, {
	/**
	 * Get a record by key
	 * @param {*} key The key of the record to get
	 * @return {*}
	 */
	key : function ( key ) {
		return this._heap[key];
	}
} );

//noinspection JSCommentMatchesSignature
/**
 An array based collector
 @extends module:document/collector~CollectorBase
 @constructor
 */
var ACollector = dcl( CollectorBase, /** @lends module:document/collector~ACollector# */{
		constructor : function ( obj ) {
			if ( obj && !sys.isArray( obj ) ) {
				throw new TypeError( "Collectors require an array passed to the constructor" );
			}
			this._heap = obj || [];
			/**
			 * Creates an array of array elements not present in the other arrays using strict equality for comparisons, i.e. ===.
			 * @returns {array}
			 * @member module:document/collector~ACollector#
			 * @name difference
			 * @function
			 */
			this.difference = sys.bind( sys.difference, this, this._heap );
			/**
			 * This method gets all but the first values of array
			 * @param {number=} n The numer of items to return
			 * @returns {*}
			 * @member module:document/collector~ACollector#
			 * @name tail
			 * @function
			 */
			this.tail = sys.bind( sys.tail, this, this._heap );
			/**
			 * Gets the first n values of the array
			 * @param {number=} n The numer of items to return
			 * @returns {*}
			 * @member module:document/collector~ACollector#
			 * @name head
			 * @function
			 */
			this.head = sys.bind( sys.head, this, this._heap );
		},
		/**
		 * Adds to the top of the collection
		 * @param {*} item The item to add to the collection. Only one item at a time can be added
		 */
		add         : function ( item ) {
			this._heap.unshift( item );
		},
		/**
		 * Add to the bottom of the list
		 * @param {*} item The item to add to the collection.  Only one item at a time can be added
		 */
		append      : function ( item ) {
			this._heap.push( item );
		},
		/**
		 * Add an item to the top of the list. This is identical to `add`, but is provided for stack semantics
		 * @param {*} item The item to add to the collection. Only one item at a time can be added
		 */
		push        : function ( item ) {
			this.add( item );
		},
		/**
		 * Modifies the collection with all falsey values of array removed. The values false, null, 0, "", undefined and NaN are all falsey.
		 */
		compact     : function () {
			this._heap = sys.compact( this._heap );
		},
		/**
		 * Creates an array of elements from the specified indexes, or keys, of the collection. Indexes may be specified as
		 * individual arguments or as arrays of indexes
		 * @param {indexes} args The indexes to use
		 */
		at          : function () {
			var arr = sys.toArray( arguments );
			arr.unshift( this._heap );
			return sys.at.apply( this, arr );
		},
		/**
		 * Flattens a nested array (the nesting can be to any depth). If isShallow is truthy, array will only be flattened a single level.
		 * If callback is passed, each element of array is passed through a callback before flattening.
		 * @param {object=} query A query to evaluate . If you pass in a query, only the items that match the query
		 * are iterated over.
		 * @param {function(value, key, collection)} iterator,
		 * @param {object=} thisobj The value of `this`
		 * @return {number}
		 */
		flatten     : function ( query, iterator, thisobj ) {
			if ( sys.isPlainObject( query ) ) {
				thisobj = thisobj || this;
				return sys.flatten( this.find( query ), iterator, thisobj );
			} else {
				thisobj = iterator || this;
				return sys.flatten( this._heap, query, thisobj );
			}
		},
		/**
		 * Gets an items by its index
		 * @param {number} key The index to get
		 * @return {*}
		 */
		index       : function ( index ) {
			return this._heap[ index ];
		}
	}
);

/**
 Collect an object
 @param {array|object} obj What to collect
 @return {ACollector|OCollector}
 */
exports.collect = function ( obj ) {
	if ( sys.isArray( obj ) ) {
		return new ACollector( obj );
	} else {
		return new OCollector( obj );
	}
};

exports.array = function ( obj ) {
	return new ACollector( obj );
};

exports.object = function ( obj ) {
	return new OCollector( obj );
};

/**
 Returns true if all items match the query. Aliases as `all`
 @function

 @param {object} qu The query to execute
 @returns {boolean}
 @name every
 @memberOf module:document/collector~CollectorBase#
 */


/**
 Returns true if any of the items match the query. Aliases as `any`
 @function

 @param {object} qu The query to execute
 @returns {boolean}
 @memberOf module:document/collector~CollectorBase#
 @name some
 */


/**
 Returns the set of unique records that match a query

 @param {object} qu The query to execute.
 @return {array}
 @memberOf module:document/collector~CollectorBase#
 @name unique
 @method
 **/

/**
 Returns true if all items match the query. Aliases as `every`
 @function

 @param {object} qu The query to execute
 @returns {boolean}
 @name all
 @memberOf module:document/collector~CollectorBase#
 */


/**
 Returns true if any of the items match the query. Aliases as `all`
 @function

 @param {object} qu The query to execute
 @returns {boolean}
 @memberOf module:document/collector~CollectorBase#
 @name any
 */


/**
 Remove all items in the object/array that match the query

 @param {object} qu The query to execute. See {@link module:document/probe.queryOperators} for the operators you can use.
 @return {object|array} The array or object as appropriate without the records.
 @memberOf module:document/collector~CollectorBase#
 @name remove
 @method
 **/

/**
 Returns the first record that matches the query and returns its key or index depending on whether `obj` is an object or array respectively.
 Aliased as `seekKey`.

 @param {object} qu The query to execute.
 @returns {object}
 @memberOf module:document/collector~CollectorBase#
 @name findOneKey
 @method
 */


/**
 Returns the first record that matches the query. Aliased as `seek`.

 @param {object} qu The query to execute.
 @returns {object}
 @memberOf module:document/collector~CollectorBase#
 @name findOne
 @method
 */


/**
 Find all records that match a query and returns the keys for those items. This is similar to {@link module:document/probe.find} but instead of returning
 records, returns the keys. If `obj` is an object it will return the hash key. If 'obj' is an array, it will return the index

 @param {object} qu The query to execute.
 @returns {array}
 @memberOf module:document/collector~CollectorBase#
 @name findKeys
 @method
 */


/**
 Find all records that match a query

 @param {object} qu The query to execute.
 @returns {array} The results
 @memberOf module:document/collector~CollectorBase#
 @name find
 @method
 **/

/**
 Updates all records in obj that match the query. See {@link module:document/probe.updateOperators} for the operators that are supported.

 @param {object} qu The query which will be used to identify the records to updated
 @param {object} setDocument The update operator. See {@link module:document/probe.updateOperators}
 @memberOf module:document/collector~CollectorBase#
 @name update
 @method
 */
