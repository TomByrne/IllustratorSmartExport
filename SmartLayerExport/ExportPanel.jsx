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
			this.progBar.size = [420,10];


			// buttons row
			row = container.add('group', undefined, ''); 
			row.orientation = 'row'

			var cancelBtn = row.add('button', undefined, 'Cancel', {name:'cancel'});
			cancelBtn.preferredSize = [80, 22];
			cancelBtn.onClick = function() { 
				if(scopedThis.onCancelClicked)scopedThis.onCancelClicked();
			};

			var saveBtn = row.add('button', undefined, 'Save and Close', {name:'save'});
			saveBtn.preferredSize = [100, 22];
			saveBtn.onClick = function() {
				if(scopedThis.onSaveCloseClicked)scopedThis.onSaveCloseClicked();
			};

			// OK button
			var exportBtn = row.add('button', undefined, 'Export', {name:'ok'});
			exportBtn.preferredSize = [100, 22];
			exportBtn.onClick = function() { 
				if(scopedThis.onExportClicked)scopedThis.onExportClicked();
			};
			
			this.ignoreCheckBox = row.add('checkbox', undefined, 'Ignore Warnings');
			this.ignoreCheckBox.value = exportSettings.ignoreWarnings;
			this.ignoreCheckBox.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.BOTTOM];
			this.ignoreCheckBox.onClick = function() {
				this.exportSettings.ignoreWarnings = scopedThis.ignoreCheckBox.value;
				if(scopedThis.onIgnoreWarningsChanged)scopedThis.onIgnoreWarningsChanged();
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