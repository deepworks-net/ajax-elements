/**

	Will Document This At Some Point
	
	This lib depends on the validationEngine and JQuery
	
*/

;(function ( window, $ ) {

	$.AjaxCall = {
		defaults: {
			type: 'POST',
			data: {
				action: 'defaultAction',
				subaction: 'defaultSubaction'
			}
		}
	};

})( window, jQuery );

(function ( window, $ ) {
	
	var AjaxButton = function(elem, options) {
		this.elem = elem;
		this.$elem = $(elem);
		this.options = options;
		this.metadata = $.extend({ }, this.$elem.data('ajaxbutton'));
		this.metadata.ajaxcall = $.extend({ }, this.$elem.data('ajaxcall'));
		this.metadata.ajaxcall.data = $.extend({ }, this.$elem.data('ajaxdata'));
	}
	
	AjaxButton.prototype = {
		defaults: {
			rid: '#defaultRID',
			selector: '.ajax-button',
			triggerEvents: true,
			useReplace: false,
			ajaxcall: $.AjaxCall.defaults,
			submitButton: false,
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
			beginFunc: function() {},
			endFunc: function() {},
			replaceDNA: function() {
				var btn = this;
				this.getDNA().done(function(result) {
					var $btn = $(btn.rid);
					btn.beginFunc();
					if (btn.useReplace){
						$btn.empty();
						$btn.append($.trim(result));
					} else {
						$btn.html($.trim(result));
					}
					btn.endFunc();
					if (btn.triggerEvents) {
						$.event.trigger('ajaxButtonStop');
					}
				}).fail(function(error) {
					alert('There was an Error processing your request, please try again later.');
					if (btn.triggerEvents) {
						$.event.trigger('ajaxButtonStop');
					}
				})
			},
			runDNA: function() {
				if(this.submitButton) {
					var qs = this.$frm.serialize();
					this.ajaxcall.data = qs;
				};
				if (this.frmVal()){
					if (this.modelCB()) {
						this.replaceDNA();
					}
				}
			},
			frmVal: function() {
				if (this.formOptions.validate && this.submitButton){
					return this.$frm.validationEngine('validate');
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
			click: function() {
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
			if (this.config.submitButton) {
				this.initAjaxForm();
			}
			this.click = this.config.click;
			return this;
		}
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
	
	$.CreateAjaxButton = function(selector, options) {
		$(selector).AjaxButton(options);
	}
	
	window.AjaxButton = AjaxButton;
})( window, jQuery );
(function ( window, $ ) {
	
	var AjaxSelect = function(elem, options) {
		this.elem = elem;
		this.$elem = $(elem);
		this.options = options;
		this.metadata = $.extend({ }, this.$elem.data('ajaxselect'));
		this.metadata.ajaxcall = $.extend({ }, this.$elem.data('ajaxcall'));
		this.metadata.ajaxcall.data = $.extend({ }, this.$elem.data('ajaxdata'));
	}
	
	AjaxSelect.prototype = {
		defaults: {
			rid: '#defaultRID',
			selector: '.ajax-select',
			initAfter: true,
			triggerEvents: true,
			useReplace: false,
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
			beginFunc: function() {},
			endFunc: function() {},
			replaceDNA: function() {
				var sel = this;
				this.getDNA().done(function(result) {
					var $sel = $(sel.rid);
					sel.beginFunc();
					if (sel.useReplace){
						$sel.empty();
						$sel.after($.trim(result));
					} else {
						$sel.html($.trim(result));
					}
					sel.endFunc();
					if (sel.triggerEvents) {
						$.event.trigger('ajaxSelectStop');
					}
				}).fail(function(error) {
					alert('There was an Error processing your request, please try again later.');
					if (sel.triggerEvents) {
						$.event.trigger('ajaxSelectStop');
					}
				})
			},
			runDNA: function() {
				if(this.submitOnChange) {
					var qs = this.$frm.serialize();
					this.ajaxcall.data = qs;
				};
				if (this.frmVal()){
					if (this.modelCB()) {
						this.replaceDNA();
					}
				}
			},
			frmVal: function() {
				if (this.formOptions.validate && this.submitOnChange){
					return this.$frm.validationEngine('validate');
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
