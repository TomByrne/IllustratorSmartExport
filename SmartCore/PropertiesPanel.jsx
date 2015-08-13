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

			this.dialog = new Window('dialog', formatSettings.formatRef.name+" Settings");
			this.dialog.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP];
			this.dialog.spacing = 9;

			this.formatSettings = formatSettings;

			this.controls = [];

			var settings = this.formatSettings.options;
			var properties = formatSettings.formatRef.more;
			var control;
			for(var i=0; i<properties.length; i++){
				var prop = properties[i];

				var row = this.dialog.add("group");
				row.orientation = "row";
				row.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP];

				var value = (settings[prop.id]!=null ? settings[prop.id] : prop.def);
				switch(prop.type){
					case "boolean":
						row.add("statictext", [0,0,this.labelColumnW, 20], "");
						control = row.add('checkbox', undefined, prop.name);
						if(value!=null)control.value = value;
						this.controls.push(control);
						break;

					case "number":
						row.add("statictext", [0,0,this.labelColumnW, 20], prop.name+":");
						control = new pack.NumberControl(row, value, prop.optionalProp!=null, prop.unit);
						this.controls.push(control);
						break;

					case "string":
						row.add("statictext", [0,0,this.labelColumnW, 20], prop.name+":");
						control = new pack.StringControl(row, value, prop.optionalProp!=null);
						this.controls.push(control);
						break;

					case "list":
						row.add("statictext", [0,0,this.labelColumnW, 20], prop.name+":");
						var names = [];
						for(var j=0; j<prop.options.length; j++){
							names.push(prop.options[j].name);
						}
						control = row.add('dropdownlist', undefined, names);
						control.preferredSize = [200, 20];
						if(value!=null)control.selection = value;
						this.controls.push(control);
						break;

					case "range":
						row.add("statictext", [0,0,this.labelColumnW, 20], prop.name+":");
						control = new pack.RangeControl(row, prop.min, prop.max, value);
						this.controls.push(control);
						break;

					case "percent":
						row.add("statictext", [0,0,this.labelColumnW, 20], prop.name+":");
						control = new pack.RangeControl(row, 0, 100, value, "%");
						this.controls.push(control);
						break;

					case "color":
						row.add("statictext", [0,0,this.labelColumnW, 20], prop.name+":");
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
							this.createOptionalCheckbox(row, prop, value, i);
						}else{
							row.add("statictext", [0,0,this.labelColumnW, 20], prop.name+":");
						}
						control = new pack.MarginControl(row, linkable, value, isLinked);
						this.controls.push(control);
						break;
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

		createOptionalCheckbox:function(row, prop, isActive, ind){
			var checkbox = row.add("checkbox", [0,0,this.labelColumnW, 20], prop.name+":");
			checkbox.value = isActive;
			checkbox.onClick = closure(this, this.onOptionalClick, [checkbox, prop, ind]);
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
			var properties = this.formatSettings.formatRef.more;
			var control;
			for(var i=0; i<properties.length; i++){
				var prop = properties[i];
				var control = this.controls[i];
				var value;
				switch(prop.type){
					case "boolean":
						value = control.value;
						break;

					case "list":
						value = control.selection.index;
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
			}
			this.dialog.close();
		}
	};
	pack.PropertiesPanel = PropertiesPanel;
})(smartExport)