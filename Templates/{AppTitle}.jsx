// Copyright 2014 Tom Byrne

var file;
try{
	smartExport = {};

	var classpath = "{AppName}";

	smartExport.appId = "{AppID}";

	if($.os.toLowerCase().indexOf("macintosh")!=-1){
		smartExport.directory =  decodeURI(app.path + '/Presets.localized/' + app.locale + "/" + classpath);
	}else{
		smartExport.directory =  decodeURI(app.path + '/Presets/' + app.locale + "/" + classpath);
	}
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

smartExport.ExportToolBuilder.launchStandard("{AppTitle}", "{SettingsLayerName}");