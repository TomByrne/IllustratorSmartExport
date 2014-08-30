(function(pack){
	function ExportPanel(container, ignoreWarnings){
		this.init(container, ignoreWarnings);
		return this;
	}

	ExportPanel.prototype={
		onCancelClicked:null,
		onSaveCloseClicked:null,
		onExportClicked:null,
		onIgnoreWarningsChanged:null,

		init:function(container, ignoreWarnings){
			var scopedThis = this;
			this.ignoreWarnings = ignoreWarnings;

			// progress bar
			this.progBar = container.add( 'progressbar', undefined, 0, 100 );
			this.progBar.size = [400,10];


			// buttons row
			row = container.add('group', undefined, ''); 
			row.orientation = 'row'

			var cancelBtn = row.add('button', undefined, 'Cancel', {name:'cancel'});
			cancelBtn.onClick = function() { 
				if(scopedThis.onCancelClicked)scopedThis.onCancelClicked();
			};

			var saveBtn = row.add('button', undefined, 'Save and Close', {name:'save'});
			saveBtn.onClick = function() {
				if(scopedThis.onSaveCloseClicked)scopedThis.onSaveCloseClicked();
			};

			// OK button
			var exportBtn = row.add('button', undefined, 'Export', {name:'ok'});
			exportBtn.onClick = function() { 
				if(scopedThis.onExportClicked)scopedThis.onExportClicked();
			};
			
			this.ignoreCheckBox = row.add('checkbox', undefined, 'Ignore Warnings');
			this.ignoreCheckBox.value = ignoreWarnings;
			this.ignoreCheckBox.onClick = function() {
				scopedThis.ignoreWarnings = scopedThis.ignoreCheckBox.value;
				if(scopedThis.onIgnoreWarningsChanged)scopedThis.onIgnoreWarningsChanged();
			};
		},
		setProgress:function(prog, total){
			this.progBar.value = prog / total * 100;
		}
	};
	pack.ExportPanel = ExportPanel;
})(smartExport)