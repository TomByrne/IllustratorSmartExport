(function(pack){
	function SaveSettingsDialog(){
		this.init();
		return this;
	}
	SaveSettingsDialog.prototype={

		controls:null,

		init:function(){
			var scopedThis = this;

			this.dialog = new Window('dialog', "Settings name");
			this.dialog.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP];
			
			this.input = this.dialog.add("edittext", undefined, "");
			this.input.preferredSize = [220, 22];
			
			this.patternCheckbox = this.dialog.add("checkbox", undefined, "Save Filename Patterns");
			this.patternCheckbox.value = true;
			this.patternCheckbox.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP];
			
			this.generalCheckbox = this.dialog.add("checkbox", undefined, "Save General Settings");
			this.generalCheckbox.value = true;
			this.generalCheckbox.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP];

			this.formatCheckbox = this.dialog.add("checkbox", undefined, "Save Format Settings");
			this.formatCheckbox.value = true;
			this.formatCheckbox.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP];

			var buttonRow = this.dialog.add("group");
			buttonRow.orientation = "row";
			buttonRow.alignment = [ScriptUI.Alignment.CENTER, ScriptUI.Alignment.TOP];

			this.cancelButton = buttonRow.add('button', undefined, 'Cancel', {name:'cancel'});
			this.cancelButton.onClick = function() { 
				scopedThis.dialog.close();
			};

			this.saveButton = buttonRow.add('button', undefined, 'Save', {name:'ok'});
			this.saveButton.onClick = function() {
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