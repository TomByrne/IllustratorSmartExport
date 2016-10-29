(function(pack){
	function PropertiesPanel(formatSettings){
		this.init(formatSettings);
		return this;
	}
	PropertiesPanel.prototype={

		controls:null,
		labelColumnW:130,

		init:function(formatSettings){
			var scopedThis = this;

			var categories = formatSettings.formatRef.more;
			var doCatList = (categories.length>1);

			this.dialog = new Window('dialog', formatSettings.formatRef.name+" Settings");
			this.dialog.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP];
			this.dialog.spacing = 9;

			this.formatSettings = formatSettings;

			var mainPanel;
			var firstPanel;
			if(doCatList){

				this.labelColumnW = 180;

				firstPanel = this.dialog.add("group");
				firstPanel.orientation = "column";
				firstPanel.alignment = [ScriptUI.Alignment.RIGHT, ScriptUI.Alignment.TOP];

				var row = this.dialog.add("group");
				row.orientation = "row";
				row.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP];

				this.catList = row.add ('ListBox', [0, 0, 160, 345], '', 
										{numberOfColumns: 1, showHeaders: false, multiselect:false,
										columnTitles: ['Category'] });
				this.catList.itemSize = [160, 42];
				this.catList.orientation = "column";
				this.catList.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP];
				for(var k=1; k<categories.length; k++){
					var category = categories[k];
					var item = this.catList.add("item");
					item.text = category.name;
				}
				this.catList.selection = 0;
				this.catList.onChange = function(){
					if(scopedThis.catList.selection===null){
						scopedThis.catList.selection = 0;
					}
					for(var i=0; i<scopedThis.categoryPanels.length; i++){
						scopedThis.categoryPanels[i].visible = (scopedThis.catList.selection.index == i);
					}
				}

				mainPanel = row.add("panel");
				mainPanel.preferredSize = [null, 346];
				mainPanel.orientation = "stack";
				mainPanel.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP];
			}else{
				mainPanel = this.dialog;
			}

			this.controls = [];

			var settings = this.formatSettings.options;
			this.categoryPanels = [];
			for(var k=0; k<categories.length; k++){
				var category = categories[k];
				var properties = category.options;
				var control;
				var controlCont;
				if(doCatList){
					if(k==0){
						controlCont = firstPanel;
					}else{
						controlCont = mainPanel.add("group");
						controlCont.orientation = "column";
						controlCont.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP];
						this.categoryPanels.push(controlCont);
						controlCont.visible = k==1;
					}
				}else{
					 controlCont = mainPanel;
				}
				var hasLabels = false;
				for(var i=0; i<properties.length; i++){
					var prop = properties[i];
					if(prop.type != "boolean"){
						hasLabels = true;
						break;
					}
				}
				for(var i=0; i<properties.length; i++){
					var prop = properties[i];

					var row = controlCont.add("group");
					row.orientation = "row";
					row.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP];

					var value = (settings[prop.id]!=null ? settings[prop.id] : prop.def);
					switch(prop.type){
						case "boolean":
							if(hasLabels) this.addLabel(row, "");
							control = row.add('checkbox', undefined, prop.name);
							if(value!=null)control.value = value;
							this.controls.push(control);
							break;

						case "number":
							this.addLabel(row, prop.name+":");
							control = new pack.NumberControl(row, value, prop.optionalProp!=null, prop.unit);
							this.controls.push(control);
							break;

						case "string":
							this.addLabel(row, prop.name+":");
							control = new pack.StringControl(row, value, prop.optionalProp!=null);
							this.controls.push(control);
							break;

						case "list":
							this.addLabel(row, prop.name+":");
							var names = [];
							var addSublist = false;
							for(var j=0; j<prop.options.length; j++){
								var option = prop.options[j];
								names.push(option.name);
								if(option.type == "list"){
									addSublist = true;
								}
							}
							var container;
							if(addSublist){
								container = row.add("group");
								container.orientation = "column";
								container.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP];
							}else{
								container = row;
							}
							//control = container.add('dropdownlist', undefined, names);
							control = new pack.Dropdown(container, names);
							control.setSize(200, 20);
							if(addSublist){
								//subControl = container.add('dropdownlist', undefined, names);
								subControl = new pack.Dropdown(container, names);
								subControl.setSize(200, 20);
								control.subControl = subControl;
								control.onChange = closure(this, this.onSuboptionChange, [control, subControl, prop]);
								if(settings[prop.id]!=null){
									var parts = value.split(",");
									control.setSelection(parts[0]);
									subControl.setSelection(parts[1]);
								}else{
									if(value!=null)control.setSelection(value);
								}
							}else{
								if(value!=null)control.setSelection(value);
							}
							this.controls.push(control);
							break;

						case "range":
							this.addLabel(row, prop.name+":");
							control = new pack.RangeControl(row, prop.min, prop.max, value);
							this.controls.push(control);
							break;

						case "percent":
							this.addLabel(row, prop.name+":");
							control = new pack.RangeControl(row, 0, 100, value, "%");
							this.controls.push(control);
							break;

						case "color":
							this.addLabel(row, prop.name+":");
							control = new pack.ColorPicker(row, value, prop.optional);
							this.controls.push(control);
							break;

						case "margin":
							if(typeof(value)=="string"){
								value = value.split(",");
								settings[prop.id] = value;
							}
							var linkable;
							var isLinked;
							if(prop.linkedProp){
								linkable = true;
								isLinked = settings[prop.linkedProp];
							}else{
								linkable = false;
								isLinked = false;
							}
							if(prop.optionalProp){
								this.createOptionalCheckbox(row, prop, value, this.controls.length);
							}else{
								this.addLabel(row, prop.name+":");
							}
							control = new pack.MarginControl(row, linkable, value, isLinked);
							this.controls.push(control);
							break;
					}
				}
			}

			var buttonRow = this.dialog.add("group");
			buttonRow.orientation = "row";
			buttonRow.alignment = [ScriptUI.Alignment.CENTER, ScriptUI.Alignment.TOP];

			this.cancelButton = buttonRow.add('button', undefined, 'Cancel', {name:'cancel'});
			this.cancelButton.onClick = function() { 
				scopedThis.onCancelClicked();
			};

			this.saveButton = buttonRow.add('button', undefined, 'Save', {name:'ok'});
			this.saveButton.onClick = function() {
				scopedThis.onSaveClicked();
			};

			this.dialog.show();
		},

		addLabel:function(row, label){
			var item = row.add("statictext", [0, 0, this.labelColumnW, 20], label, {multiline:true});
			item.alignment = [ScriptUI.Alignment.RIGHT, ScriptUI.Alignment.CENTER];
			return item;
		},

		createOptionalCheckbox:function(row, prop, isActive, ind){
			var checkbox = row.add("checkbox", [0,0,this.labelColumnW, 20], prop.name+":");
			checkbox.value = isActive;
			checkbox.onClick = closure(this, this.onOptionalClick, [checkbox, prop, ind]);
		},

		onSuboptionChange:function(dropdown, subDropdown, prop){
			var option = prop.options[dropdown.selection];
			if(option.type != "list"){
				subDropdown.setEnabled(false);
				subDropdown.setItems([]);
			}else{
				var subOptions = [];
				subDropdown.setEnabled(true);
				for(var i=0; i<option.options.length; i++){
					var subOption = option.options[i];
					//subDropdown.add("item", subOption.name);
					subOptions.push(subOption.name);
				}
				subDropdown.setItems(subOptions);
				subDropdown.setSelection(option.def);
			}
		},

		onOptionalClick:function(checkbox, prop, ind){
			var control = this.controls[ind];
			if(control.setEnabled!=null){
				control.setEnabled(checkbox.value);
			}else{
				control.enabled = checkbox.value;
			}
		},

		onCancelClicked:function(){
			this.dialog.close();
		},

		onSaveClicked:function(){
			var settings = this.formatSettings.options;
			var categories = this.formatSettings.formatRef.more;
			var j = 0;
			for(var k=0; k<categories.length; k++){
				var category = categories[k];
				var properties = category.options;
				var control;
				for(var i=0; i<properties.length; i++){
					var prop = properties[i];
					var control = this.controls[j];
					var value;
					switch(prop.type){
						case "boolean":
							value = control.value;
							break;

						case "list":
							if(control.subControl){
								value = control.selection + "," + (control.subControl.selection == null ? -1 : control.subControl.selection);
							}else{
								value = control.selection;
							}
							break;

						case "range":
						case "percent":
						case "string":
						case "number":
							value = control.getValue();
							break;

						case "color":
							value = control.getColorStr();
							break;

						case "margin":
							value = control.getMargins();
							if(value){
								value = value.join(",");
								if(prop.linkedProp){
									settings[prop.linkedProp] = control.getLinked();
								}
							}else{
								delete settings[prop.linkedProp];
							}
							break;
					}
					if(value==prop.def){
						delete settings[prop.id];
					}else{
						settings[prop.id] = value;
					}
					j++;
				}
			}
			this.dialog.close();
		}
	};
	pack.PropertiesPanel = PropertiesPanel;
})(smartExport)