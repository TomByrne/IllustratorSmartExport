// Copyright 2014 Tom Byrne


try{
	smartExport = {};

	if($.os.toLowerCase().indexOf("macintosh")!=-1){
		smartExport.directory =  decodeURI(app.path + '/Presets.localized/' + app.locale + "/SmartLayerExport");
	}else{
		smartExport.directory =  decodeURI(app.path + '/Presets/' + app.locale + "/SmartLayerExport");
	}
	var geo_dynamic = new Folder(smartExport.directory);
	var scripts = geo_dynamic.getFiles();

	for(var i=0; i<scripts.length; ++i){
		var file = scripts[i];
		if(file instanceof File && file.toString().indexOf(".jsx")!=-1){
			$.evalFile (file);
		}
	}

	var docRef;
	var pack = smartExport;
}catch(e){
	alert(e);
}

var smartExportPanel = {

	OLD_PREFS_LAYER_NAME: "nyt_exporter_info",
	PREFS_LAYER_NAME: "Export Settings",
	
	smartExportPrefs:   null,
	
	dlg:			null,

	init: function() {
		if(!docRef){
			alert("Please open a document before running this command");
			return;
		}
		var parse_success = this.load_prefs();

		//this.TOKENS = ["--Tokens--", this.ARTBOARD_NUM_TOKEN, this.ARTBOARD_NAME_TOKEN, this.LAYER_NUM_TOKEN, this.LAYER_NAME_TOKEN, this.FILE_EXT_TOKEN];
		
		if (parse_success) {
			this.showDialog();
		}
	},

	load_prefs: function() {
	
		var parse_success = false;
		// find existing layers or add new one
		try {
			this.smartExportPrefs = docRef.layers.getByName( this.PREFS_LAYER_NAME );

		} catch ( e ) {
			try {
				this.smartExportPrefs = docRef.layers.getByName( this.OLD_PREFS_LAYER_NAME );

			} catch ( e ) {
				
				this.smartExportPrefs = docRef.layers.add();
				this.smartExportPrefs.name = this.PREFS_LAYER_NAME;

				this.exportSettings = new pack.ExportSettings();
				
				var exporter_info_xml = this.smartExportPrefs.textFrames.add();
				exporter_info_xml.contents = this.exportSettings.toXML().toXMLString();	

				this.smartExportPrefs.printable = false;
				this.smartExportPrefs.visible = false;
				
			}
		}
		
		// get xml out of the 1 text item on that layer and parse it
		if ( this.smartExportPrefs.textFrames.length != 1 ) {
			Window.alert( 'Please delete the '+this.PREFS_LAYER_NAME+' layer and try again.' );
			
		} else {	 
			
			try {
				this.exportSettings = pack.ExportSettings.fromXML(new XML( this.smartExportPrefs.textFrames[0].contents ));
				parse_success = true;
			
			} catch ( e ) {
				alert(e);
				Window.alert( 'Please delete the '+this.smartExportPrefs.name+' layer and try again.' );
			}
			
		}
		
		return parse_success;
	},

	updatePreviewList:function(){
		try{
			this.bundleList = [];

			if(this.exportSettings.exportArtboards){
				smartExport.ArtboardBundler.add(docRef, this.bundleList, this.exportSettings, "artboard");
			}
			smartExport.LayerBundler.add(docRef, this.bundleList, this.exportSettings, "layer");

			/*for(var x=0; x<this.exportSettings.formats.length; ++x){
				var settings = this.exportSettings.formats[x];
				var format = settings.formatRef;

				for(var i=0; i<this.exportSettings.artboardInd.length; ++i){
					var artI = this.exportSettings.artboardInd[i];
					var artboard = docRef.artboards[artI];
					if(this.exportSettings.exportArtboards){
						this.exportList.push({state:"waiting", formatSettings:settings, artboard:artI, fileName:this.makeFileName(this.exportSettings.artboardPattern, format.ext, artI+1, artboard.name, "", "")});
					}
					for(var j=0; j<this.exportSettings.layerInd.length; ++j){
						var layI = this.exportSettings.layerInd[j];
						var layer = docRef.layers[layI];
						this.exportList.push({state:"waiting", formatSettings:settings, artboard:artI, layer:layI, fileName:this.makeFileName(this.exportSettings.layerPattern, format.ext, artI+1, artboard.name, layI+1, layer.name)});
					}
				}
			}*/

			this.previewPanel.updateList(this.bundleList);
		}catch(e){
			alert(e);
		}
	},

	/*ARTBOARD_NUM_TOKEN:"<ArtboardNum>",
	ARTBOARD_NAME_TOKEN:"<ArtboardName>",

	LAYER_NUM_TOKEN:"<LayerNum>",
	LAYER_NAME_TOKEN:"<LayerName>",

	FILE_EXT_TOKEN:"<Ext>",

	makeFileName:function(pattern, ext, artNum, artName, layNum, layName){
		var ret = pattern;
		ret = ret.split(this.ARTBOARD_NUM_TOKEN).join(artNum);
		ret = ret.split(this.ARTBOARD_NAME_TOKEN).join(artName);
		ret = ret.split(this.LAYER_NUM_TOKEN).join(layNum);
		ret = ret.split(this.LAYER_NAME_TOKEN).join(layName);
		ret = ret.split(this.FILE_EXT_TOKEN).join(ext);
		return ret;
	},*/

	
	// dialog display
	showDialog: function() {
		var scopedThis = this;
		var exSettings = this.exportSettings;
		
		// Export dialog
		this.dlg = new Window('dialog', 'Smart Layer Export');
		this.dlg.orientation = "column";

		/*var flash = this.dlg.add ("flashplayer", undefined, File (smartExport.directory + "/FrameTicker.swf"));
		flash.size = [10,10];
		var hasShown = false;
		this.frameCount = 0;
		flash.onFrame = function(){
			scopedThis.frameCount ++;
			scopedThis.dlg.text = scopedThis.frameCount.toString();
		}
		flash.onFrame();*/

		var majRow = this.dlg.add("group");
		majRow.orientation = 'row'
		majRow.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP];

		// Artboard/Layers & Preview tabbed panel
		this.tabPanel = majRow.add("tabbedpanel");
		this.tabPanel.orientation = 'row'
		this.tabPanel.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP];

		var tab = this.tabPanel.add("tab", undefined, "Artboards & Layers");
		tab.orientation = "row";

		this.artboardPanel = new pack.ArtboardPanel(tab, this.exportSettings.artboardAll, this.exportSettings.artboardInd, this.exportSettings.exportArtboards);
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

		this.layerPanel = new pack.LayerPanel(tab, this.exportSettings.layerAll, this.exportSettings.layerInd, this.PREFS_LAYER_NAME);
		this.layerPanel.onSelectedChanged = function() {
			exSettings.layerAll  = scopedThis.layerPanel.selectAll;
			exSettings.layerInd  = scopedThis.layerPanel.selectedIndices;
			scopedThis.updatePreviewList();
		};
		var tab = this.tabPanel.add("tab", undefined, "Output Files");
		this.previewPanel = new pack.PreviewFilesPanel(tab);

		// Settings panels
		var settingsCol = majRow.add("group");
		settingsCol.orientation = 'column'
		settingsCol.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP];
		
		var column;
		var row;

		this.presetPanel = new pack.PresetPanel(settingsCol, this.exportSettings, decodeURI(app.path + '/Presets/' + app.locale + "/SmartLayerExport/presets"));
		this.presetPanel.onSettingsChanged = function(){
			scopedThis.settingsPanel.updateSettings();
			scopedThis.formatPanel.updateSettings();
			scopedThis.exportPanel.updateSettings();
		}
		this.settingsPanel = new pack.SettingsPanel(settingsCol, this.exportSettings, smartExport.tokens.ALL);
		this.settingsPanel.onPatternChanged = function(){
			scopedThis.updatePreviewList();
		}

		this.formatPanel = new pack.FormatPanel(settingsCol, pack.formats, this.exportSettings);
		this.formatPanel.onFormatsChanged = function(){
			scopedThis.updatePreviewList();
		}


		this.exportPanel = new pack.ExportPanel(settingsCol, this.exportSettings);
		this.exportPanel.onCancelClicked = function() {
			if(scopedThis.exporter.running){
				scopedThis.exporter.cancel();
			}else{
				scopedThis.dlg.close();
			}
		};
		this.exportPanel.onSaveCloseClicked = function() {
			scopedThis.saveOptions();
			scopedThis.dlg.close()
		};
		this.exportPanel.onExportClicked = function() {
			scopedThis.tabPanel.selection = 1;
			try{
				scopedThis.saveOptions(); // save options before export in case of errors
				if(scopedThis.exportSettings.directory){
					scopedThis.exporter.run_export(scopedThis.bundleList, this.exportSettings, scopedThis.exportSettings.directory);
				}else{
					scopedThis.exporter.run_export(scopedThis.bundleList, this.exportSettings, docRef.path);
				}
			}catch(e){
				alert(e);
			}
		};

		


		this.exporter = new pack.Exporter(this.exportSettings,
			function(prog, total){scopedThis.exportPanel.setProgress(prog, total)},
			function(item){scopedThis.previewPanel.updatedExportItem(item)});

		this.exporter.onExportFinished = function(success, fail){
			if(success){
				scopedThis.dlg.close();
			}
		}
		
		//this.checkFormat();
		this.artboardPanel.onSelectedChanged();
		this.layerPanel.onSelectedChanged();
		this.dlg.show();
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
		this.smartExportPrefs.name = this.PREFS_LAYER_NAME;
	}
};

try{
	if(!app.documents.length){
		alert("Please open a document before running this command");
	}else{
		docRef = app.activeDocument;
		smartExportPanel.init();
	}
}catch(e){
	alert(e);
}