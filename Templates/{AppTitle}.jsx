// Copyright 2018 Tom Byrne

var file;
try{
	smartExport = {};

	smartExport.appId = "{AppID}";
	smartExport.appTitle = "{AppTitle}";
	smartExport.appName = "{AppName}";
	smartExport.appVerison = "{version}";

	if($.os.toLowerCase().indexOf("macintosh")!=-1){
		smartExport.directory =  decodeURI(app.path + '/Presets.localized/' + app.locale + "/" + smartExport.appName);
	}else{
		smartExport.directory =  decodeURI(app.path + '/Presets/' + app.locale + "/" + smartExport.appName);
	}
	smartExport.builtInPresets = smartExport.directory + "/Presets";

	var scriptFolder = new Folder(smartExport.directory);
	var scripts = scriptFolder.getFiles();

	for(var i=0; i<scripts.length; ++i){
		file = scripts[i];
		if(file instanceof File && file.toString().indexOf(".jsx")!=-1){
			$.evalFile (file);
		}
	}

}catch(e){
	if(file)alert("Error loading script: "+file+"\n"+e);
	else alert("Error initialising:\n"+e);
}

smartExport.ExportToolBuilder.launchStandardOrPreset("{SettingsLayerName}", "{PresetPath}");