(function(pack){
	function PresetPanel(container, exportSettings, presetDir){
		this.init(container, exportSettings, presetDir);
		return this;
	}

	PresetPanel.prototype={
		SETTINGS_EXTENSION:".seprops",

		onSettingsChanged:null,

		init:function(container, exportSettings, presetDir){
			var scopedThis = this;
			this.exportSettings = exportSettings;
			this.fileFilter = new pack.FileFilter([{name:"Smart Export Settings", ext:"seprops"}], true).getFilter();

			var dir = Folder(presetDir);
			if(dir instanceof File){
				dir.remove();
				dir = new Folder(presetDir);
			}
			if(!dir.exists){
				dir.create();
			}
			this.presetDir = dir;

			// buttons row
			row = container.add('group', undefined, ''); 
			row.orientation = 'row';
			row.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.BOTTOM];

			this.presetList = row.add('dropdownlist', undefined);
			this.presetList.preferredSize = [312, 22];
			this.presetList.onChange = function() {
				if(scopedThis.presetList.selection.index==0)return;
				scopedThis.loadPreset(scopedThis.presetList.selection.index-1);
				scopedThis.presetList.selection = 0;
			};

			var saveBtn = row.add('button', undefined, 'Save Settings');
			saveBtn.onClick = function() { 
				scopedThis.saveCurrent();
			};
			saveBtn.preferredSize = [100, 22];

			var importButton = row.add('iconbutton', undefined,  ScriptUI.newImage (File(pack.directory+"/icons/import.png")));
			importButton.helpTip = "Import Settings";
			importButton.onClick = function() { 
				scopedThis.doImport();
			};
			importButton.preferredSize = [28, 22];

			var exportButton = row.add('iconbutton', undefined,  ScriptUI.newImage (File(pack.directory+"/icons/export.png")));
			exportButton.helpTip = "Export Settings";
			exportButton.onClick = function() {
				scopedThis.doExport();
			};
			exportButton.preferredSize = [28, 22];

			this.buildPresetList();
		},
		loadPreset:function(index){
			var file = this.files[index];
			file.open("r");
			var str = file.read();
			file.close();
			var xml = new XML(str);
			this.exportSettings.populateWithXML(xml);
			if(this.onSettingsChanged!=null)this.onSettingsChanged();
		},
		doImport:function(){
			var files = File.openDialog ("Import Settings", this.fileFilter, true);
			for(var i=0; i<files.length; i++){
				var file = files[i];
				var othFile = File(this.presetDir + "/" + file.name);
				if(!othFile.exists || confirm("Settings "+decodeURIComponent(file.name)+" already exists.\nOverwrite?")){
					file.copy(this.presetDir + "/" + file.name);
				}
			}
			this.buildPresetList();
		},
		doExport:function(){
			var file = File.saveDialog("Export Current Settings", this.fileFilter);
			if(file){
				var filePath = file.absoluteURI;
				var extIndex = filePath.indexOf(this.SETTINGS_EXTENSION);
				var checkCollision = (Folder.fs=="Windows");
				if(extIndex != (filePath.length - this.SETTINGS_EXTENSION.length)){
					file = File(filePath + this.SETTINGS_EXTENSION);
					checkCollision = true;
				}
				this.saveCurrentTo(file, true, true, true, checkCollision);
			}
		},
		buildPresetList:function(){
			this.presetList.removeAll();
			this.presetList.add("item", "--- Load Settings ---");
			var allFiles = this.presetDir.getFiles();
			this.files = [];
			for(var i=0; i<allFiles.length; ++i){
				var file = allFiles[i];
				var extIndex = file.name.indexOf(this.SETTINGS_EXTENSION);
				if(extIndex==-1)continue;
				var fileName = file.name.substr(0, extIndex);
				fileName = decodeURIComponent(fileName);
				this.presetList.add("item", fileName);
				this.files.push(file);
			}
			this.presetList.selection = 0;
		},
		saveCurrent:function(){
			var nameDlg = new pack.SaveSettingsDialog();
			var name = nameDlg.text;
			if(name){
				var path = this.presetDir.fullName + "/" + name + this.SETTINGS_EXTENSION;
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
			var settingsXml = this.exportSettings.toXML(patterns, generalSettings, formatSettings, false, false);
			var save = settingsXml.toXMLString();
			file.open("w");
			file.write(save);
			file.close();
			this.buildPresetList();
		}
	};
	pack.PresetPanel = PresetPanel;
})(smartExport)