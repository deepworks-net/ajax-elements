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
			blockID: this.$elem.data('blockID')
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
			ajaxEvent: "click",
			triggerEvents: true,
			preventDefault: false,
			blockID: undefined,
			buildEvent: function () {
				if (this.triggerEvents) {
					$.event.trigger('ajaxStart.AjaxElement');
				}
			},
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
			alwaysFunc: function() {},
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
				return $.ajax($.extend({},  this.ajaxcall, options));
			},
			executeFunc: function(ajaxOR) {
				var elm = this;
				this.preStartFunc();
				this.ajaxFunc(ajaxOR).done(function(result,status,obj){
					var $rid
					if (elm.rid) {
						var rrid = (elm.rid.slice(0,1) === '#') ? elm.rid : '#' + elm.rid;
						$rid = $(rrid);
					}
					elm.beginFunc(result,elm,$rid,obj);
					if (elm.rid) {
						elm.replaceFunc(result,elm,$rid,obj);
					}
					elm.endFunc(result,elm,$rid,obj);
					elm.successFunc(obj);
				}).fail(function(error){
					if (error.status === 401) {
						elm.unAuthFunc(error);
					} else {
						elm.errorFunc(error);
					}
				}).always(function(){
					if (elm.triggerEvents) {
						$.event.trigger('ajaxStop.AjaxElement');
					}
					elm.alwaysFunc();
				});
			},
			runFunc: function() {
				this.executeFunc();
			},
			onEventFunc: function(e) {
				if (this.preventDefault) {
					e.preventDefault();
				}
				this.runFunc();
			}
		},
		
		trsFunc: function(e) {
			this.onEventFunc(e);
		},
		init: function() {
			this.config = $.extend(true, { }, this.defaults, this.options, this.metadata);
			if(this.config.ajaxEvent) {
				this.$elem.on(this.config.ajaxEvent, this.trsFunc);
			}
			return this;
		}
	};
	
	var methods = {
		data: function() {
			return this.config;
		}
	};
	
	$.setAjaxElementDefaults = function(newDefs) {
		AjaxElement.prototype.defaults = $.extend({}, AjaxElement.prototype.defaults, newDefs);
	};
	
	AjaxElement.defaults = AjaxElement.prototype.defaults;
	
	$.fn.AjaxElement = function (options) {
		if (methods[options]) {
			return 
		} else if ( typeof options === 'object' || !options ) {
			return this.each(function() {	
				 if ( undefined === $(this).data('Ajax-Element') ){
					var data = new AjaxElement(this, options).init();
					data.$elem.data('Ajax-Element', data);
				}				
			});
		} else {
			console.log('Error!');
		}
	};
	
	$.AjaxElement = {};
	
	$.CreateAjaxElement = function(selector, options) {
		$(selector).AjaxElement(options);
	};
	
	window.AjaxElement = AjaxElement;
	
})( jQuery );