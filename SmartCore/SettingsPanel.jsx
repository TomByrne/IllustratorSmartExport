(function(pack){
	function SettingsPanel(container, exportSettings){
		this.init(container, exportSettings);
		return this;
	}

	SettingsPanel.prototype={
	    onPatternChanged:null,
	    onScalingChanged:null,
	    onDirectoryChanged:null,

		init:function(container, exportSettings){
			var scopedThis = this;
			this.exportSettings = exportSettings;

			var row;
			var column = container.add('group')
			column.orientation = 'column';
			column.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP];

			// DIR GROUP
			row = column.add( 'group', undefined, '') 
			row.orientation = 'row'
			row.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP]

			var chooseBtn = row.add('button', undefined, 'Output Directory...' );
			chooseBtn.onClick = function() {
				var file = new Folder(scopedThis.exportSettings.directory).selectDlg();
				if(!file)return;

				scopedThis.directoryInput.text = file.fsName;
				scopedThis.directoryInput.onChange();
			}

			this.directoryInput = row.add('edittext', undefined, exportSettings.directory); 
			this.directoryInput.size = [ 440,20 ];
			this.directoryInput.onChange = function(){
				scopedThis.exportSettings.directory = scopedThis.directoryInput.text;
				if(scopedThis.onDirectoryChanged)scopedThis.onDirectoryChanged();
			}
		},

		updateSettings:function(){
			this.directoryInput.text = this.exportSettings.directory;
		}
	};
	pack.SettingsPanel = SettingsPanel;
})(smartExport)