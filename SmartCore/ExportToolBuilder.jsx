(function(pack){
	function ExportToolBuilder(docRef, title){
		this.init(docRef, title);
		return this;
	}

	pack.IGNORE_LAYERS = ["Export Settings", "Export Symbol Settings", "nyt_exporter_info"];

	ExportToolBuilder.prototype={
		prefsLayerName:         null,
		smartExportPrefs:       null,
		toolPanel:			    null,
		docRef:			        null,

		init: function(docRef, title) {
			this.docRef = docRef;
			this.title = title;
		},

		loadPrefLayer: function(prefsLayerName, migratePrefsLayerName) {
			this.prefsLayerName = prefsLayerName;
		
			try {
				this.smartExportPrefs = this.docRef.layers.getByName( prefsLayerName );

			} catch ( e ) {
				try {
					if(migratePrefsLayerName){
						this.smartExportPrefs = this.docRef.layers.getByName( migratePrefsLayerName );
					}

				} catch ( e ) {}

				if(!this.smartExportPrefs){
					this.smartExportPrefs = this.docRef.layers.add();
					this.smartExportPrefs.name = prefsLayerName;

					this.exportSettings = new pack.ExportSettings();
					
					var exporter_info_xml = this.smartExportPrefs.textFrames.add();
					exporter_info_xml.contents = this.exportSettings.toXML().toXMLString();	

					this.smartExportPrefs.printable = false;
					this.smartExportPrefs.visible = false;
				}

			}
			
			// get xml out of the 1 text item on that layer and parse it
			if ( this.smartExportPrefs.textFrames.length != 1 ) {
				Window.alert( 'Please delete the '+this.smartExportPrefs.name+' layer and try again.' );
				
			} else {	 
				
				try {
					this.exportSettings = pack.ExportSettings.fromXML(new XML( this.smartExportPrefs.textFrames[0].contents ));
					return true;
				
				} catch ( e ) {
					Window.alert( 'Please delete the '+this.smartExportPrefs.name+' layer and try again.\n\n'+e );
				}
				
			}
			
			return false;
		},

		
		// dialog display
		showDialog: function(doArtboard, doLayer, doSymbol) {
			var scopedThis = this;
			var exSettings = this.exportSettings;
			
			// Export dialog
			this.toolPanel = new Window('dialog', this.title);
			this.toolPanel.orientation = "column";

			var majRow = this.toolPanel.add("group");
			majRow.orientation = 'row'
			majRow.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP];


			// Artboard/Layers & Preview tabbed panel
			this.tabPanel = majRow.add("tabbedpanel");
			this.tabPanel.orientation = 'row'
			this.tabPanel.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP];

			if(doArtboard || doLayer){

				var tab = this.tabPanel.add("tab", undefined, "Artboards & Layers");
				tab.orientation = "row";

				if(doArtboard){
					this.artboardPanel = new pack.ArtboardPanel(tab, exSettings.artboardAll, exSettings.artboardInd, exSettings.exportArtboards);
					this.artboardPanel.onWholeArtboardModeChanged = function(){
						exSettings.exportArtboards = scopedThis.artboardPanel.wholeArtboardMode;
						scopedThis.updatePreviewList();
						scopedThis.formatPanel.updateArtboardsEnabled();
					}
					this.artboardPanel.onSelectedChanged = function() {
						exSettings.artboardAll  = scopedThis.artboardPanel.selectAll;
						exSettings.artboardInd  = scopedThis.artboardPanel.selectedIndices;
						scopedThis.updatePreviewList();
					};
				}

				if(doLayer){
					this.layerPanel = new pack.LayerPanel(tab, exSettings.layerAll, exSettings.layerInd, pack.IGNORE_LAYERS, exSettings.ignoreOutOfBounds);
					this.layerPanel.onSelectedChanged = function() {
						exSettings.layerAll  = scopedThis.layerPanel.selectAll;
						exSettings.layerInd  = scopedThis.layerPanel.selectedIndices;
						scopedThis.updatePreviewList();
					};
					this.layerPanel.onIgnoreOutOfBoundsChanged = function() {
						exSettings.ignoreOutOfBounds  = scopedThis.layerPanel.ignoreOutOfBounds;
					};
				}
			}

			if(doSymbol){
				var tab = this.tabPanel.add("tab", undefined, "Symbols");
				tab.orientation = "row";

				this.symbolPanel = new pack.SymbolPanel(tab, exSettings.symbolAll, exSettings.symbolNames);
				this.symbolPanel.onSelectedChanged = function() {
					exSettings.symbolAll  = scopedThis.symbolPanel.selectAll;
					exSettings.symbolNames  = scopedThis.symbolPanel.selectedNames;
					scopedThis.updatePreviewList();
				};
			}

			var tab = this.tabPanel.add("tab", undefined, "Output Files");
			this.previewPanel = new pack.PreviewFilesPanel(tab);

			// Settings panels
			var settingsCol = majRow.add("group");
			settingsCol.orientation = 'column'
			settingsCol.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP];
			
			var column;
			var row;

			var presetDir = decodeURI(Folder.userData + '/' + pack.appId + "/presets");
			this.presetPanel = new pack.PresetPanel(settingsCol, this.exportSettings, presetDir);
			this.presetPanel.onSettingsChanged = function(){
				scopedThis.settingsPanel.updateSettings();
				scopedThis.formatPanel.updateSettings();
				scopedThis.exportPanel.updateSettings();
				scopedThis.updatePreviewList();
			}
			this.settingsPanel = new pack.SettingsPanel(settingsCol, this.exportSettings);
			this.settingsPanel.onPatternChanged = function(){
				scopedThis.updatePreviewList();
			}

			this.formatPanel = new pack.FormatPanel(settingsCol, pack.formats, this.exportSettings, doArtboard, doLayer, doSymbol);
			this.formatPanel.onFormatsChanged = function(){
				scopedThis.updatePreviewList();
			}


			this.exportPanel = new pack.ExportPanel(settingsCol, this.exportSettings);
			this.exportPanel.onCancelClicked = function() {
				if(scopedThis.exporter.running){
					scopedThis.exporter.cancel();
				}else{
					scopedThis.toolPanel.close();
				}
			};
			this.exportPanel.onSaveCloseClicked = function() {
				scopedThis.saveOptions();
				scopedThis.toolPanel.close()
			};
			this.exportPanel.onExportClicked = function() {
				scopedThis.tabPanel.selection = 1;
				try{
					scopedThis.hasBoundErrorRef.broken = 0;
					scopedThis.saveOptions(); // save options before export in case of errors

					var dir = scopedThis.exportSettings.directory || "";
					if($.os.toLowerCase().indexOf("mac")!=-1){
						if(dir.charAt(0)!="/"){
							dir = scopedThis.docRef.path + "/" + dir;
						}
					}else{
						if(dir.indexOf(":")==-1){
							dir = scopedThis.docRef.path + "\\" + dir;
						}
					}
					scopedThis.exporter.runExport(scopedThis.bundleList, this.exportSettings, dir);
					if(scopedThis.hasBoundErrorRef.broken){
						var layerName = ( scopedThis.hasBoundErrorRef.broken==1 ? "A layer" : scopedThis.hasBoundErrorRef.broken+" layers");
						alert(layerName+" couldn't be positioned correctly due to an Illustrator bug, if there are alignment problems in the exported files please export again with warnings turned on.\n\nYou'll have to click through warnings but the exports should be aligned properly.");
					}
				}catch(e){
					alert("Error running export: "+e);
				}
			};

			


			this.exporter = new pack.Exporter(this.exportSettings,
				function(prog, total){scopedThis.exportPanel.setProgress(prog, total)},
				function(item){scopedThis.previewPanel.updatedExportItem(item); scopedThis.toolPanel.update();});

			this.exporter.onExportFinished = function(success, fail){
				if(success){
					scopedThis.toolPanel.close();
				}
			}
			
			if(this.artboardPanel) this.artboardPanel.onSelectedChanged();
			if(this.layerPanel) this.layerPanel.onSelectedChanged();
			if(this.symbolPanel) this.symbolPanel.onSelectedChanged();
			this.toolPanel.show();
		},


		updatePreviewList:function(){
			try{
				this.bundleList = [];
				this.hasBoundErrorRef = {};
	
				if(this.artboardPanel && this.exportSettings.exportArtboards){
					pack.ArtboardBundler.add(this.docRef, this.bundleList, this.exportSettings, "artboard", this.hasBoundErrorRef);
				}
				if(this.layerPanel){
					pack.LayerBundler.add(this.docRef, this.bundleList, this.exportSettings, "layer", this.hasBoundErrorRef);
				}
				if(this.symbolPanel){
					pack.SymbolBundler.add(this.docRef, this.bundleList, this.exportSettings, "symbol");
				}
			}catch(e){
				alert("Error creating bundles:\n"+e);
			}
			try{
				this.previewPanel.updateList(this.bundleList);
			}catch(e){
				alert("Error updating preview list:\n"+e);
			}
		},

		findDataIndex: function(data, selectList){
			if(typeof(data)=="string" && parseInt(data).toString()==data){
				data = parseInt(data);
			}
			if(typeof(data)=="number"){
				return selectList.length+data;
			}else{
				for(var i=0; i<selectList.length; ++i){
					if(selectList[i].code==data){
						return i;
					}
				}
			}
			alert("no find: "+data);
		},

		getListData: function(index, selectList){
			if(index>=selectList.length){
				return index-selectList.length;
			}else{
				return selectList[index].code;
			}
		},

		saveOptions:function(){
			var exSettings = this.exportSettings;

			this.smartExportPrefs.textFrames[0].contents = exSettings.toXML().toXMLString();
			this.smartExportPrefs.name = this.prefsLayerName;
		}
	};
	pack.ExportToolBuilder = ExportToolBuilder;
})(smartExport)