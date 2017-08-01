/**

	Will Document This At Some Point
	
	This lib depends on the validationEngine and JQuery
	
*/
;(function ( $ ) {
	
	/*
	var AjaxElement = $_Builder.new({
		name: "AjaxElement",
		defaults: {
			ajaxcall: undefined,
			rid: undefined,
			useReplace: false,
			ajaxEvent: undefined,
			triggerEvents: true,
			preventDefault: false,
			blockID: undefined,
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
					var $rid
					if (api.rid) {
						var rrid = (api.rid.slice(0,1) === '#') ? api.rid : '#' + api.rid;
						$rid = $(rrid);
					}
					api.beginFunc(result,api,$rid,obj);
					if (api.rid) {
						api.replaceFunc(result,api,$rid,obj);
					}
					api.endFunc(result,api,$rid,obj);
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
				this.run();
			}
		},
		methods: {
			init: function(options) {
				
			},
			data: function() {
				return $(this).data(DataName);
			},
			api: function() {
				return $(this).data(DataName).config;
			}
		},
		getMetadata: function(elem) {
			
		},
		init: function() {
			this.config = $.extend(true, { }, this.defaults, this.options, this.metadata, this.framework);
			if(this.config.ajaxEvent) {
				var data = this;
				this.$elem.on(this.config.ajaxEvent, function(e){
					data.config.onEvent(e);
				});
			}
			return this;
		}
	},{});
	
	$._Builder.new({
		name: 'AjaxButton',
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
	}, {
		
	});
	
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