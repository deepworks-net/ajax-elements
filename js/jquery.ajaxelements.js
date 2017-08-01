/**

	Will Document This At Some Point
	
	This lib depends on the validationEngine and JQuery
	
*/
;(function ( $ ) {
	'use strict'
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
})( jQuery );
;(function ( $ ) {
	'use strict'
	
	var _objects = {};
	
	if ( typeof Object.create !== "function" ) {
		Object.create = function (o) {
			function F() {}
			F.prototype = o;
			return new F();
		};
	};
	
	var _Object = {
		name: undefined,
		defaults: {},
		framework: {},
		methods: {
			data: function() {
				return $(this).data(this.name);
			},
			api: function() {
				return $(this).data(this.name).config;
			}
		},
		init: function(elem, options){
			this.elem = elem;
			this.$elem = $(elem);
			this.options = options;
			this.defaults = this.__proto__.defaults;
			this.methods = this.__proto__.methods;
			this.metadata = this.builder.metadataFn.apply(this);
			this.config = this.builder.configFn.apply(this);
			this.builder.initFn.apply(this);
			return this;
		},
		super: function() { return this; },
		builder: {
			metadataFn: function(){ return undefined; },
			configFn: function() {
				return $.extend(true, { }, this.defaults, this.options, this.metadata, this.framework);
			},
			initFn: function() { }
		}
	};
	
	$.plugin = function( name, object, extend ) {
	
		object.name = name;
		if (_objects[extend]) { 
			_Object = _objects[extend];
			object.super = function() { return _Object; };
		}

		_objects[name] = $.extend(true, { }, _Object, object);
		
		var _init = function( options ) {
			return this.each(function() {
				if ( undefined === $(this).data(name) ){
					var data = Object.create(_objects[name]).init(this, options);
					data.$elem.data(name, data);
				}
			});
		};
	
		$.fn[name] =  function (options) {
			if (_objects[name].methods[options]) {
				return _objects[name].methods[options].apply(this, Array.prototype.slice.call(arguments, 1));
			} else if ( typeof options === 'object' || !options ) {
				return _init.apply(this, arguments);
			} else {
				console.log(name+' - Error!');
			}
		};
	};
	
	//var _make = function(prototype,options) {
	//	var elm = _builder;
	//	prototype._builder = _builder.prototype;
	//	elm.prototype = prototype;
		
	//}
	
	$.plugin('AjaxElement', {
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
		builder: {
			metadataFn: function() {
				var elem = this.$elem;
				var toteURL = elem.data('url');
				var metadata = $.extend({ }, elem.data('ajaxelement'), {
					rid: elem.data('rid'),
					triggerEvents: elem.data('trigger-events'),
					useReplace: elem.data('replace'),
					blockID: elem.data('blockID'),
					submitButton: elem.data('submit'),
					ajaxEvent: elem.data('ajax-event')
				});
				metadata.ajaxcall = $.extend({ }, elem.data('ajaxcall'), { 
					url: toteURL
				});
				metadata.ajaxcall.data = $.extend({ }, elem.data('ajaxdata'), $.parseParams(toteURL));
				return metadata;
			},
			initFn: function() {
				if(this.config.ajaxEvent) {
					var data = this;
					this.$elem.on(this.config.ajaxEvent, function(e){
						data.config.onEvent(e);
					});
				}
				return this;
			}
		}
	});
	
	$.plugin('AjaxButton', {
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
		},
		builder: {
			metadataFn: function() {
				var metadata = this.super().builder.metadataFn.apply(this);
				metadata.formOptions = $.extend(true, { }, this.$elem.data('formoptions'), {
					validate: this.$elem.data('validate'),
					e: this.$elem.data('event-type'),
					formID: this.$elem.data('formid')
				});
				return metadata;
			}
		}
	}, 'AjaxElement');
	
	$.plugin('AjaxSelect', {
		defaults: {
			ajaxEvent: 'change'
		}
	}, 'AjaxElement');
	
	/*$._Builder = {
		/*setDefaults: function(newDefs,elmType) {
			if(elmType) {
				if(_objects[elmType]) {
					_objects[elmType] = $.extend({}, _objects[elmType], newDefs);
				}
			}
		},
		/*extend: function(obj,elem,options) {
			return $.extend(AjaxElement.prototype.defaults, options);
		},*/
		/*new: function(prototype,options) {
			_objects[prototype.name] = _make(prototype,options);
			$.fn[prototype.name] = _init;
		}
	};*/
	
	
	
})( jQuery );
;(function ( $ ) {
	'use strict'
	/*
	AjaxElement.prototype = {
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
	};
	
	//Add method method!
	
	AjaxElement.defaults = AjaxElement.prototype.defaults;
	AjaxElement.methods = AjaxElement.prototype.methods;
	
	$.fn.AjaxElement = function (options) {
		if (AjaxElement.methods[options]) {
			return AjaxElement.methods[options].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if ( typeof options === 'object' || !options ) {
			return AjaxElement.methods.init.apply(this, arguments);
		} else {
			console.log('Error!');
		}
	};
	
	var buildElement = function (options) {
		
		//return $(this).AjaxElement($.extend({},defs,options));
	};
	
	$.AjaxElement = {
		elementTypes: {},
		setDefaults: function(newDefs,elmType) {
			if(elmType) {
				if(this.elementTypes[elmType]) {
					this.elementTypes[elmType] = $.extend({}, this.elementTypes[elmType], newDefs);
				}
			}
		},
		extend: function(obj,elem,options) {
			return $.extend(AjaxElement.prototype.defaults, options);
		},
		addElement: function(options) {
			var name = options.name;
			var defs = options.defaults;
			this.elementTypes[name] = defs;
			$.fn[name] = function(options) {
				return $(this).AjaxElement($.extend({},defs,options));
			};
		}
	};
	
	$.AjaxElement.elementTypes["AjaxElement"] = AjaxElement.defaults;
	
	$.CreateAjaxElement = function(selector, options) {
		$(selector).AjaxElement(options);
	};
	
	*/
	
})( jQuery );