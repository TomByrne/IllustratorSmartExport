(function(pack){
	function ExportPanel(container, exportSettings){
		this.init(container, exportSettings);
		return this;
	}

	ExportPanel.prototype={
		onCancelClicked:null,
		onSaveCloseClicked:null,
		onExportClicked:null,
		onIgnoreWarningsChanged:null,

		init:function(container, exportSettings){
			var scopedThis = this;
			this.exportSettings = exportSettings;

			// progress bar
			this.progBar = container.add( 'progressbar', undefined, 0, 100 );
			this.progBar.size = [820,10];

			// main row
			var mainRow = container.add('group', undefined, ''); 
			mainRow.size = [820, 30];
			mainRow.orientation = 'row'


			// options row
			var optionRow = mainRow.add('group', undefined, ''); 
			optionRow.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP];
			optionRow.orientation = 'row'

			
			this.ignoreCheckBox = optionRow.add('checkbox', undefined, 'Ignore Warnings');
			this.ignoreCheckBox.value = exportSettings.ignoreWarnings;
			this.ignoreCheckBox.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.BOTTOM];
			this.ignoreCheckBox.onClick = function() {
				scopedThis.exportSettings.ignoreWarnings = scopedThis.ignoreCheckBox.value;
				if(scopedThis.onIgnoreWarningsChanged)scopedThis.onIgnoreWarningsChanged();
			};


			// buttons row
			var buttonRow = mainRow.add('group', undefined, ''); 
			buttonRow.alignment = [ScriptUI.Alignment.RIGHT, ScriptUI.Alignment.TOP];
			buttonRow.orientation = 'row'

			var cancelBtn = buttonRow.add('button', undefined, 'Cancel', {name:'cancel'});
			cancelBtn.preferredSize = [80, 22];
			cancelBtn.onClick = function() { 
				if(scopedThis.onCancelClicked)scopedThis.onCancelClicked();
			};

			// Save button
			var saveBtn = buttonRow.add('button', undefined, 'Done', {name:'save'});
			saveBtn.preferredSize = [100, 22];
			saveBtn.onClick = function() {
				if(scopedThis.onSaveCloseClicked)scopedThis.onSaveCloseClicked();
			};

			// OK button
			var exportBtn = buttonRow.add('button', undefined, 'Export', {name:'ok'});
			exportBtn.preferredSize = [100, 22];
			exportBtn.onClick = function() { 
				if(scopedThis.onExportClicked)scopedThis.onExportClicked();
			};
		},
		updateSettings:function(){
			this.ignoreCheckBox.value = this.exportSettings.ignoreWarnings;
		},
		setProgress:function(prog, total){
			this.progBar.value = prog / total * 100;
		}
	};
	pack.ExportPanel = ExportPanel;
})(smartExport)