// Copyright 2014 Tom Byrne

var file;
try{
	smartExport = {};

	var classpath = "SmartSymbolExport";

	smartExport.appId = "org.tbyrne.smartSymbolExport";

	if($.os.toLowerCase().indexOf("macintosh")!=-1){
		smartExport.directory =  decodeURI(app.path + '/Presets.localized/' + app.locale + "/" + classpath);
	}else{
		smartExport.directory =  decodeURI(app.path + '/Presets/' + app.locale + "/" + classpath);
	}
	var geo_dynamic = new Folder(smartExport.directory);
	var scripts = geo_dynamic.getFiles();

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

var doc;
try{
	doc = app.activeDocument;
}catch(e){}

if(!doc || !app.documents.length){
	alert("Please open a document before running this command");
}else{

	try{
		var toolBuilder = new smartExport.ExportToolBuilder(app.activeDocument, "Smart Symbol Export");
		var loadSuccess = toolBuilder.loadPrefLayer("Export Symbol Settings");
		if (loadSuccess) toolBuilder.showDialog(false, false, true);
		
	}catch(e){
		alert("Error opening panel:\n"+e);
	}
}