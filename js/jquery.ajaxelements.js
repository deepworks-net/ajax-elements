/**

	Will Document This At Some Point
	
	This lib depends on the validationEngine and JQuery
	
*/
;(function ( $ ) {

	
	$.plugin('ElementX', {
		defaults: {
			e: undefined
		},
		framework: {
			_execute: function(options) { },
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
			metadataFn: function() {
				return { "e": this.$elem.data('event') };
			},
			initFn: function() {
				this.config.elem = this.elem;
				this.config.$elem = this.$elem;
				if(this.config.e) {
					var data = this;
					this.$elem.on(this.config.e, function(e){
						data.config._onEvent(e);
					});
				};
				return this;
			}
		}
	});
	
	$.plugin('TriggerElement', {
		defaults: {
			//????
			target: undefined,
			triggerFunc: function() {}
		},
		framework: {
			_execute: function(options) {
				this.triggerFunc();
			}
		}
	}, 'ElementX');
	
	$.plugin('TriggerButton', {
		defaults: {
			e: 'click'
		}
	}, 'TriggerElement');
	
	$.plugin('AjaxElement', {
		defaults: {
			ajaxcall: undefined,
			rid: undefined,
			useReplace: false,
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
			beginFunc: function(result,success) {},
			endFunc: function(result,success) {},
			preStartFunc: function() {},
			alwaysFunc: function() {}
		},
		framework: {
			_buildEvent: function () {
				if (this.triggerEvents) {
					$.event.trigger('ajaxStart.AE');
				}
			},
			_replaceFunc: function(result,success) {
				if (this.$rid) {
					if (this.useReplace){
						this.$rid.empty();
						this.$rid.append($.trim(result));
					} else {
						this.$rid.html($.trim(result));
					}
				}
			},
			_ajaxFunc: function(options) {
				this._buildEvent();
				return $.ajax($.extend({},this.ajaxcall,options));
			},
			_execute: function(ajaxOR) {
				var api = this;
				this.preStartFunc();
				this._ajaxFunc(ajaxOR).done(function(result,status,success){
					api.beginFunc(result,success);
					if (api.rid) {
						api._replaceFunc(result,success);
					}
					api.endFunc(result,success);
					api.successFunc(success);
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
					submitButton: elem.data('submit')
					//useNew: this.$elem.data('usenew'),
				});
				metadata.ajaxcall = $.extend({ }, elem.data('ajaxcall'), { 
					url: toteURL
				});
				metadata.ajaxcall.data = $.extend({ }, elem.data('ajaxdata'), $.parseParams(toteURL));
				return metadata;
			},
			initFn: function() {
				if (this.config.rid) {
					this.config.$rid = $((this.config.rid.slice(0,1) === '#') ? this.config.rid : '#' + this.config.rid);
				};
				return this;
			}
		}
	}, 'ElementX');
	
	$.plugin('AjaxButton', {
		defaults: {
			//reDirUrl: undefined,
			e: 'click'
		}
	}, 'AjaxElement');
	
	$.plugin('AjaxSelect', {
		defaults: {
			e: 'change'
		},
		framework: {
			_run: function() {
				var object = {};
				var dataobj = $.extend({}, { name: this.$elem.attr('name')}, { name: this.$elem.data('sendname')});
				object[dataobj.name] = this.elem.value;
				this.ajaxcall.data = $.extend({ }, this.ajaxcall.data, object);
				this._execute();
			}
		}
	}, 'AjaxElement');
	
	$.plugin('AjaxForm', {
		defaults: {
			e: 'submit',
			useNew: false,
			submit: true,
			validate: false,
			catchEnter: true,
			preventDefault: true,
			frmdataFunc: function() {
				var qs;
				if (this.useNew) {
					var frmData = this.$elem.serializeObject();
					qs = $.extend({}, this.ajaxcall.data, frmData);
				} else {
					qs = this.$elem.serialize();
				}
				this.ajaxcall.data = qs;
			},
			validateFunc: function() {
				return true;
			}
		},
		framework: {
			_run: function() {
				//make something that goes through all conditional run functions?
				this.frmdataFunc();
				if(this._validate()) {
					this._execute();
				}
			},
			_validate: function() {
				if (this.submit) {
					return this.validateFunc();
				}
				return true;
			}
		},
		builder: {
			metadataFn: function() {
				var metadata = {};
				metadata.formOptions = $.extend(true, { }, this.$elem.data('formoptions'), {
					validate: this.$elem.data('validate'),
					catchEnter: this.$elem.data('catch-enter')
				});
				metadata.ajaxcall = {
					type: this.$elem.attr('method'),
					url: this.$elem.attr('action')
				}
				return metadata;
			}
		}
	}, 'AjaxElement');
	
	$.plugin('AjaxTab', {
		defaults: {
			e: 'click',
			loadOnce: false,
			loaded: 0
		},
		framework: {
			_run: function() {
				if (this.loaded === 0) {
					this._execute();
					if (this.loadOnce) { this.loaded = 1; }
				}
				
			}
		}
	}, 'AjaxElement');
	
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
			e: undefined,
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
			if(this.config.e) {
				var data = this;
				this.$elem.on(this.config.e, function(e){
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