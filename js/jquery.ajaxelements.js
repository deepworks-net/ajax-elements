/**

	Will Document This At Some Point
	
	This lib depends on JQuery and JQuery plugin factory.
	
*/
;(function ( $ ) {

	
	$.plugin('ElementX', {
		defaults: {
			e: undefined,
			preventDefault: false
		},
		framework: {
			_execute: function(options) { },
			_run: function(options) {
				this._execute(options);
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
				this.config._run.apply(this.config, arguments);
			}
		},
		builder: {
			metadataFn: function() {
				return { 
					"e": this.$elem.attr('data-event'),
					"preventDefault": $.toBoolUn(this.$elem.attr('data-prevent-default'))
				};
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
	
	/**
		Make so can trigger numerous elements, with different events?
		If no target, have a default class for the target?
	*/
	$.plugin('TriggerElement', {
		defaults: {
			autoTrigger: true,
			triggerOnce: false,
			target: undefined,
			triggerEvent: undefined,
			triggerFunc: function() {}
		},
		framework: {
			_triggered: false,
			_execute: function(options) {
				if (!this._triggered || !this.triggerOnce) {
					this._trigger(options);
					this._triggered = true;
				}
			},
			_trigger: function(options) {
				if (this.autoTrigger && this.target && this.triggerEvent) {
					$(this.target).trigger(this.triggerEvent);
				}
				/* Should this be moved up? */
				this.triggerFunc();
			}
		},
		builder: {
			metadataFn: function() {
				return {
					"autoTrigger": $.toBoolUn(this.$elem.attr('data-auto-trigger')),
					"triggerOnce": $.toBoolUn(this.$elem.attr('data-trigger-once')),
					"target": this.$elem.attr('data-target'),
					"triggerEvent": this.$elem.attr('data-trigger-event')
				};
			},
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
			eventStart: 'ajaxStart.AE',
			eventStop: 'ajaxStop.AE',
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
			alwaysFunc: function() {},
			replaceFunc: function(result,success) {
				if (this.$rid) {
					if (this.useReplace){
						this.$rid.empty();
						this.$rid.append($.trim(result));
					} else {
						this.$rid.html($.trim(result));
					}
				}
			},
			doneCallbacks: [],
			alwaysCallbacks: [],
			failCallbacks: []
		},
		framework: {
			_buildEvent: function () {
				if (this.triggerEvents) {
					$.event.trigger(this.eventStart);
				}
			},
			_ajaxFunc: function(options) {
				this._buildEvent();
				return $.ajax($.extend(true,{},this.ajaxcall,options));
			},
			_execute: function(ajaxcall,done,fail,always) {
				var api = this;
				this.blockFunc();
				this.preStartFunc();
				this._ajaxFunc(ajaxcall).done(function(result,status,success){
					api.beginFunc(result,success);
					api.replaceFunc(result,success);
					api.endFunc(result,success);
					api.successFunc(success);
				}, this.doneCallbacks, done).fail(function(error){
					if (error.status === 401) {
						api.unAuthFunc(error);
					} else {
						api.errorFunc(error);
					}
				}, this.failCallbacks, fail).always(function(){
					if (api.triggerEvents) {
						$.event.trigger(api.eventStop);
					}
					api.alwaysFunc();
					api.unblockFunc();
				}, this.alwaysCallbacks, always);
			}
		},
		builder: {
			metadataFn: function() {
				var elem = this.$elem;
				var toteURL = elem.attr('data-url');
				var metadata = $.extend({ }, elem.attr('data-ajaxelement'), {
					rid: elem.attr('data-rid'),
					eventStart: elem.attr('data-event-start'),
					eventStop: elem.attr('data-event-stop'),
					eventSpace: elem.attr('data-event-space'),
					triggerEvents: $.toBoolUn(elem.attr('data-trigger-events')),
					useReplace: $.toBoolUn(elem.attr('data-replace')),
					blockID: elem.attr('data-blockID')
				});
				metadata.ajaxcall = $.extend(true, {}, elem.data('ajaxcall'), { 
					url: toteURL
				});
				metadata.ajaxcall.data = $.extend(true, {}, elem.data('ajaxdata'), $.parseParams(toteURL));
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
			e: 'click'
		}
	}, 'AjaxElement');
	
	$.plugin('AjaxSelect', {
		defaults: {
			e: 'change'
		},
		framework: {
			_run: function(options,done,fail,always) {
				var object = {};
				var dataobj = $.extend({}, { name: this.$elem.attr('name')}, { name: this.$elem.attr('data-sendname')});
				object[dataobj.name] = this.elem.value;
				this.ajaxcall.data = $.extend({ }, this.ajaxcall.data, object);
				this._execute(options,done,fail,always);
			}
		}
	}, 'AjaxElement');
	
	$.plugin('AjaxForm', {
		defaults: {
			e: 'submit',
			useNew: false,
			validate: false,
			catchEnter: true,
			preventDefault: true,
			frmdataFunc: function() {
				var qs;
				if (this.useNew) {
					var frmData = this.$elem.serializeObject();
					qs = $.extend(true, {}, this.ajaxcall.data, frmData);
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
			_unsaved: false,
			_isUnSaved: function(us) {
				if (us !== undefined) { this._unsaved = us; } else { return this._unsaved; }
			},
			_run: function(options,done,fail,always) {
				var that = this;
				//make something that goes through all conditional run functions?
				this.frmdataFunc();
				if(this._validate()) {
					this._execute(options,[function(result,status,success){ 
						that._unsaved = false; 
					},done],fail,always);
				}
			},
			_validate: function() {
				if (this.validate) {
					return this.validateFunc();
				}
				return true;
			}
		},
		methods: {
			unSaved: function(us) {
				return this.config._isUnSaved.apply(this.config, arguments);
			}
		},
		builder: {
			metadataFn: function() {
				return {
					validate: $.toBoolUn(this.$elem.attr('data-validate')),
					catchEnter: $.toBoolUn(this.$elem.attr('data-catch-enter')),
					ajaxcall: {
						type: this.$elem.attr('method'),
						url: this.$elem.attr('action')
					}
				};
			},
			initFn: function() {
				var that = this;
				var changeFunc = function(e){
					that.config._isUnSaved(true);
				};
				this.$elem.on('change.ae.af', ':input', changeFunc)
					.on('input.ae.af', ':input', changeFunc)
					.on('keyup.ae.af', ':input', changeFunc);
				return this;
			},
			destFn: function() {
				this.$elem.off('change.ae.af');
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
			_run: function(options,done,fail,always) {
				if (this.loaded === 0) {
					this._execute(options,done,fail,always);
					if (this.loadOnce) { this.loaded = 1; }
				}
				
			}
		},
		builder: {
			metadataFn: function() {
				return {
					loadOnce: $.toBoolUn(this.$elem.attr('data-load-once'))
				};
			}
		}
	}, 'AjaxElement');
	
	$.plugin('AjaxAdvancedForm', {
		defaults: {
			data: null,
			loadCallback: function(obj) {},
			frmdataFunc: function() {
				//Pull this out to ajax form once stable (for legacy code?)
				this.ajaxcall.data = (this.useNew === true) ? this.$elem.serializeObject() : this.$elem.serialize();
			},
			inputData: {
				select: {
					"set": function(obj) {
						$(this).val(obj);
					},
					"init": function() {},
					"get": function() {
						return $(this).val();
					}
				},
				text: {
					"set": function(obj) {
						$(this).val(obj);
					},
					"init": function() {},
					"get": function() {
						return $(this).val();
					}
				},
				input: {
					"set": function(obj) {
						$(this).text(obj);
					},
					"init": function() {},
					"get": function() {
						return $(this).text();
					}
				}
			}
		},
		framework: {
			_load: function(obj, rescan) {
				var o2 = (obj.data) ? obj.data : obj;
				$.each(this._model, function(i, obj){
					var s = i.split('.'), m = o2[s[0]];
					for (var a = 1; a < s.length; a++) { m = m[s[a]]; }
					if (m !== undefined) { obj.set.apply(obj.dom, [m]); }
				});
				/*Rebuild the Model*/
				if (rescan) { this._reScan(); };
				this.loadCallback(o2);
			},
			_reset: function() {
				var r_o = {}, model = this._model;
				var convObj = function(obj, key, val) {
					var keys = key.split('.');
					var thisKey = keys[0];
					obj[thisKey] = val;
					if (keys.length !== 1) { obj[thisKey] = convObj({},key.substr( key.indexOf('.') + 1 ), val); }
					return obj;
				};
				$.each(this._map, function(i, obj) {
					var s = obj.split('.')[0];
					var r = convObj({},obj,model[obj].value);
					r_o[s] = r[s];
				});
				this._load(r_o);
				this._unsaved = false;
			},
			_reScan: function() {
				this._obj = this.$elem.serializeObject();
				var $inputs = this.$elem.find('[data-input-map]');
				var config = this;
				var inputs = {}, map = {};
				$.each($inputs, function(i, obj) {
					var $o = $(obj);
					var mName = $o.attr('data-input-map');
					var type = $o.attr('data-input-type');
					/* Adding default for non-inputs */
					var asInput = ($.toBoolUn($o.attr('data-input')) === true) ? true : false;
					// Temporary 'Fix'?
					if (type === undefined && asInput) type = 'input'; 
					var name = $o.attr('name');
					/*Default to the type if no data-input-type?*/
					/* Updated to work with custom options */
					var setFunc = (type === 'select') ? config.inputData.select.set : config.inputData.text.set;
					if (config.inputData[type] && config.inputData[type].set) {
						setFunc = config.inputData[type].set;
					}
					/*Does Not Support Multiples Yet*/
					map[name] = mName;
					var val = (config.inputData[type] && config.inputData[type].get !== undefined) ? config.inputData[type].get.apply(obj) : $o.val();
					inputs[mName] = {
						"map_id": mName,
						"type": type,
						"dom": obj,
						"name": name,
						"value": val,
						"set": setFunc
					}
				});
				this._model = inputs;
				this._map = map;
			},
			_map: {},
			_obj: {},
			_model: {}
		},
		methods: {
			"load": function(obj, rescan) {
				this.config._load.apply(this.config, arguments);
				return this.$elem;
			},
			"reset": function() {
				this.config._reset.apply(this.config, arguments);
				return this.$elem;
			},
			"scan": function() {
				this.config._reScan.apply(this.config, arguments);
				return this.$elem;
			},
			"get" :function() {
				/*Update this to return the model that is just the values?*/
				return this.config._model;
			}
		},
		/*expand to just use name if it does not need mapping...*/
		builder: {
			initFn: function() {
				this.config.$elem = this.$elem;
				this.config._reScan.apply(this.config);
				if (this.config.data) {
					this.config._load.apply(this.config, [this.config, true]);
				}
				return this;
			},
			metadataFn: function() {
				return {
					load_url: this.$elem.attr('data-url')
				}
			}
		}
	}, 'AjaxForm');
	
	/*Row Prefix - add ID automatically to the row?*/
	$.plugin('TemplateTable', {
		defaults: {
			data: null,
			key: 'sku',
			dTemplate: null,
			eTemplate: null,
			aTemplate: null,
			container: 'body',
			handles: {
				addHandle: '.add-button',
				editHandle: 'tr .edit-button',
				cancelHandle: '.cancel-button',
				cAddRowHandle: 'tr.add .cancel-button',
				cEditRowHandle: 'tr.edit .cancel-button'
			},
			removeRowFunc: function() {},
			templateFunc: function(obj, template) { return ""; },
			addAddRowCallback: function() {},
			addEditRowCallback: function(row, data) {},
			addDefRowCallback: function(row, data) {},
			drawCallback: function() {},
			getNewObject: function() { return {}; },
			getRowId: function(row) { return $(row).attr('id'); },
			findCompareFunc: function(data, id) { return data === id; },
			sortCompareFunc: null
		},
		framework: {
			_rows: null,
			_newCount: 1,
			_clearTable: function() {
				this.table.find('tbody').empty();
			},
			_drawTable: function(data) {
				var that = this;
				this._clearTable();
				$.each(this._rows, function(i,v) {
					var row = that.templateFunc(v,that.dTemplate);
					that.table.append(row);
					that.addDefRowCallback(row, v);
				});
				this.drawCallback();
				this.table.trigger('draw.tt', [this]);
			},
			_setData: function(data, draw) {
				this._rows = data;
				if (draw !== false) { this._drawTable(); }
			},
			_find: function(id) {
				var that = this;
				return this._rows.find(function(data) {
					return that.findCompareFunc(data, id);
				});
			},
			_findIndex: function(id) {
				var that = this;
				return this._rows.findIndex(function(data) {
					return that.findCompareFunc(data, id);
				});
			},
			_append: function(obj, template) {
				var t = this.templateFunc(obj, template);
				this.table.append(t);
				return t;
			},
			_resetTable: function() {
				this._clearTable();
				this._drawTable();
				this.table.trigger('reset.tt', [this]);
			},
			_getRows: function() {
				return this._rows;
			},
			_sort: function() {
				this._rows.sort(this.sortCompareFunc);
			},
			_handleReplaceData: function(data) {
				var i = this._findIndex(data[this.key]);
				if (i !== -1) { 
					this._rows[i] = data;
				} else {
					this._rows.push(data);
				}
				this._sort();
			},
			_updateData: function(data, draw) {
				var that = this;
				$.each(data, function(i, ch){
					that._handleReplaceData(ch);
				});
				if (draw !== false) { this._drawTable(); }
			}
		},
		methods: {
			load: function(){
				this.config._drawTable.apply(this.config, arguments);
				return this.$elem;
			},
			data: function(data, draw) {
				this.config._setData.apply(this.config, arguments);
				return this.$elem;
			},
			reset: function() {
				this.config._resetTable.apply(this.config, arguments);
				return this.$elem;
			},
			rows: function() {
				return this.config._getRows.apply(this.config, arguments);
			},
			update: function(data, draw) {
				this.config._updateData.apply(this.config, arguments);
				return this.$elem;
			},
			find: function(id) {
				return this.config._find.apply(this.config, arguments);
			}
		},
		builder: {
			metadataFn: function() {
				return { 
					"container": this.$elem.attr('data-container'),
					"dTemplate": this.$elem.attr('data-default-template'),
					"eTemplate": this.$elem.attr('data-edit-template'),
					"aTemplate": this.$elem.attr('data-add-template'),
					"handles": {
						"addHandle": this.$elem.attr('data-add-handle'),
						"editHandle": this.$elem.attr('data-edit-handle'),
						"cancelHandle": this.$elem.attr('data-cancel-handle'),
						"cAddRowHandle": this.$elem.attr('data-add-row-handle'),
						"cEditRowHandle": this.$elem.attr('data-edit-row-handle')
					}
				};
			},
			initFn: function() {
				var config = this.config, that = this;
				config.table = this.$elem;
				config._rows = this.config.data || [];
				var cc = $(config.container);
				cc.off('.tt');
				if (config.handles.addHandle) {
					cc.on('click.tt', config.handles.addHandle, function(e) {
						e.preventDefault();
						var tr = config._append(config.getNewObject(), config.aTemplate);
						config.addAddRowCallback($(tr));
						config.drawCallback();
						config._newCount++;
					});
				};
				if (config.handles.cAddRowHandle) {
					cc.on('click.tt', config.handles.cAddRowHandle, function(e){
						e.preventDefault();
						$(this).closest('tr').remove();
						config.drawCallback();
					});
				}
				if (config.handles.cEditRowHandle) {
					cc.on('click.tt', config.handles.cEditRowHandle, function(e){
						e.preventDefault();
						var tr = $(this).closest('tr');
						/* Move this out, that way it can be called in any cancel method! Also, add addRow, removeRow, ect... */
						var obj = config._find(config.getRowId(tr));
						//CHECK FOR UNDEFINED?
						var nTr = config.templateFunc(obj, config.dTemplate);
						tr.replaceWith(nTr);
						config.addDefRowCallback($(nTr), obj);
						config.drawCallback();
					});
				}
				if (config.handles.editHandle) {
					cc.on('click.tt', config.handles.editHandle, function(e) {
						e.preventDefault();
						var tr = $(this).closest('tr');
						var obj = config._find(config.getRowId(tr));
						var nTr = config.templateFunc(obj, config.eTemplate);
						tr.replaceWith(nTr);
						config.addEditRowCallback($(nTr), obj);
						config.drawCallback();
					});
				}
				config._drawTable();
				return this;
			}
		}
	});
	
})( jQuery );