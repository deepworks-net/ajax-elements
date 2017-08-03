/**

	Will Document This At Some Point
	
*/
;(function ( $ ) {
	'use strict'
	
	$.plugin('Element', {
		defaults: {
			preStartFunc: function() {}
		},
		framework: {
			_execute: function(options) {
				this.preStartFunc();
			},
			_run: function() {
				this._execute();
			},
			_onEvent: function(e) {
				if (this.preventDefault) {
					e.preventDefault();
				}
				this._run();
			}
		},
		methods: {
			fire: function(options) {
				this.config._execute(options);
			}
		},
		builder: {
			
			
		}
	});
	
})( jQuery );