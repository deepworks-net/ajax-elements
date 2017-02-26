/**

	Will Document This At Some Point
	
	This lib depends on the validationEngine and JQuery
	
*/
;(function ( window, $ ) {

	$.AjaxCall = {
		defaults: {
			type: 'POST',
			data: {}
		}
	};
	
	var AjaxElement = function(elem, options) {
		this.elem = elem;
		this.$elem = $(elem);
		this.options = options;
		this.metadata = $.extend({ }, this.$elem.data('ajaxelement'), {
			rid: '#' + this.$elem.data('rid'),
			useReplace: this.$elem.data('replace'),
			triggerEvents: this.$elem.data('trigger-events'),
			submitButton: this.$elem.data('submit')
		});
		this.metadata.formOptions = $.extend({ }, this.$elem.data('formoptions'), {
			validate: this.$elem.data('validate'),
			e: this.$elem.data('event-type'),
			formID: this.$elem.data('formid')
		});
		this.metadata.ajaxcall = $.extend({ }, this.$elem.data('ajaxcall'), { 
			url: this.$elem.data('url')
		});
		this.metadata.ajaxcall.data = $.extend({ }, this.$elem.data('ajaxdata'));
	};
	
	$.AjaxElements = {};
	
})( window, jQuery );

(function($) {
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
	
})(jQuery);

(function ( window, $ ) {
	
	var AjaxButton = function(elem, options) {
		this.elem = elem;
		this.$elem = $(elem);
		this.options = $.extend({ }, options, { $elem: this.$elem });
		this.metadata = $.extend({ }, this.$elem.data('ajaxbutton'), {
			rid: this.$elem.data('rid'),
			useReplace: this.$elem.data('replace'),
			triggerEvents: this.$elem.data('trigger-events'),
			submitButton: this.$elem.data('submit'),
			useNew: this.$elem.data('usenew'),
			blockID: this.$elem.data('blockID')
		});
		this.metadata.formOptions = $.extend({ }, this.$elem.data('formoptions'), {
			validate: this.$elem.data('validate'),
			e: this.$elem.data('event-type'),
			formID: this.$elem.data('formid')
		});
		var toteURL = this.$elem.data('url');
		this.metadata.ajaxcall = $.extend({ }, this.$elem.data('ajaxcall'), { 
			url: toteURL
		});
		this.metadata.ajaxcall.data = $.extend({ }, this.$elem.data('ajaxdata'), $.parseParams(toteURL));
	};
	
	AjaxButton.prototype = {
		defaults: {
			rid: undefined,
			triggerEvents: true,
			useReplace: false,
			ajaxcall: $.AjaxCall.defaults,
			submitButton: false,
			useNew: false,
			loadOnce: false,
			loaded: 0,
			blockID: undefined,
			reDirUrl: undefined,
			formOptions: {
				validate: false,
				e: 'submit',
				formID: '#formID',
				catchEnter: true
			},
			buildEvent: function () {
				if (this.triggerEvents) {
					$.event.trigger('ajaxButtonStart');
				}
			},
			getDNA: function() {
				this.buildEvent();
				return $.ajax(this.ajaxcall);
			},
			beginFunc: function(result,btn,$rid,success) {},
			endFunc: function(result,btn,$rid,success) {},
			preStartFunc: function() {},
			alwaysFunc: function() {},
			frmdataFunc: function() {
				var qs;
				if (this.useNew) {
					var frmData = this.$frm.serializeObject();
					qs = $.extend({}, this.ajaxcall.data, frmData);
				} else {
					qs = this.$frm.serialize();
				}
				this.ajaxcall.data = qs;
			},
			successFunc: function(success) {},
			replaceFunc: function(result,btn,$rid,success) {
				if ($rid) {
					if (btn.useReplace){
						$rid.empty();
						$rid.append($.trim(result));
					} else {
						$rid.html($.trim(result));
					}
				}
			},
			errorFunc: function(error) {
				alert('There was an Error processing your request, please try again later.');
			},
			unAuthFunc: function(error) {
				alert('There was an Error processing your request, please try again later. UNAUTHORIZED');
			},
			validateFunc: function($frm) {
				return true;
			},
			replaceDNA: function() {
				var btn = this;
				this.preStartFunc();
				this.getDNA().done(function(result, status, obj) {
					var $btn
					if (btn.rid) {
						var rrid = (btn.rid.slice(0,1) === '#') ? btn.rid : '#' + btn.rid;
						$btn = $(rrid);
					}
					btn.beginFunc(result,btn,$btn,obj);
					btn.replaceFunc(result,btn,$btn,obj);
					btn.endFunc(result,btn,$btn,obj);
					btn.successFunc(obj);
				}).fail(function(error) {
					if (error.status === 401) {
						btn.unAuthFunc(error);
					} else {
						btn.errorFunc(error);
					}
				}).always(function() {
					if (btn.triggerEvents) {
						$.event.trigger('ajaxButtonStop');
					}
					btn.alwaysFunc();
				})
			},
			runDNA: function() {
				if(this.submitButton) {
					this.frmdataFunc();
				};
				if (this.frmVal()){
					if (this.modelCB()) {
						this.replaceDNA();
					}
				}
			},
			frmVal: function() {
				if (this.submitButton){
					return this.validateFunc(this.$frm);
				}
				return true;
			},
			modelCB: function() {
				return true;
			},
			capForm: function(event) {
				event.preventDefault();
				var qs = $(this).serialize();
			},
			click: function() {
				if (this.config.loaded === 0) {
					this.config.runDNA();
					if(this.config.loadOnce){
						this.config.loaded = 1;
					}
				}
			}
		},
		initAjaxForm: function(){
			var frm = document.getElementById(this.config.formOptions.formID);
			var $Efrm = $(frm);
			this.config = $.extend(true, {}, this.config, {
				frm: frm,
				$frm: $Efrm,
				ajaxcall: {
					type: $Efrm.attr('method'),
					url: $Efrm.attr('action')
				}
			});
		},
		init: function() {
			this.config = $.extend(true, { }, this.defaults, this.options, this.metadata);
			if (this.config.submitButton) {
				this.initAjaxForm();
			}
			this.click = this.config.click;
			return this;
		}
	};		
	
	$.setAjaxButtonDefaults = function(newDefs) {
		AjaxButton.prototype.defaults = $.extend({}, AjaxButton.prototype.defaults, newDefs);
	};
	
	AjaxButton.defaults = AjaxButton.prototype.defaults;
	
	$.fn.AjaxButton = function (options) {
		
		return this.each(function() {
			if ( undefined === $(this).data('Ajax-Button') ){
				var data = new AjaxButton(this, options).init();
				data.$elem.data('Ajax-Button', data);
				data.$elem.click(function(event) {
					data.click();
				});
			}				
		});
	};
	
	$.AjaxButton = {};
	
	$.CreateAjaxButton = function(selector, options) {
		$(selector).AjaxButton(options);
	};
	
	window.AjaxButton = AjaxButton;
})( window, jQuery );
(function ( window, $ ) {
	
	var AjaxSelect = function(elem, options) {
		this.elem = elem;
		this.$elem = $(elem);
		this.options = options;
		this.metadata = $.extend({ }, this.$elem.data('ajaxbutton'), {
			rid: this.$elem.data('rid'),
			useReplace: this.$elem.data('replace'),
			triggerEvents: this.$elem.data('trigger-events'),
			submitOnChange: this.$elem.data('submit')
		});
		this.metadata.formOptions = $.extend({ }, this.$elem.data('formoptions'), {
			validate: this.$elem.data('validate'),
			e: this.$elem.data('event-type'),
			formID: this.$elem.data('formid')
		});
		this.metadata.ajaxcall = $.extend({ }, this.$elem.data('ajaxcall'), { 
			url: this.$elem.data('url')
		});
		this.metadata.ajaxcall.data = $.extend({ }, this.$elem.data('ajaxdata'));
	}
	
	AjaxSelect.prototype = {
		defaults: {
			rid: undefined,
			triggerEvents: true,
			useReplace: false,
			useNew: false,
			ajaxcall: $.AjaxCall.defaults,
			submitOnChange: false,
			formOptions: {
				validate: false,
				e: 'submit',
				formID: '#formID'
			},
			buildEvent: function () {
				if (this.triggerEvents) {
					$.event.trigger('ajaxSelectStart');
				}
			},
			getDNA: function() {
				this.buildEvent();
				return $.ajax(this.ajaxcall);
			},
			beginFunc: function(result,sel,$rid,success) {},
			endFunc: function(result,sel,$rid,success) {},
			preStartFunc: function() {},
			frmdataFunc: function() {
				var qs;
				if (this.useNew) {
					var frmData = this.$frm.serializeObject();
					qs = $.extend({}, this.ajaxcall.data, frmData);
				} else {
					qs = this.$frm.serialize();
				}
				this.ajaxcall.data = qs;
			},
			alwaysFunc: function() {},
			successFunc: function(success) {},
			replaceFunc: function(result,sel,$rid,success) {
				if (sel.useReplace){
					$rid.empty();
					$rid.append($.trim(result));
				} else {
					$rid.html($.trim(result));
				}
			},
			errorFunc: function(error) {
				alert('There was an Error processing your request, please try again later.');
			},
			unAuthFunc: function(error) {
				alert('There was an Error processing your request, please try again later. 23254');
			},
			validateFunc: function() {
				return true;
			},
			replaceDNA: function() {
				var sel = this;
				this.preStartFunc();
				this.getDNA().done(function(result, status, obj) {
					var $sel = $('#' + sel.rid);
					sel.beginFunc(result,sel,$sel,obj);
					sel.replaceFunc(result,sel,$sel,obj);
					sel.endFunc(result,sel,$sel,obj);
					sel.successFunc(obj);
				}).fail(function(error) {
					if (error.status === 401) {
						sel.unAuthFunc(error);
					} else {
						sel.errorFunc(error);
					}
				}).always(function(){
					if (sel.triggerEvents) {
						$.event.trigger('ajaxSelectStop');
					}
					sel.alwaysFunc();
				});
			},
			runDNA: function() {
				if(this.submitOnChange) {
					this.frmdataFunc();
				};
				if (this.frmVal()){
					if (this.modelCB()) {
						this.replaceDNA();
					}
				}
			},
			frmVal: function() {
				if (this.submitOnChange){
					return this.validateFunc(this.$frm);
				} else {
					return true;
				}
			},
			modelCB: function() {
				return true;
			},
			capForm: function(event) {
				event.preventDefault();
				var qs = $(this).serialize();
			},
			change: function() {
				var object = {};
				var	dataobj = $.extend({}, { name: this.$elem.attr('name')}, { name: this.$elem.data('sendname')});
				object[dataobj.name] = this.elem.value;
				/*this.config.ajaxcall.data = $.extend({ }, this.config.ajaxcall.data, { [this.$elem.attr('name')]: this.elem.value });*/
				this.config.ajaxcall.data = $.extend({ }, this.config.ajaxcall.data, object);
				this.config.runDNA();
			}
		},
		initAjaxForm: function(){
			var frm = document.getElementById(this.config.formOptions.formID);
			var $Efrm = $(frm);
			this.config = $.extend(true, {}, this.config, {
				frm: frm,
				$frm: $Efrm,
				ajaxcall: {
					type: $Efrm.attr('method'),
					url: $Efrm.attr('action')
				}
			});
		},
		init: function() {
			this.config = $.extend(true, { }, this.defaults, this.options, this.metadata);
			if (this.config.submitOnChange) {
				this.initAjaxForm();
			}
			this.change = this.config.change;
			return this;
		}
	};		
	
	AjaxSelect.defaults = AjaxSelect.prototype.defaults;
	
	$.fn.AjaxSelect = function (options) {
		
		return this.each(function() {
			if ( undefined === $(this).data('Ajax-Select') ){
				var data = new AjaxSelect(this, options).init();
				data.$elem.data('Ajax-Select', data);
				data.$elem.change(function(event) {
					data.change();
				});
			}				
		});
	};
	
	AjaxSelect.setDefaults = function(newDefs) {
		AjaxSelect.defaults = $.extend({}, AjaxSelect.prototype.defaults, newDefs);
	};
	
	$.CreateAjaxSelect = function(selector, options) {
		$(selector).AjaxSelect(options);
	}
	
	window.AjaxSelect = AjaxSelect;
})( window, jQuery );
(function ( window, $ ) {
	
	var AjaxReorderTable = function(elem, options) {
		this.elem = elem;
		this.$elem = $(elem);
		this.options = options;
	}
	
	AjaxReorderTable.prototype = {
		defaults: {
			ajaxcall: $.AjaxCall.defaults
		},
		init: function(){
			this.config = $.extend(true, { }, this.defaults, this.options, this.metadata);
			return this;
		}
	};
	
	AjaxReorderTable.defaults = AjaxReorderTable.prototype.defaults;
	
	$.fn.AjaxReorderTable = function (options) {
		return this.each(function() {
			new AjaxReorderTable(this, options).init();
		});
	};
	
	window.AjaxReorderTable = AjaxReorderTable;
})( window, jQuery );
