(function(pack){
	function ImportDialog(){
		this.init();
		return this;
	}
	ImportDialog.prototype={

		controls:null,

		init:function(){
			var scopedThis = this;

			this.dialog = new Window('dialog', "Where to Import?");
			this.dialog.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP];

			this.dialog.add("statictext", undefined, "Import settings into presets or into current settings?");



			var buttonRow = this.dialog.add("group");
			buttonRow.orientation = "row";
			buttonRow.alignment = [ScriptUI.Alignment.CENTER, ScriptUI.Alignment.TOP];

			this.presetButton = buttonRow.add('button', undefined, 'Presets');
			this.presetButton.onClick = function() {
				scopedThis.dest = "presets";
				scopedThis.dialog.close();
			};

			this.saveButton = buttonRow.add('button', undefined, 'Current', {name:'ok'});
			this.saveButton.onClick = function() {
				scopedThis.dest = "current";
				scopedThis.dialog.close();
			};

			this.dialog.show();
		}
	};
	pack.ImportDialog = ImportDialog;
})(smartExport)