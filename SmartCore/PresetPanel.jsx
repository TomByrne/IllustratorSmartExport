(function(pack){
	function PresetPanel(container, exportSettings, userPresetDir, presetLocations){
		this.init(container, exportSettings, userPresetDir, presetLocations);
		return this;
	}

	PresetPanel.prototype={
		SETTINGS_EXTENSION:".seprops",

		onSettingsChanged:null,

		init:function(container, exportSettings, userPresetDir, presetLocations){
			var scopedThis = this;
			this.exportSettings = exportSettings;
			this.fileFilter = new pack.FileFilter([{name:"Smart Export Settings", ext:"seprops"}], true).getFilter();


			var dir = Folder(userPresetDir);
			if(dir instanceof File){
				dir.remove();
				dir = new Folder(userPresetDir);
			}
			if(!dir.exists){
				dir.create();
			}
			this.userPresetDir = dir;
			this.presetLocations = presetLocations;

			// buttons row
			row = container.add('group', undefined, ''); 
			row.orientation = 'row';
			row.alignment = [ScriptUI.Alignment.RIGHT, ScriptUI.Alignment.BOTTOM];

			//this.presetList = row.add('dropdownlist', undefined);
			this.presetList = new pack.Dropdown(row);
			this.presetList.setSize(400, 22);
			this.presetList.onChange = function() {
				if(scopedThis.presetList.selection==0)return;
				var item = scopedThis.items[scopedThis.presetList.selection];
				if(item && item.path) scopedThis.loadPreset(item.path);
				scopedThis.presetList.setSelection(0);
			};

			var saveBtn = row.add('button', undefined, 'Add Preset');
			saveBtn.helpTip = "Create new preset from current settings";
			saveBtn.onClick = function() { 
				scopedThis.saveCurrent();
			};
			saveBtn.preferredSize = [100, 22];

			var importButton = row.add('iconbutton', undefined,  ScriptUI.newImage (File(pack.directory+"/icons/import.png")));
			importButton.helpTip = "Import settings file to presets";
			importButton.onClick = function() { 
				scopedThis.doImport();
			};
			importButton.preferredSize = [28, 22];

			var exportButton = row.add('iconbutton', undefined,  ScriptUI.newImage (File(pack.directory+"/icons/export.png")));
			exportButton.helpTip = "Export settings to file";
			exportButton.onClick = function() {
				scopedThis.doExport();
			};
			exportButton.preferredSize = [28, 22];

			this.buildPresetList();
		},
		loadPreset:function(file){
			file.open("r");
			var str = file.read();
			file.close();
			var xml = new XML(str);
			this.exportSettings.populateWithXML(xml);
			if(this.onSettingsChanged!=null)this.onSettingsChanged();
		},
		doImport:function(){
			var dlg = new pack.ImportDialog();
			var dest = dlg.dest;
			if(dest == null)return;

			var toPresets = dest=="presets";

			if(toPresets){
				var files = File.openDialog ("Import Settings", this.fileFilter, true);
				for(var i=0; i<files.length; i++){
					var file = files[i];
					var othFile = File(this.userPresetDir + "/" + file.name);
					if(!othFile.exists || confirm("Settings "+decodeURIComponent(file.name)+" already exists.\nOverwrite?")){
						file.copy(this.userPresetDir + "/" + file.name);
					}
				}
				this.buildPresetList();
			}else{
				var file = File.openDialog ("Import Settings", this.fileFilter, false);
				this.loadPreset(file);
			}
		},
		doExport:function(){
			var dlg = new pack.ExportDialog(this.userPresetDir, this.SETTINGS_EXTENSION);
			var settings = dlg.settings;
			if(settings == null)return;

			var file = File.saveDialog("Export Current Settings", this.fileFilter);
			if(file){
				var filePath = file.absoluteURI;
				var extIndex = filePath.indexOf(this.SETTINGS_EXTENSION);
				var checkCollision = (Folder.fs=="Windows");
				if(extIndex != (filePath.length - this.SETTINGS_EXTENSION.length)){
					file = File(filePath + this.SETTINGS_EXTENSION);
					checkCollision = true;
				}

				if(settings == "current"){
					this.saveCurrentTo(file, true, true, true, checkCollision);
				}else{
					settings.copy(file);
				}
			}
		},
		buildPresetList:function(){
			var items = [{label:"--- Load Settings ---", active:false}];

			var count = 0;
			for(var i=0; i<this.presetLocations.length; i++){
				var presetLocation = this.presetLocations[i];

				var dir = Folder(presetLocation.dir);
				if(dir instanceof File || !dir.exists){
					continue;
				}
				var allFiles = dir.getFiles();
				if(allFiles.length != 0){

					items.push( { label:presetLocation.label, separator:true } );

					items.push({ label:presetLocation.label, active:false });

					for(var i=0; i<allFiles.length; ++i){
						var file = allFiles[i];
						var extIndex = file.name.indexOf(this.SETTINGS_EXTENSION);
						if(extIndex==-1)continue;
						var fileName = file.name.substr(0, extIndex);
						fileName = decodeURIComponent(fileName);

						items.push({ label:fileName, path:file });
					}

					count++;
				}
			}

			this.items = items;
			this.presetList.verbose = true;
			this.presetList.setItems(items);
			this.presetList.setSelection(0);
		},
		saveCurrent:function(){
			var nameDlg = new pack.SaveSettingsDialog();
			var name = nameDlg.text;
			if(name){
				var path = this.userPresetDir.fullName + "/" + name + this.SETTINGS_EXTENSION;
				this.saveCurrentTo(new File(path), nameDlg.patterns, nameDlg.generalSettings, nameDlg.formatSettings, true);
			}
		},
		saveCurrentTo:function(file, patterns, generalSettings, formatSettings, checkCollision){
			if(checkCollision && file.exists && !confirm("File already exists.\nPress Yes to overwrite.")){
				return;
			}
			if(file.exists){
				file.remove();
			}
			var settingsXml = this.exportSettings.toXML(patterns, generalSettings, formatSettings, false, false, false);
			var save = settingsXml.toXMLString();
			file.open("w");
			file.write(save);
			file.close();
			this.buildPresetList();
		}
	};
	pack.PresetPanel = PresetPanel;
})(smartExport)