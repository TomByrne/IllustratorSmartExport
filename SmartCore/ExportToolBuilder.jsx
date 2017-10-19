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
		showDialog: function(doArtboard, doLayer, doElement, doSymbol) {
			var scopedThis = this;
			var exSettings = this.exportSettings;
			
			// Export dialog
			this.toolPanel = new Window('dialog', this.title);
			this.toolPanel.orientation = "column";

			var presetDir = decodeURI(Folder.userData + '/' + pack.appId + "/presets");
			this.presetPanel = new pack.PresetPanel(this.toolPanel, this.exportSettings, presetDir);
			this.presetPanel.onSettingsChanged = function(){
				scopedThis.settingsPanel.updateSettings();
				scopedThis.formatPanel.updateSettings();
				scopedThis.exportPanel.updateSettings();
				scopedThis.updatePreviewList();
			}


			// Main tab panel
			this.tabPanel = new pack.MainTabbedPanel( this.toolPanel, 160, 480 );
			this.tabPanel.onChange = function(byUser){
				if(byUser){
					exSettings.selectedTab = scopedThis.tabPanel.selection;
				}
			}


			if(doLayer){
				var tab = this.tabPanel.add("Layers");
				tab.orientation = "row";

				this.artboardPanel_layers = new pack.ArtboardPanel(tab, exSettings.artboardAll_layers, exSettings.artboardInd_layers, true);
				this.artboardPanel_layers.onSelectedChanged = function() {
					exSettings.artboardAll_layers  = scopedThis.artboardPanel_layers.selectAll;
					exSettings.artboardInd_layers  = scopedThis.artboardPanel_layers.selectedIndices;
					scopedThis.updatePreviewList();
				};

				this.layerPanel = new pack.LayerPanel(tab, exSettings.layerAll, exSettings.layerInd, pack.IGNORE_LAYERS, exSettings.ignoreOutOfBounds_layers);
				this.layerPanel.onSelectedChanged = function() {
					exSettings.layerAll  = scopedThis.layerPanel.selectAll;
					exSettings.layerInd  = scopedThis.layerPanel.selectedIndices;
					scopedThis.updatePreviewList();
				};
				this.layerPanel.onIgnoreOutOfBoundsChanged = function() {
					exSettings.ignoreOutOfBounds_layers  = scopedThis.layerPanel.ignoreOutOfBounds;
				};
			}

			if(doArtboard){
				var tab = this.tabPanel.add("Artboards");
				tab.orientation = "row";

				this.artboardPanel = new pack.ArtboardPanel(tab, exSettings.artboardAll, exSettings.artboardInd);
				this.artboardPanel.onSelectedChanged = function() {
					exSettings.artboardAll  = scopedThis.artboardPanel.selectAll;
					exSettings.artboardInd  = scopedThis.artboardPanel.selectedIndices;
					scopedThis.updatePreviewList();
				};
			}

			if(doElement){
				var tab = this.tabPanel.add("Elements");
				tab.orientation = "row";

				this.artboardPanel_elements = new pack.ArtboardPanel(tab, exSettings.artboardAll_elements, exSettings.artboardInd_elements, true);
				this.artboardPanel_elements.onSelectedChanged = function() {
					exSettings.artboardAll_elements  = scopedThis.artboardPanel_elements.selectAll;
					exSettings.artboardInd_elements  = scopedThis.artboardPanel_elements.selectedIndices;
					scopedThis.updatePreviewList();
				};

				this.elementPanel = new pack.ElementPanel(tab, exSettings.elementPaths, exSettings.elementOpenPaths, pack.IGNORE_LAYERS, exSettings.ignoreOutOfBounds_elements);
				this.elementPanel.onSelectedChanged = function() {
					exSettings.elementPaths  = scopedThis.elementPanel.selectedPaths;
					exSettings.elementOpenPaths  = scopedThis.elementPanel.openPaths;
					scopedThis.updatePreviewList();
				};
				this.elementPanel.onOpenedChanged = function() {
					exSettings.elementOpenPaths  = scopedThis.elementPanel.openPaths;
				};
				this.elementPanel.onIgnoreOutOfBoundsChanged = function() {
					exSettings.ignoreOutOfBounds_elements  = scopedThis.elementPanel.ignoreOutOfBounds;
				};

				this.tabPanel.setTransHandlers(this.tabPanel.panels.length - 1, closure(this.elementPanel, this.elementPanel.show));
			}

			if(doSymbol){
				var tab = this.tabPanel.add("Symbols");
				tab.orientation = "row";

				this.symbolPanel = new pack.SymbolPanel(tab, exSettings.symbolAll, exSettings.symbolNames);
				this.symbolPanel.onSelectedChanged = function() {
					exSettings.symbolAll  = scopedThis.symbolPanel.selectAll;
					exSettings.symbolNames  = scopedThis.symbolPanel.selectedNames;
					scopedThis.updatePreviewList();
				};
			}

			// Settings panels
			// var settingsCol = majRow.add("group");
			// settingsCol.orientation = 'column'
			// settingsCol.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP];


			var tab = this.tabPanel.add("Export Settings", pack.Button.STYLE_MAIN_TAB_OUTPUT);
			var settingsCol = tab;
			
			var column;
			var row;

			this.settingsPanel = new pack.SettingsPanel(settingsCol, this.exportSettings);
			this.settingsPanel.onPatternChanged = function(){
				scopedThis.updatePreviewList();
			}

			this.formatPanel = new pack.FormatPanel(settingsCol, pack.formats, this.exportSettings, doArtboard, doLayer, doElement, doSymbol);
			this.formatPanel.onFormatsChanged = function(){
				scopedThis.updatePreviewList();
			}


			this.exportPanel = new pack.ExportPanel(this.toolPanel, this.exportSettings);
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
					var ran = scopedThis.exporter.checkValid(scopedThis.bundleList, this.exportSettings, dir);
					if(ran){
						scopedThis.tabPanel.setSelection(scopedThis.outputTabIndex);
						scopedThis.exporter.doRun();
						if(scopedThis.hasBoundErrorRef.broken){
							var layerName = ( scopedThis.hasBoundErrorRef.broken==1 ? "A layer" : scopedThis.hasBoundErrorRef.broken+" layers");
							alert(layerName+" couldn't be positioned correctly due to an Illustrator bug, if there are alignment problems in the exported files please export again with warnings turned on.\n\nYou'll have to click through warnings but the exports should be aligned properly.");
						}
					}
				}catch(e){
					alert("Error running export: "+e);
				}
			};

			

			var tab = this.tabPanel.add("Output Files", pack.Button.STYLE_MAIN_TAB_OUTPUT);
			this.previewPanel = new pack.PreviewFilesPanel(tab);
			this.outputTabIndex = this.tabPanel.panels.length - 1;

			this.tabPanel.setTransHandlers(this.outputTabIndex, closure(this.previewPanel, this.previewPanel.show), closure(this.previewPanel, this.previewPanel.hide));


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
			if(this.elementPanel) this.elementPanel.onSelectedChanged();
			if(this.symbolPanel) this.symbolPanel.onSelectedChanged();

			this.tabPanel.setSelection(exSettings.selectedTab);
			this.toolPanel.show();
		},


		updatePreviewList:function(){
			try{
				this.bundleList = [];
				this.hasBoundErrorRef = {};

				if(this.artboardPanel){
					var hasExports = pack.ArtboardBundler.add(this.docRef, this.bundleList, this.exportSettings, "artboard", this.hasBoundErrorRef);
					this.formatPanel.setPatternActive("artboard", hasExports);
				}
				if(this.layerPanel){
					var hasExports = pack.LayerBundler.addLayers(this.docRef, this.bundleList, this.exportSettings, "layer", this.hasBoundErrorRef);
					this.formatPanel.setPatternActive("layer", hasExports);
				}
				 if(this.elementPanel){
				 	var hasExports = pack.LayerBundler.addElements(this.docRef, this.bundleList, this.exportSettings, "element", this.hasBoundErrorRef);
					this.formatPanel.setPatternActive("element", hasExports);
				 }
				if(this.symbolPanel){
					var hasExports = pack.SymbolBundler.add(this.docRef, this.bundleList, this.exportSettings, "symbol");
					this.formatPanel.setPatternActive("symbol", hasExports);
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