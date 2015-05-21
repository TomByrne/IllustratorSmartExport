(function(pack){
	function SaveSettingsDialog(){
		this.init();
		return this;
	}
	SaveSettingsDialog.prototype={

		controls:null,

		init:function(){
			var scopedThis = this;

			this.dialog = new Window('dialog', "Add New Preset");
			this.dialog.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP];

			var nameRow = this.dialog.add("group");
			nameRow.orientation = "row";
			nameRow.alignment = [ScriptUI.Alignment.CENTER, ScriptUI.Alignment.TOP];

			nameRow.add("statictext", undefined, "Preset name:");
			
			this.input = nameRow.add("edittext", undefined, "");
			this.input.preferredSize = [190, 22];
			
			this.generalCheckbox = this.dialog.add("checkbox", undefined, "Save Destination Folder");
			this.generalCheckbox.value = true;
			this.generalCheckbox.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP];

			this.formatCheckbox = this.dialog.add("checkbox", undefined, "Save Format Settings");
			this.formatCheckbox.value = true;
			this.formatCheckbox.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP];
			this.formatCheckbox.onClick = function(){
				scopedThis.patternCheckbox.enabled = scopedThis.formatCheckbox.value;
			}
			
			this.patternCheckbox = this.dialog.add("checkbox", undefined, "Save Filename Patterns");
			this.patternCheckbox.value = true;
			this.patternCheckbox.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP];

			var buttonRow = this.dialog.add("group");
			buttonRow.orientation = "row";
			buttonRow.alignment = [ScriptUI.Alignment.CENTER, ScriptUI.Alignment.TOP];

			this.cancelButton = buttonRow.add('button', undefined, 'Cancel', {name:'cancel'});
			this.cancelButton.onClick = function() { 
				scopedThis.dialog.close();
			};

			this.saveButton = buttonRow.add('button', undefined, 'Save', {name:'ok'});
			this.saveButton.onClick = function() {
				if(!scopedThis.input.text){
					alert("Please choose a name for these settings");
					return;
				}
				scopedThis.text = scopedThis.input.text;
				scopedThis.patterns = scopedThis.patternCheckbox.value;
				scopedThis.generalSettings = scopedThis.generalCheckbox.value;
				scopedThis.formatSettings = scopedThis.formatCheckbox.value;
				scopedThis.dialog.close();
			};

			this.dialog.show();
		}
	};
	pack.SaveSettingsDialog = SaveSettingsDialog;
})(smartExport)