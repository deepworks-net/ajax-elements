/**

	Will Document This At Some Point
	
	This lib depends on the validationEngine and JQuery
	
*/
;(function ( $ ) {
/*!
 * jQuery prototypal inheritance plugin boilerplate
 * Author: Alex Sexton, Scott Gonzalez
 * Further changes: @addyosmani
 * Licensed under the MIT license
 */

// myObject - an object representing a concept that you want
// to model (e.g. a car)
var myObject = {
  init: function( options, elem ) {
    // Mix in the passed-in options with the default options
    this.options = $.extend( {}, this.options, options );

    // Save the element reference, both as a jQuery
    // reference and a normal reference
    this.elem  = elem;
    this.$elem = $(elem);

    // Build the DOM's initial structure
    this._build();

    // return this so that we can chain and use the bridge with less code.
    return this;
  },
  options: {
    name: "No name"
  },
  _build: function(){
    //this.$elem.html('<h1>'+this.options.name+'</h1>');
  },
  myMethod: function( msg ){
    // You have direct access to the associated and cached
    // jQuery element
    console.log("myMethod triggered");
    // this.$elem.append('<p>'+msg+'</p>');
  }
};

// Object.create support test, and fallback for browsers without it
if ( typeof Object.create !== "function" ) {
    Object.create = function (o) {
        function F() {}
        F.prototype = o;
        return new F();
    };
}

// Create a plugin based on a defined object
$.plugin = function( name, object ) {
  $.fn[name] = function( options ) {
    return this.each(function() {
      if ( ! $.data( this, name ) ) {
        $.data( this, name, Object.create(object).init(
        options, this ) );
      }
    });
  };
};

//hello testing the keyboard it seems to be working ok now, maybe it is a software thing?



// Usage:
// With myObject, we could now essentially do this:
// $.plugin('myobj', myObject);

// and at this point we could do the following
// $('#elem').myobj({name: "John"});
// var inst = $('#elem').data('myobj');
// inst.myMethod('I am a method');

})( $ );
;(function ( $ ) {
	'use strict'
	
	var	DataName = ''
	
	var BP = function(elem,options,mdcallback) {
		this.elem = elem;
		this.$elem = $(elem);
		this.options = options;
		this.metadata = $.extend({},{});
		if (mdcallback) {
			mdcallback.apply(this);
		}
	};
	
	BP.prototype = {
		defaults: {
			trigger: undefined
		},
		framework: {
			execute: function() {
			},
			run: function() {
				this.execute();
			},
			onEvent: function(e) {
				if (this.preventDefault) {
					e.preventDefault();
				}
				this.run();
			}
		},
		methods: {
			init: function(options) {
				return this.each(function() {	
					if ( undefined === $(this).data(DataName) ){
						var data = new BP(this, options).init();
						data.$elem.data(DataName, data);
					}				
				});
			},
			data: function() {
				return $(this).data(DataName);
			},
			api: function() {
				return $(this).data(DataName).config;
			}
		},
		init: function() {
			this.config = $.extend(true, { }, this.defaults, this.options, this.metadata, this.framework);
			if(this.config.trigger) {
				var data = this;
				this.$elem.on(this.config.trigger, function(e){
					data.config.onEvent(e);
				});
			}
			return this;
		}
	};
	
	BP.defaults = BP.prototype.defaults;
	BP.methods = BP.prototype.methods;
	
	$.fn.BP = function (options) {
		if (BP.methods[options]) {
			return BP.methods[options].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if ( typeof options === 'object' || !options ) {
			return BP.methods.init.apply(this, arguments);
		} else {
			console.log('Error!');
		}
	};
	
})( $ );