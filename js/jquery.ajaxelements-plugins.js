/**

	Will Document This At Some Point
	
	This lib depends on the validationEngine and JQuery
	
*/
;(function ( $ ) {

	$.plugin('AjaxElement_Old', {
		defaults: {
			ajaxcall: undefined,
			rid: undefined,
			useReplace: false,
			ajaxEvent: undefined,
			triggerEvents: true,
			preventDefault: false,
			blockID: undefined,
			loadOnce: false,
			loaded: 0,
			successFunc: function(success) {},
			errorFunc: function(error) {
				alert('There was an Error processing your request, please try again later.');
			},
			unAuthFunc: function(error) {
				alert('There was an Error processing your request, please try again later. UNAUTHORIZED');
			},
			blockFunc: function() {},
			unblockFunc: function() {},
			beginFunc: function(result,elm,$rid,success) {},
			endFunc: function(result,elm,$rid,success) {},
			preStartFunc: function() {},
			alwaysFunc: function() {}
		},
		framework: {
			buildEvent: function () {
				if (this.triggerEvents) {
					$.event.trigger('ajaxStart.AE');
				}
			},
			replaceFunc: function(result,elm,$rid,success) {
				if ($rid) {
					if (elm.useReplace){
						$rid.empty();
						$rid.append($.trim(result));
					} else {
						$rid.html($.trim(result));
					}
				}
			},
			ajaxFunc: function(options) {
				this.buildEvent();
				return $.ajax($.extend({},this.ajaxcall,options));
			},
			execute: function(ajaxOR) {
				var api = this;
				this.preStartFunc();
				this.ajaxFunc(ajaxOR).done(function(result,status,obj){
					api.beginFunc(result,api,api.$rid,obj);
					if (api.rid) {
						api.replaceFunc(result,api,api.$rid,obj);
					}
					api.endFunc(result,api,api.$rid,obj);
					api.successFunc(obj);
				}).fail(function(error){
					if (error.status === 401) {
						api.unAuthFunc(error);
					} else {
						api.errorFunc(error);
					}
				}).always(function(){
					if (api.triggerEvents) {
						$.event.trigger('ajaxStop.AE');
					}
					api.alwaysFunc();
				});
			},
			run: function() {
				this.execute();
			},
			onEvent: function(e) {
				if (this.preventDefault) {
					e.preventDefault();
				}
				//Loaded Thing...
				this.run();
			}
		}
	}, 'AjaxElement');
	
	/*
	$.AjaxElement.addElement({
		name: 'AjaxButton',
		metadataFn: function() {
			return this.metadata;
		},
		defaults: {
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
		}	
	});
	
	$.AjaxElement.addElement({
		name: 'AjaxSelect', 
		defaults: {
			ajaxEvent: 'change'
		}
	});
	
	$.AjaxElement.addElement({
		name: 'AjaxForm',
		defaults: {
			ajaxEvent: 'submit'
		}
	});*/
	
})( jQuery );