/**

	Will Document This At Some Point
	
	This lib depends on the validationEngine and JQuery
	
*/
;(function ( $ ) {
	var re = /([^&=]+)=?([^&]*)/g;
	var decodeRE = /\+/g;  // Regex for replacing addition symbol with a space
	var decode = function (str) {return decodeURIComponent( str.replace(decodeRE, " ") );};
	$.parseParams = function(url) {
		var params = {}, e;
		if (url === undefined) return params;
		var query = url.split('?')[1] || '';
		while ( e = re.exec(query) ) { 
			var k = decode( e[1] ), v = decode( e[2] );
			if (k.substring(k.length - 2) === '[]') {
				k = k.substring(0, k.length - 2);
				(params[k] || (params[k] = [])).push(v);
			}
			else params[k] = v;
		}
		return params;
	};
	
	$.fn.serializeObject = function() {
	   var o = {};
	   var a = this.serializeArray();
	   $.each(a, function() {
		   if (o[this.name]) {
			   if (!o[this.name].push) {
				   o[this.name] = [o[this.name]];
			   }
			   o[this.name].push(this.value || '');
		   } else {
			   o[this.name] = this.value || '';
		   }
	   });
	   return o;
	};
	
	var AjaxElement = function(elem, options) {
		this.elem = elem;
		this.$elem = $(elem);
		this.options = options;
		this.metadata = $.extend({ }, this.$elem.data('ajaxelement'), {
			rid: this.$elem.data('rid'),
			triggerEvents: this.$elem.data('trigger-events'),
			blockID: this.$elem.data('blockID'),
			ajaxEvent: this.$elem.data('ajax-event')
		});
		var toteURL = this.$elem.data('url');
		this.metadata.ajaxcall = $.extend({ }, this.$elem.data('ajaxcall'), { 
			url: toteURL
		});
		this.metadata.ajaxcall.data = $.extend({ }, this.$elem.data('ajaxdata'), $.parseParams(toteURL));
	};
	
	AjaxElement.prototype = {
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
					$.event.trigger('ajaxStart.AjaxElement');
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
						$.event.trigger('ajaxStop.AjaxElement');
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
	};
	
	var methods = {
		init: function(options) {
			return this.each(function() {	
				if ( undefined === $(this).data('Ajax-Element') ){
					var data = new AjaxElement(this, options).init();
					data.$elem.data('Ajax-Element', data);
				}				
			});
		},
		data: function() {
			return $(this).data('Ajax-Element');
		},
		api: function() {
			return $(this).data('Ajax-Element').config;
		}
	};
	
	AjaxElement.defaults = AjaxElement.prototype.defaults;
	AjaxElement.framework = AjaxElement.prototype.framework;
	
	$.AjaxElement = {
		setDefaults: function(newDefs) {
			/*Check This*/
			AjaxElement.defaults = $.extend({}, AjaxElement.defaults, newDefs);
		}
	};
	
	$.fn.AjaxElement = function (options) {
		if (methods[options]) {
			return methods[options].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if ( typeof options === 'object' || !options ) {
			return methods.init.apply(this, arguments);
		} else {
			console.log('Error!');
		}
	};
	
	$.CreateAjaxElement = function(selector, options) {
		$(selector).AjaxElement(options);
	};
	
})( jQuery );
(function ( $ ) {
	
	
	
})( jQuery );