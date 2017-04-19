/**

	Will Document This At Some Point
	
	This lib depends on the validationEngine and JQuery
	
*/
;(function ( $ ) {
	
	var ajaxButtonOptions = {
		ajaxEvent: 'click'
	};
	
	$.fn.AjaxButton = function(options) {
		return this.AjaxElement($.extend({},ajaxButtonOptions,options));
	}
	
	var ajaxSelectOptions = {
		ajaxEvent: 'change'
	};
	
	$.fn.AjaxSelect = function(options) {
		return this.AjaxElement($.extend({},ajaxSelectOptions,options));
	}
	
})( jQuery );