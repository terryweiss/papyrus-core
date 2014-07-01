"use strict";

var accounting = require( "accounting" );

exports.money = accounting.formatMoney;
exports.column = accounting.formatColumn;
exports.number = accounting.formatNumber;
exports.fixed = accounting.toFixed;
exports.remove = accounting.unformat;
