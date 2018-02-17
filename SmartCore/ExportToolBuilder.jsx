(function(pack){
	function ExportToolBuilder(docRef, title, autoExport){
		this.init(docRef, title, autoExport);
		return this;
	}

	ExportToolBuilder.launchStandardOrPreset =function(settingsLayer, presetPath){
		if(presetPath == "") presetPath = null;

		var doc;
		try{
			doc = app.activeDocument;
		}catch(e){}

		pack.IGNORE_LAYERS.push(settingsLayer);

		if(!doc || !app.documents.length){
			alert("Please open a document before running this command");
		}else{

			try{
				var showParts;
				var title;
				var autoExport = false;
				if(presetPath){
					showParts = { preview:true, progress:true };
					title = presetPath.substring(presetPath.lastIndexOf("/"), presetPath.lastIndexOf("."));
					autoExport = true;
				}else{
					showParts = { presets:true, artboards:true, layers:true, elements:true, symbols:true, formats:true, preview:true, progress:true, exportButtons:true };
					title = smartExport.appTitle + " v" + smartExport.appVersion;
				}
				var toolBuilder = new pack.ExportToolBuilder(app.activeDocument, title, autoExport);

				var loadSuccess;

				if(presetPath){
					loadSuccess = toolBuilder.loadPreset(presetPath, app.activeDocument);
				}else{
					loadSuccess = toolBuilder.loadPrefLayer(settingsLayer, "nyt_exporter_info");
				}
				if (loadSuccess) toolBuilder.showDialog(showParts);
				
			}catch(e){
				alert("Error opening panel:\n"+e);
			}
		}
	}

	pack.IGNORE_LAYERS = ["Export Settings", "Export Symbol Settings", "nyt_exporter_info"];

	ExportToolBuilder.prototype={
		prefsLayerName:         null,
		smartExportPrefs:       null,
		toolPanel:			    null,
		docRef:			        null,

		init: function(docRef, title, autoExport) {
			this.docRef = docRef;
			this.title = title;
			this.autoExport = autoExport;
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

		loadPreset: function(presetPath, doc) {
			presetPath = (smartExport.builtInPresets + "/" + presetPath);
			var file = new File(presetPath);
			if(!file.exists){
				alert("Couldn't find preset:\n" + presetPath);
				return false;
			}

			file.open("r");
			var str = file.read();
			file.close();
			try{
				var xml = new XML(str);
			}catch(e){
				alert("Couldn't parse preset:\n" + presetPath);
				return false;
			}
			this.exportSettings = pack.ExportSettings.fromXML(xml);

			if(doc){
				if(this.exportSettings.artboardAll){
					var array = [];
					for(var i=0; i<doc.artboards.length; i++) array.push(i);
					this.exportSettings.artboardInd = array;
				}
				if(this.exportSettings.layerAll){
					var array = [];
					for(var i=0; i<doc.layers.length; i++) array.push(i);
					this.exportSettings.layerInd = array;
				}
				if(this.exportSettings.artboardAll_layers){
					var array = [];
					for(var i=0; i<doc.artboards.length; i++) array.push(i);
					this.exportSettings.artboardInd_layers = array;
				}
				if(this.exportSettings.artboardAll_elements){
					var array = [];
					for(var i=0; i<doc.artboards.length; i++) array.push(i);
					this.exportSettings.artboardInd_elements = array;
				}
				if(this.exportSettings.symbolAll){
					var array = [];
					for(var i=0; i<doc.symbolItems.length; i++) array.push(i);
					this.exportSettings.symbolAll = array;
				}
			}

			return true;
		},

		
		// dialog display
		showDialog: function(showParts) {
			var scopedThis = this;
			var exSettings = this.exportSettings;
			
			// Export dialog
			this.toolPanel = new Window('dialog', this.title);
			this.toolPanel.orientation = "column";

			if(showParts.presets){
				var presetDir = decodeURI(Folder.userData + '/' + pack.appId + "/presets");
				this.presetPanel = new pack.PresetPanel(this.toolPanel, this.exportSettings, presetDir, [{label:"USER PRESETS", dir:presetDir}, {label:"STANDARD PRESETS", dir:smartExport.builtInPresets}]);
				this.presetPanel.onSettingsChanged = function(){
					scopedThis.settingsPanel.updateSettings();
					scopedThis.formatPanel.updateSettings();
					scopedThis.exportPanel.updateSettings();
					scopedThis.updatePreviewList();
				}
			}

			var tabCount = 0;
			if(showParts.layers) tabCount++;
			if(showParts.artboards) tabCount++;
			if(showParts.elements) tabCount++;
			if(showParts.symbols) tabCount++;
			if(showParts.formats) tabCount++;

			// Main tab panel
			if(tabCount > 1){
				this.tabPanel = new pack.MainTabbedPanel( this.toolPanel, 160, 480 );
				this.tabPanel.onChange = function(byUser){
					if(byUser){
						exSettings.selectedTab = scopedThis.tabPanel.selection;
					}
				}
			}

			if(showParts.layers){
				var tab = this.tabPanel ? this.tabPanel.add("Layers") : this.toolPanel.add("panel");
				tab.orientation = "row";

				this.artboardPanel_layers = new pack.ArtboardPanel(tab, exSettings.artboardAll_layers, exSettings.artboardInd_layers, true);
				this.artboardPanel_layers.onSelectedChanged = function() {
					exSettings.artboardAll_layers  = scopedThis.artboardPanel_layers.selectAll;
					exSettings.artboardInd_layers  = scopedThis.artboardPanel_layers.selectedIndices;
					scopedThis.updatePreviewList();
				};
				this.artboardPanel_layers.onSelectedChanged();

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

			if(showParts.artboards){
				var tab = this.tabPanel ? this.tabPanel.add("Artboards") : this.toolPanel.add("panel");
				tab.orientation = "row";

				this.artboardPanel = new pack.ArtboardPanel(tab, exSettings.artboardAll, exSettings.artboardInd);
				this.artboardPanel.onSelectedChanged = function() {
					exSettings.artboardAll  = scopedThis.artboardPanel.selectAll;
					exSettings.artboardInd  = scopedThis.artboardPanel.selectedIndices;
					scopedThis.updatePreviewList();
				};
				this.artboardPanel.onSelectedChanged();
			}

			if(showParts.elements){
				var tab = this.tabPanel ? this.tabPanel.add("Elements") : this.toolPanel.add("panel");
				tab.orientation = "row";

				this.artboardPanel_elements = new pack.ArtboardPanel(tab, exSettings.artboardAll_elements, exSettings.artboardInd_elements, true);
				this.artboardPanel_elements.onSelectedChanged = function() {
					exSettings.artboardAll_elements  = scopedThis.artboardPanel_elements.selectAll;
					exSettings.artboardInd_elements  = scopedThis.artboardPanel_elements.selectedIndices;
					scopedThis.updatePreviewList();
				};
				this.artboardPanel_elements.onSelectedChanged();

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

				if(this.tabPanel) this.tabPanel.setTransHandlers(this.tabPanel.panels.length - 1, closure(this.elementPanel, this.elementPanel.show));
				else this.elementPanel.show();
			}

			if(showParts.symbols){
				var tab = this.tabPanel ? this.tabPanel.add("Symbols") : this.toolPanel.add("panel");
				tab.orientation = "row";

				this.symbolPanel = new pack.SymbolPanel(tab, exSettings.symbolAll, exSettings.symbolNames);
				this.symbolPanel.onSelectedChanged = function() {
					exSettings.symbolAll  = scopedThis.symbolPanel.selectAll;
					exSettings.symbolNames  = scopedThis.symbolPanel.selectedNames;
					scopedThis.updatePreviewList();
				};
			}

			if(showParts.formats){
				var tab = this.tabPanel ? this.tabPanel.add("Export Settings", pack.Button.STYLE_MAIN_TAB_OUTPUT) : this.toolPanel.add("panel");
				var settingsCol = tab;
				
				var column;
				var row;

				this.settingsPanel = new pack.SettingsPanel(settingsCol, this.exportSettings);
				this.settingsPanel.onPatternChanged = function(){
					scopedThis.updatePreviewList();
				}

				this.formatPanel = new pack.FormatPanel(settingsCol, pack.formats, this.exportSettings);
				this.formatPanel.onFormatsChanged = function(){
					scopedThis.updatePreviewList();
				}
			}


			if(showParts.preview){
				var tab = this.tabPanel ? this.tabPanel.add("Output Files", pack.Button.STYLE_MAIN_TAB_OUTPUT) : this.toolPanel.add("panel");
				this.previewPanel = new pack.PreviewFilesPanel(tab);

				if(this.tabPanel){
					this.outputTabIndex = this.tabPanel.panels.length - 1;
					this.tabPanel.setTransHandlers(this.outputTabIndex, closure(this.previewPanel, this.previewPanel.show), closure(this.previewPanel, this.previewPanel.hide));
				}else this.previewPanel.show();
			}

			if(showParts.progress){
				// progress bar
				this.progBar = this.toolPanel.add( 'progressbar', undefined, 0, 100 );
				this.progBar.alignment = [ScriptUI.Alignment.RIGHT, ScriptUI.Alignment.TOP];
				this.progBar.size = [665,10];
			}

			if(showParts.exportButtons){
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
				this.exportPanel.onExportClicked = closure(this, this.beginExport);
			}

			this.exporter = new pack.Exporter(this.exportSettings,
				function(prog, total){scopedThis.setProgress(prog, total)},
				function(item){scopedThis.previewPanel.updatedExportItem(item); scopedThis.toolPanel.update();});

			this.exporter.onExportFinished = function(success, fail){
				if(success){
					scopedThis.toolPanel.close();
				}
			}


			this.elemVis = pack.DocUtils.getAllElemVisibility(this.docRef);
			
			if(this.artboardPanel) this.artboardPanel.onSelectedChanged();
			if(this.layerPanel) this.layerPanel.onSelectedChanged();
			if(this.elementPanel) this.elementPanel.onSelectedChanged();
			if(this.symbolPanel) this.symbolPanel.onSelectedChanged();

			if(this.tabPanel) this.tabPanel.setSelection(exSettings.selectedTab);

			this.finishedBuilding = true;
			this.updatePreviewList();

			if(this.autoExport){
				this.toolPanel.onActivate = function(e){
					scopedThis.toolPanel.onActivate = null;
					scopedThis.beginExport(false);
				}
			}

			this.toolPanel.show();
		},

		beginExport:function(save) {
			if(save == null) save = true;
			try{
				this.hasBoundErrorRef.broken = 0;
				if(save) this.saveOptions(); // save options before export in case of errors

				var dir = this.exportSettings.directory || "";
				if($.os.toLowerCase().indexOf("mac")!=-1){
					if(dir.charAt(0)!="/"){
						dir = this.docRef.path + "/" + dir;
					}
				}else{
					if(dir.indexOf(":")==-1){
						dir = this.docRef.path + "\\" + dir;
					}
				}
				var ran = this.exporter.checkValid(this.bundleList, this.exportSettings, dir);
				if(ran){
					if(this.tabPanel) this.tabPanel.setSelection(this.outputTabIndex);
					this.exporter.doRun();
					if(this.hasBoundErrorRef.broken){
						var layerName = ( this.hasBoundErrorRef.broken==1 ? "A layer" : this.hasBoundErrorRef.broken+" layers");
						alert(layerName+" couldn't be positioned correctly due to an Illustrator bug, if there are alignment problems in the exported files please export again with warnings turned on.\n\nYou'll have to click through warnings but the exports should be aligned properly.");
					}
				}
			}catch(e){
				alert("Error running export: "+e);
			}
		},

		setProgress:function(prog, total){
			if(!this.progBar) return;
			this.progBar.value = prog / total * 100;
		},

		updatePreviewList:function(){
			if(!this.finishedBuilding) return;
			try{
				this.bundleList = [];
				this.hasBoundErrorRef = {};

				var hasExports = pack.ArtboardBundler.add(this.docRef, this.bundleList, this.exportSettings, "artboard", this.hasBoundErrorRef);
				if(this.formatPanel) this.formatPanel.setPatternActive("artboard", hasExports);

				var hasExports = pack.LayerBundler.addLayers(this.docRef, this.bundleList, this.exportSettings, "layer", this.hasBoundErrorRef, this.elemVis);
				if(this.formatPanel) this.formatPanel.setPatternActive("layer", hasExports);

			 	var hasExports = pack.LayerBundler.addElements(this.docRef, this.bundleList, this.exportSettings, "element", this.hasBoundErrorRef, this.elemVis);
				if(this.formatPanel) this.formatPanel.setPatternActive("element", hasExports);

				var hasExports = pack.SymbolBundler.add(this.docRef, this.bundleList, this.exportSettings, "symbol");
				if(this.formatPanel) this.formatPanel.setPatternActive("symbol", hasExports);

				var windowsFS = (Folder.fs=="Windows");
				if(windowsFS){
					for(var i=0; i<this.bundleList.length; i++){
						var bundle = this.bundleList[i];
						for(var j=0; j<bundle.items.length; j++){
							var item = bundle.items[j];
							var path = item.fileName;
							path = path.split(":").join("-");
							path = path.split("|").join("-");
							path = path.split("?").join("-");
							path = path.split("*").join("-");
							path = path.split("<").join("-");
							path = path.split(">").join("-");
							path = path.split('"').join("'");
							path = path.split(':').join(";");
							item.fileName = path;
						}
					}
				}else{
					for(var i=0; i<this.bundleList.length; i++){
						var bundle = this.bundleList[i];
						for(var j=0; j<bundle.items.length; j++){
							var item = bundle.items[j];
							var path = item.fileName;
							if(path.charAt(0) == ".") path = "_" + path.substr(1);
							path = path.split(":").join("-");
							item.fileName = path;
						}
					}
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