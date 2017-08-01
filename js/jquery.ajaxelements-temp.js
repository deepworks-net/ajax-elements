/**

	Will Document This At Some Point
	
	This lib depends on the validationEngine and JQuery
	
*/
;(function ( $ ) {
	
	var ajaxButtonOptions = {
		ajaxEvent: 'click',
		submit: false,
		formOptions: {
			validate: false,
			e: 'submit',
			formID: undefined,
			catchEnter: true
		},
		useNew: false,
		loadOnce: false,
		loaded: 0,
		reDirUrl: undefined
	};

	var AjaxButton = function(elem, options) {
		debugger;
		var newOptions = $.extend({},ajaxButtonOptions,options);
		$.AjaxElement.extend(this, elem, newOptions);
		debugger;
	}
	
	$.fn.AjaxButton = function(options) {
		return this.each(function() {	
			if ( undefined === $(this).data('Ajax-Button') ){
				var data = new AjaxButton(this, options).init();
				data.$elem.data('Ajax-Button', data);
			}				
		});//this.AjaxElement($.extend({},ajaxButtonOptions,options));
	}
	
	var ajaxSelectOptions = {
		ajaxEvent: 'change'
	};
	
	$.fn.AjaxSelect = function(options) {
		return this.AjaxElement($.extend({},ajaxSelectOptions,options));
	}
	
})( jQuery );