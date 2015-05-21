(function(pack){
	function ExportDialog(presetDir, settingsExt){
		this.presetDir = presetDir;
		this.settingsExt = settingsExt;
		this.init();
		return this;
	}
	ExportDialog.prototype={

		controls:null,

		init:function(){
			var scopedThis = this;

			this.dialog = new Window('dialog', "Export which settings?");
			this.dialog.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP];

			this.presetList = this.dialog.add ('ListBox', [0, 0, 200, 200], '', 
									{numberOfColumns: 1, showHeaders: false, multiselect:false,
									columnTitles: ['Format'] });

			this.presetList.add("item", "--- Current Settings ---");
			var allFiles = this.presetDir.getFiles();
			this.files = [];
			for(var i=0; i<allFiles.length; ++i){
				var file = allFiles[i];
				var extIndex = file.name.indexOf(this.settingsExt);
				if(extIndex==-1)continue;
				var fileName = file.name.substr(0, extIndex);
				fileName = decodeURIComponent(fileName);
				this.presetList.add("item", fileName);
				this.files.push(file);
			}
			this.presetList.selection = 0;



			var buttonRow = this.dialog.add("group");
			buttonRow.orientation = "row";
			buttonRow.alignment = [ScriptUI.Alignment.CENTER, ScriptUI.Alignment.TOP];

			this.cancelButton = buttonRow.add('button', undefined, 'Cancel', {name:'cancel'});
			this.cancelButton.onClick = function() { 
				scopedThis.dialog.close();
			};

			this.saveButton = buttonRow.add('button', undefined, 'Save', {name:'ok'});
			this.saveButton.onClick = function() {
				if(scopedThis.presetList.selection==null){
					alert("Please select settings to export");
					return;
				}
				if(scopedThis.presetList.selection==0){
					scopedThis.settings = "current";
				}else{
					scopedThis.settings = allFiles[scopedThis.presetList.selection-1];
				}
				scopedThis.dialog.close();
			};

			this.dialog.show();
		}
	};
	pack.ExportDialog = ExportDialog;
})(smartExport)