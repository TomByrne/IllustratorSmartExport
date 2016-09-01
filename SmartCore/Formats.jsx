(function(pack){

	var fillOptions = function(options, formatSettings, presetProp){
		var props = formatSettings.formatRef.more;
		var values = formatSettings.options;
		if(presetProp != null && formatSettings.preset != "" && formatSettings.preset!= null){
			options[presetProp] = formatSettings.preset;
		}else{
			for(var i=0; i<props.length; i++){
				var prop = props[i];
				var value = values[prop.id];
				if(value==null)value = prop.def;
				if(value==null){
					if(prop.optionalProp){
						options[prop.optionalProp] = false;
					}
					continue;
				}else{
					if(prop.optionalProp){
						options[prop.optionalProp] = true;
					}
					if(prop.type=="list"){
						if(value == -1){
							value = null;
						}else if(typeof(value)=="string"){
							var parts = value.split(",");
							var option = prop.options[parseInt(parts[0])];
							if(option.type != "list"){
								value = option.key;
							}else{
								var subOption = option.options[parseInt(parts[1])];
								value = subOption.key;
							}
						}else{
							value = prop.options[value].key;
						}
					}else if(prop.type=="color"){
						if(typeof(value)=="string"){
							value = value.split("#").join("");
							if(value.length>6)value = value.substr(value.length - 6, value.length);
							value = parseInt(value, 16);
						}
						var color = new RGBColor();
						color.red = ((value >> 16) & 0xff);
						color.green = ((value >> 8) & 0xff);
						color.blue =  (value & 0xff);
						value = color;
					}
				}
				options[prop.id] = value;
			}
		}
		var extra = formatSettings.formatRef.extra;
		if(extra){
			for(var i in extra){
				options[i] = extra[i];
			}
		}
	}

	var checkRect = function(rect){
		if(typeof(rect)=="string"){
			rect = rect.split(",");
			rect = [parseFloat(rect[0]), parseFloat(rect[1]), parseFloat(rect[2]), parseFloat(rect[3])];
		}
		return rect;
	}
		
	// Format specific functionality
	var getPng8Options = function ( formatSettings ) {
		var options = new ExportOptionsPNG8();
		options.antiAliasing = true;
		//options.transparency = formatSettings.transparency; 
		options.artBoardClipping = true;
		options.horizontalScale = formatSettings.scaling;
		options.verticalScale = formatSettings.scaling;
		fillOptions(options, formatSettings);
		return options;
	}
	var getPng24Options = function ( formatSettings ) {
		var options = new ExportOptionsPNG24();
		options.antiAliasing = true;
		//options.transparency = formatSettings.transparency; 
		options.artBoardClipping = true;
		options.horizontalScale = formatSettings.scaling;
		options.verticalScale = formatSettings.scaling;	
		fillOptions(options, formatSettings);
		return options;
	}
	var getPdfOptions = function ( formatSettings ) {
		var options = new PDFSaveOptions();
		options.compatibility = PDFCompatibility.ACROBAT5;
		options.generateThumbnails = true;
		options.preserveEditability = false;
		fillOptions(options, formatSettings, "pDFPreset");
		options.bleedOffsetRect = checkRect(options.bleedOffsetRect);
		return options;
	}
	var getJpgOptions = function ( formatSettings ) {
		var options = new ExportOptionsJPEG();
		options.antiAliasing = true;
		options.artBoardClipping = true;
		options.horizontalScale = formatSettings.scaling;
		options.verticalScale = formatSettings.scaling;	
		fillOptions(options, formatSettings);
		return options;
	}
	var getGifOptions = function ( formatSettings ) {
		var options = new ExportOptionsGIF();
		options.antiAliasing = true;
		options.artBoardClipping = true;
		options.horizontalScale = formatSettings.scaling;
		options.verticalScale = formatSettings.scaling;	
		fillOptions(options, formatSettings);
		return options;
	}
	var getEpsOptions = function ( formatSettings ) {
		var options = new EPSSaveOptions();
		options.embedLinkedFiles = formatSettings.embedImage;
		options.embedAllFonts = (formatSettings.fontHandling=="embed");
		options.includeDocumentThumbnails = true;
		options.saveMultipleArtboards = false;
		fillOptions(options, formatSettings);
		return options;
	}
	var getSvgOptions = function ( formatSettings ) {
		options = new ExportOptionsSVG();
		options.embedRasterImages = formatSettings.embedImage;
		options.saveMultipleArtboards = false;
		fillOptions(options, formatSettings);
		return options;
	}
	var getFxgOptions = function ( formatSettings ) {
		options = new FXGSaveOptions();
		fillOptions(options, formatSettings);
		return options;
	}
	var getAiOptions = function ( formatSettings ) {
		options = new IllustratorSaveOptions();
		options.embedLinkedFiles = formatSettings.embedImage;
		fillOptions(options, formatSettings);
		return options;
	}

	// Format specific save functions
	var savePng8 = function ( doc, filePath, options ) {
		var destFile = new File( filePath );
		doc.exportFile(destFile, ExportType.PNG8, options);
	}
	var savePng24 = function ( doc, filePath, options ) {
		var destFile = new File( filePath );
		doc.exportFile(destFile, ExportType.PNG24, options);
	}
	var savePdf = function ( doc, filePath, options ) {
		var destFile = new File( filePath );
		doc.saveAs( destFile, options )
	}
	var saveJpg = function ( doc, filePath, options ) {
		var destFile = new File( filePath );
		doc.exportFile(destFile, ExportType.JPEG , options);
	}
	var saveGif = function ( doc, filePath, options ) {
		var destFile = new File( filePath );
		doc.exportFile(destFile, ExportType.GIF , options);
	}
	var saveEps = function ( doc, filePath, options ) {
		var destFile = new File( filePath );
		doc.saveAs( destFile, options )			
	}
	var saveAi = function ( doc, filePath, options ) {
		var destFile = new File( filePath );
		doc.saveAs( destFile, options )			
	}
	var saveSvg = function ( doc, filePath, options ) {
		var destFile = new File( filePath );
		doc.exportFile(destFile, ExportType.SVG , options);
	}
	var saveFxg = function ( doc, filePath, options ) {
		var destFile = new File( filePath );
		doc.saveAs( destFile, options )	
	}

	var percent = function(id, name, def){
		return {type:"percent", id:id, name:name, def:def};
	}
	var range = function(id, name, min, max, def){
		return {type:"range", id:id, name:name, min:min, max:max, def:def};
	}
	var num = function(id, name, def, unit){
		return {type:"number", id:id, name:name, def:def, unit:unit};
	}
	var bool = function(id, name, def){
		return {type:"boolean", id:id, name:name, def:def};
	}
	var color = function(id, name, def, optional, optionalProp){
		return {type:"color", id:id, name:name, def:def, optional:optional, optionalProp:optionalProp};
	}
	var list = function(id, name, def, options){
		return {type:"list", id:id, name:name, def:def, options:options};
	}
	var sublist = function(name, def, options){
		return {type:"list", id:"", name:name, def:def, options:options};
	}
	var opt = function(key, name){
		return {key:key, name:name};
	}
	var margin = function(id, name, def, optionalProp, linkedProp){
		return {type:"margin", id:id, name:name, def:def ? def.join(",") : null, optionalProp:optionalProp, linkedProp:linkedProp};
	}
	var string = function(id, name, def, optionalProp){
		return {type:"string", id:id, name:name, def:def, optionalProp:optionalProp};
	}

	var enumMap = function(enumType, mapping){
		var ret = [];
		for(var i in mapping){
			try{
				var val = enumType[i];
				ret.push(opt(val, mapping[i]));
			}catch(e){
				// enum value deprecated
			}
		}
		return ret;
	}

	var antiAliasing = bool("antiAliasing", "Anti-aliasing", true);
	var transparency = bool("transparency", "Transparency", true);
	var colorCount = range("colorCount", "Color Count", 2, 256, 128);
	var colorDither = list("colorDither", "Color Dither", 1, [opt(ColorDitherMethod.NOREDUCTION, "No Dither"), opt(ColorDitherMethod.DIFFUSION, "Diffusion"), opt(ColorDitherMethod.PATTERNDITHER, "Pattern"), opt(ColorDitherMethod.NOISE, "Noise")]);
	var colorReduction = list("colorReduction", "Color Reduction", 1, [opt(ColorReductionMethod.PERCEPTUAL, "Perceptual"), opt(ColorReductionMethod.SELECTIVE, "Selective"), opt(ColorReductionMethod.ADAPTIVE, "Adaptive"), opt(ColorReductionMethod.WEB, "Restrictive (Web)")]);
	var ditherPercent = percent("ditherPercent", "Dither Percent", 50);
	var interlaced = bool("interlaced", "Interlaced", false);
	var matteColor = color("matteColor", "Matte", null, true, "matte");
	//var saveAsHTML = bool("saveAsHTML", "Save with HTML", false);
	var webSnap = percent("webSnap", "Web Snap", 0);
	var blurAmount = range("blurAmount", "Blur Amount", 0, 2, 0);
	var optimization = bool("optimization", "Optimization", true);
	var qualitySetting = percent("qualitySetting", "Quality", 70);
	var infoLossPercent = percent("infoLossPercent", "Info Loss Percent", 0);

	var compatList = enumMap(Compatibility, {ILLUSTRATOR8:"Illustrator 8", ILLUSTRATOR9:"Illustrator 9", ILLUSTRATOR10:"Illustrator 10", ILLUSTRATOR11:"Illustrator 11 (CS)", ILLUSTRATOR12:"Illustrator 12 (CS2)", ILLUSTRATOR13:"Illustrator 13 (CS3)", ILLUSTRATOR14:"Illustrator 14 (CS4)", ILLUSTRATOR15:"Illustrator 15 (CS5)", ILLUSTRATOR16:"Illustrator 16 (CS6)", ILLUSTRATOR17:"Illustrator 17 (CC)", JAPANESEVERSION3:"Japanese Version 3"});
	var compatibility = list("compatibility", "Compatibility", 9, compatList);

	var fontSubsetThreshold = percent("fontSubsetThreshold", "Font Subset Threshold", 100, "%");

	// AI
	var compressed = bool("compressed", "Compressed", true);
	var embedICCProfile = bool("embedICCProfile", "Embed ICC Profile", false);
	var pdfCompatible = bool("pdfCompatible", "PDF Compatible", true);

	// SVG
	var coordinatePrecision = range("coordinatePrecision", "Precision", 1, 7, 3);
	var cssProperties = list("cssProperties", "CSS Properties", 1, [opt(SVGCSSPropertyLocation.ENTITIES, "Entities"), opt(SVGCSSPropertyLocation.STYLEATTRIBUTES, "Style Attributes"), opt(SVGCSSPropertyLocation.PRESENTATIONATTRIBUTES, "Presentation Attributes"), opt(SVGCSSPropertyLocation.STYLEELEMENTS, "Style Elements")]);
	var documentEncoding = list("documentEncoding", "Document Encoding", 0, [opt(SVGDocumentEncoding.ASCII, "ASCII"), opt(SVGDocumentEncoding.UTF8, "UTF-8"), opt(SVGDocumentEncoding.UTF16, "UTF-16")]);
	var DTD = list("DTD", "DTD Version", 1, [opt(SVGDTDVersion.SVG1_0, "SVG 1.0"), opt(SVGDTDVersion.SVG1_1, "SVG 1.1"), opt(SVGDTDVersion.SVGBASIC1_1, "SVG Basic 1.1"), opt(SVGDTDVersion.SVGTINY1_1, "SVG Tiny 1.1"), opt(SVGDTDVersion.SVGTINY1_1PLUS, "SVG Tiny 1.1+"), opt(SVGDTDVersion.SVGTINY1_2, "SVG Tiny 1.2")]);
	var fontSubsetting = list("fontSubsetting", "Font Subsetting", 0, enumMap(SVGFontSubsetting, {ALLGLYPHS:"All Glyphs", COMMONENGLISH:"Common English", COMMONROMAN:"Common Roman", GLYPHSUSED:"Glyphs Used", GLYPHSUSEDPLUSENGLISH:"Glyphs used plus English", GLYPHSUSEDPLUSROMAN:"Glyphs used plus Roman", None:"None"}));
	var fontType = list("fontType", "Font Type", 0, enumMap(SVGFontType, {CEFFONT:"CEF Fonts", SVGFONT:"SVG Fonts", OUTLINEFONT:"Outline Fonts"}));
	var includeFileInfo = bool("includeFileInfo", "Include File Info", false);
	var includeUnusedStyles = bool("includeUnusedStyles", "Include Unused Styles", false);
	var includeVariablesAndDatasets = bool("includeVariablesAndDatasets", "Include Variables and Data", false);
	var preserveEditability = bool("preserveEditability", "Preserve Editability", false);
	var slices = bool("slices", "Slices", false);
	var sVGAutoKerning = bool("sVGAutoKerning", "SVG Auto Kerning", false);
	var sVGTextOnPath = bool("sVGTextOnPath", "SVG Text on Path", false);
	
	// EPS
	var cmykPostScript = bool("cmykPostScript", "CMYK Postscript", false);
	var compatibleGradientPrinting = bool("compatibleGradientPrinting", "Compatibility Gradient Printing", false);
	var flattenOuput = list("flattenOuput", "Flatten Output", 0, [opt(OutputFlattening.PRESERVEAPPEARANCE, "Preserve Appearance"), opt(OutputFlattening.PRESERVEPATHS, "Preserve Paths")]);
	var includeDocumentThumbnails = bool("includeDocumentThumbnails", "Include Document Thumbnails", false);
	var overprint = list("overprint", "PDF Overprint", 1, [opt(PDFOverprint.DISCARDPDFOVERPRINT, "Discard"), opt(PDFOverprint.PRESERVEPDFOVERPRINT, "Preserve")]);
	var epsVersion = list("postScript", "Version", 0, [opt(EPSPostScriptLevelEnum.LEVEL2, "2"), opt(EPSPostScriptLevelEnum.LEVEL3, "3")]);
	var epsPreview = list("preview", "Preview Format", 3, [opt(EPSPreview.BWTIFF, "TIFF (B&W)"), opt(EPSPreview.COLORTIFF, "TIFF (Color)"), opt(EPSPreview.TRANSPARENTCOLORTIFF, "TIFF (Color w/ Transparency)"), opt(EPSPreview.None, "None")]);
	
	// PDF
	var pdfCompatibility = list("compatibility", "Version Compatibility", 1, [opt(PDFCompatibility.ACROBAT4, "Acrobat 4"), opt(PDFCompatibility.ACROBAT5, "Acrobat 5"), opt(PDFCompatibility.ACROBAT6, "Acrobat 6"), opt(PDFCompatibility.ACROBAT7, "Acrobat 7"), opt(PDFCompatibility.ACROBAT8, "Acrobat 8")]);
	var acrobatLayers = bool("acrobatLayers", "Acrobat Layers", false);
	var bleedOffsetRect = margin("bleedOffsetRect", "Bleed Offset (px)", null, true, "bleedLink");
	var colorBars = bool("colorBars", "Color Bars", false);
	var outputCondition = string("outputCondition", "Output Condition");
	var outputConditionID = string("outputConditionID", "Output Condition ID");
	var compressArt = bool("compressArt", "Compress Art", true);
	var generateThumbnails = bool("generateThumbnails", "Generate Thumbnails", true);
	var offset = num("offset", "Custom Paper Offset", 0, "pts");
	var optimization = bool("optimization", "Optimization", false);
	var pageInformation = bool("pageInformation", "Include Page Information", false);
	var printerResolution = num("printerResolution", "Printer Resolution", 800, "dpi");
	//var trapped = bool("trapped", "Manual Trapping Prepared", true);

	var pageMarksType = list("pageMarksType", "Page Marks", 0, [opt(PageMarksTypes.Roman, "Roman"), opt(PageMarksTypes.Japanese, "Japanese")]);
	var registrationMarks = bool("registrationMarks", "Registration Marks", false);
	var trimMarks = bool("trimMarks", "Trim Marks", false);
	var trimMarkWeight = list("trimMarkWeight", "Trim Mark Weight", 0, [opt(PDFTrimMarkWeight.TRIMMARKWEIGHT0125, "0.125"), opt(PDFTrimMarkWeight.TRIMMARKWEIGHT025, "0.25"), opt(PDFTrimMarkWeight.TRIMMARKWEIGHT05, "0.5")]);
	
	var compressionQuality = [		opt(CompressionQuality.None, "None"),
									sublist("Automatic (JPEG)", 2,     [opt(CompressionQuality.AUTOMATICJPEGMINIMUM, "Minimum"),
																		opt(CompressionQuality.AUTOMATICJPEGLOW, "Low"),
																		opt(CompressionQuality.AUTOMATICJPEGMEDIUM, "Medium"),
																		opt(CompressionQuality.AUTOMATICJPEGHIGH, "High"),
																		opt(CompressionQuality.AUTOMATICJPEGMAXIMUM, "Maximum")]),

									sublist("Automatic (JPEG2000)", 2, [opt(CompressionQuality.AUTOMATICJPEG2000MINIMUM, "Minimum"),
																		opt(CompressionQuality.AUTOMATICJPEG2000LOW, "Low"),
																		opt(CompressionQuality.AUTOMATICJPEG2000MEDIUM, "Medium"),
																		opt(CompressionQuality.AUTOMATICJPEG2000HIGH, "High"),
																		opt(CompressionQuality.AUTOMATICJPEG2000MAXIMUM, "Maximum"),
																		opt(CompressionQuality.AUTOMATICJPEG2000LOSSLESS, "Lossless")]),

									sublist("JPEG", 2, [				opt(CompressionQuality.JPEGMINIMUM, "Minimum"),
																		opt(CompressionQuality.JPEGLOW, "Low"),
																		opt(CompressionQuality.JPEGMEDIUM, "Medium"),
																		opt(CompressionQuality.JPEGHIGH, "High"),
																		opt(CompressionQuality.JPEGMAXIMUM, "Maximum")]),

									sublist("JPEG2000", 2, [			opt(CompressionQuality.JPEG2000MINIMUM, "Minimum"),
																		opt(CompressionQuality.JPEG2000LOW, "Low"),
																		opt(CompressionQuality.JPEG2000MEDIUM, "Medium"),
																		opt(CompressionQuality.JPEG2000HIGH, "High"),
																		opt(CompressionQuality.JPEG2000MAXIMUM, "Maximum"),
																		opt(CompressionQuality.JPEG2000LOSSLESS, "Lossless")])
									];


	var colorConversionID = list("colorConversionID", "Color Conversion", 0, [opt(ColorConversion.None, "None"), opt(ColorConversion.COLORCONVERSIONREPURPOSE, "Convert to Destination, Preserve Numbers (Select Below)"), opt(ColorConversion.COLORCONVERSIONTODEST, "Convert to Destination (Select Below)")]);
	var colorDestinationID = list("colorDestinationID", "Color Destination", 0, [	opt(ColorDestination.None, "None"),
																					opt(ColorDestination.COLORDESTINATIONDOCCMYK, "Document CMYK"), 
																					opt(ColorDestination.COLORDESTINATIONDOCRGB, "Document RGB"), 
																					opt(ColorDestination.COLORDESTINATIONWORKINGCMYK, "Working CMYK"), 
																					opt(ColorDestination.COLORDESTINATIONWORKINGRGB, "Working RGB"), 
																					opt(ColorDestination.COLORDESTINATIONPROFILE, "Profile (Select Below)")]);
	
	var colorProfileID = list("colorProfileID", "Include Color Profile", 0, [
							opt(ColorProfile.None, "None"),
							opt(ColorProfile.LEAVEPROFILEUNCHANGED, "Leave Unchanged"),
							opt(ColorProfile.INCLUDEALLPROFILE, "Include All Profiles"),
							opt(ColorProfile.INCLUDEDESTPROFILE, "Include Destination Profile"),
							opt(ColorProfile.INCLUDERGBPROFILE, "Include RGB Profile")
							]);

	var colorDownsampling = num("colorDownsampling", "Downsampling", 150, "ppi");
	var colorDownsamplingImageThreshold = num("colorDownsamplingImageThreshold", "Threshold", 225, "ppi");
	var colorDownsamplingMethod = list("colorDownsamplingMethod", "Downsample Method", 0, [opt(DownsampleMethod.NODOWNSAMPLE, "None"), opt(DownsampleMethod.AVERAGEDOWNSAMPLE, "Average"), opt(DownsampleMethod.BICUBICDOWNSAMPLE, "Bicubic"), opt(DownsampleMethod.SUBSAMPLE, "Subpixel")]);
	var colorCompression = list("colorCompression", "Compression", 0, compressionQuality);
	var colorTileSize = num("colorTileSize", "Color Tile Size (JPEG 2000)", 256, "px");



	var grayscaleDownsampling = num("grayscaleDownsampling", "Downsampling", 150, "ppi");
	var grayscaleDownsamplingImageThreshold = num("grayscaleDownsamplingImageThreshold", "Threshold", 225, "ppi");
	var grayscaleDownsamplingMethod = list("grayscaleDownsamplingMethod", "Downsample Method", 0, [opt(DownsampleMethod.NODOWNSAMPLE, "None"), opt(DownsampleMethod.AVERAGEDOWNSAMPLE, "Average"), opt(DownsampleMethod.BICUBICDOWNSAMPLE, "Bicubic"), opt(DownsampleMethod.SUBSAMPLE, "Subpixel")]);
	var grayscaleCompression = list("grayscaleCompression", "Compression", 0, compressionQuality);
	var grayscaleTileSize = num("grayscaleTileSize", "Tile Size (JPEG 2000)", 256, "px");
	
	var monochromeDownsampling = num("monochromeDownsampling", "Downsampling", 150, "ppi");
	var monochromeDownsamplingImageThreshold = num("monochromeDownsamplingImageThreshold", "Threshold", 225, "ppi");
	var monochromeDownsamplingMethod = list("monochromeDownsamplingMethod", "Downsample Method", 0, [opt(DownsampleMethod.NODOWNSAMPLE, "None"), opt(DownsampleMethod.AVERAGEDOWNSAMPLE, "Average"), opt(DownsampleMethod.BICUBICDOWNSAMPLE, "Bicubic"), opt(DownsampleMethod.SUBSAMPLE, "Subpixel")]);
	var monochromeCompression = list("monochromeCompression", "Compression", 0, [
							opt(MonochromeCompression.None, "None"),
							opt(MonochromeCompression.CCIT3, "CCITT Group 3"),
							opt(MonochromeCompression.CCIT4, "CCITT Group 4"),
							opt(MonochromeCompression.MONOZIP, "ZIP"),
							opt(MonochromeCompression.RUNLENGTH, "Run Length")
							]);
	

	var flatteners = [opt(null, "None")];
	if(app.flattenerPresetList != null){
		for(var i=0; i<app.flattenerPresetList.length; i++){
			var preset = app.flattenerPresetList[i];
			flatteners.push(opt(preset, preset));
		}
	}
	var flattenerPreset = list("flattenerPreset", "Flattener Preset (PDF 1.3 Only)", 0, flatteners);


	// var pdfPresets = [opt(null, "None")];
	// if(app.PDFPresetsList != null){
	// 	for(var i=0; i<app.PDFPresetsList.length; i++){
	// 		var preset = app.PDFPresetsList[i];
	// 		pdfPresets.push(opt(preset, preset));
	// 	}
	// }
	// var pDFPreset = list("pDFPreset", "PDF Preset", 0, pdfPresets);

	
	var pdfPresets;
	if(app.PDFPresetsList != null){
		pdfPresets = [];
	 	for(var i=0; i<app.PDFPresetsList.length; i++){
	 		var preset = app.PDFPresetsList[i];
	 		pdfPresets.push(opt(preset, preset));
	 	}
	}


	var pDFXStandard = list("pDFXStandard", "PDFX Standard", 0, [
							opt(PDFXStandard.PDFXNONE, "None"),
							opt(PDFXStandard.PDFX1A2001, "1A 2001"),
							opt(PDFXStandard.PDFX1A2003, "1A 2003"),
							opt(PDFXStandard.PDFX32002, "3 2002"),
							opt(PDFXStandard.PDFX32003, "3 2003"),
							opt(PDFXStandard.PDFX42007, "4 2007")
							]);



	var documentPassword = string("documentPassword", "Open Password", null, "requireDocumentPassword");
	var permissionPassword = string("permissionPassword", "Permission Password", null, "requirePermissionPassword");

	var pDFAllowPrinting = list("pDFAllowPrinting", "Allow Printing", 0, [	opt(PDFPrintAllowedEnum.PRINT128HIGHRESOLUTION, "High Resolution (128bit)"),
																			opt(PDFPrintAllowedEnum.PRINT128LOWRESOLUTION, "Low Resolution (128bit)"),
																			opt(PDFPrintAllowedEnum.PRINT128NONE, "None (128bit)"),
																			opt(PDFPrintAllowedEnum.PRINT40HIGHRESOLUTION, "High Resolution (40bit)"),
																			opt(PDFPrintAllowedEnum.PRINT40NONE, "None (40bit)")]);
	var pDFChangesAllowed = list("pDFChangesAllowed", "Changes Allowed", 0, [	opt(PDFChangesAllowedEnum.CHANGE128ANYCHANGES, "Any Changes (128bit)"),
																				opt(PDFChangesAllowedEnum.CHANGE128COMMENTING, "Commenting (128bit)"),
																				opt(PDFChangesAllowedEnum.CHANGE128EDITPAGE, "Edit Page (128bit)"),
																				opt(PDFChangesAllowedEnum.CHANGE128FILLFORM, "Fill Form (128bit)"),
																				opt(PDFChangesAllowedEnum.CHANGE128NONE, "None (128bit)"),
																				opt(PDFChangesAllowedEnum.CHANGE40ANYCHANGES, "Any Changes (40bit)"),
																				opt(PDFChangesAllowedEnum.CHANGE40COMMENTING, "Commenting (40bit)"),
																				opt(PDFChangesAllowedEnum.CHANGE40PAGELAYOUT, "Page Layout (40bit)"),
																				opt(PDFChangesAllowedEnum.CHANGE40NONE, "None (40bit)")]);
	var enableAccess = bool("enableAccess", "Enable 128bit Access", true);
	var enableCopy = bool("enableCopy", "Enable 128bit Copy", true);
	var enablePlainText = bool("enablePlainText", "Enable 128bit Plaintext Metadata", false);
	var enableCopyAccess = bool("enableCopyAccess", "Enable 40bit Copy and Access", true);
	

	// copyBehaviour - for vector outputs the output must be done from a copy of the document (to avoid hidden layers being included in output)
	pack.formats =  [   {name:"PNG 8", ext:'png', defaultDir:'png8', copyBehaviour:false, getOptions:getPng8Options, saveFile:savePng8, props:["scaling","trimEdges","innerPadding"],
							more:[	{options:[transparency, antiAliasing, colorCount, colorDither, colorReduction, ditherPercent, interlaced, matteColor, webSnap]}]},

						{name:"PNG 24", ext:'png', defaultDir:'png24', copyBehaviour:false, getOptions:getPng24Options, saveFile:savePng24, props:["scaling","trimEdges","innerPadding"],
							more:[	{options:[transparency, antiAliasing, matteColor]}]},

						{name:"JPG", ext:'jpg', defaultDir:'jpg', copyBehaviour:false, getOptions:getJpgOptions, saveFile:saveJpg, props:["scaling","trimEdges","innerPadding"],
							more:[	{options:[antiAliasing, blurAmount, matteColor, optimization, qualitySetting]}]},

						{name:"GIF", ext:'gif', defaultDir:'gif', copyBehaviour:false, getOptions:getGifOptions, saveFile:saveGif, props:["scaling","trimEdges","innerPadding"],
							more:[	{options:[transparency, antiAliasing, colorCount, colorDither, colorReduction, ditherPercent, infoLossPercent, interlaced, matteColor, webSnap]}]},

						{name:"EPS", ext:'eps', defaultDir:'eps', copyBehaviour:true, getOptions:getEpsOptions, saveFile:saveEps, props:["embedImage","fontEmbed","fontOutline","trimEdges","ungroup"],
							more:[	{options:[cmykPostScript, compatibility, flattenOuput, includeDocumentThumbnails, overprint, epsVersion, epsPreview]} ]},

						{name:"SVG", ext:'svg', defaultDir:'svg', copyBehaviour:true, getOptions:getSvgOptions, saveFile:saveSvg, props:["embedImage","fontOutline","trimEdges","ungroup"],
							more:[	{options:[coordinatePrecision, cssProperties, documentEncoding, DTD, fontSubsetting, fontType, includeFileInfo, includeUnusedStyles, preserveEditability, slices, sVGAutoKerning, sVGTextOnPath]} ]},

						{name:"SVGZ", ext:'svgz', defaultDir:'svgz', copyBehaviour:true, getOptions:getSvgOptions, saveFile:saveSvg, props:["embedImage","fontOutline","trimEdges","ungroup"],
							more:[	{options:[coordinatePrecision, cssProperties, documentEncoding, DTD, fontSubsetting, fontType, includeFileInfo, includeUnusedStyles, preserveEditability, slices, sVGAutoKerning, sVGTextOnPath]} ],
							extra:{ compressed:true }},

						{name:"AI", ext:'ai', defaultDir:'ai', copyBehaviour:true, getOptions:getAiOptions, saveFile:saveAi, props:["embedImage","fontOutline","trimEdges","ungroup"],
							more:[	{options:[compatibility, compressed, embedICCProfile, fontSubsetThreshold, pdfCompatible]} ]},

						{name:"PDF", ext:'pdf', defaultDir:'pdf', copyBehaviour:true, getOptions:getPdfOptions, saveFile:savePdf, props:["trimEdges","fontOutline","ungroup"], presets:pdfPresets,
							more:[
								{options:[pDFXStandard, pdfCompatibility]},

								{name:"General", options:[preserveEditability, generateThumbnails, acrobatLayers]},

								{name:"Color Compression", options:[colorDownsamplingMethod, colorDownsampling, colorDownsamplingImageThreshold, colorCompression, colorTileSize]},

								{name:"Grayscale Compression", options:[grayscaleDownsamplingMethod, grayscaleDownsampling, grayscaleDownsamplingImageThreshold, grayscaleCompression, grayscaleTileSize]},

								{name:"Monochrome Compression", options:[monochromeDownsamplingMethod, monochromeDownsampling, monochromeDownsamplingImageThreshold, monochromeCompression]},

								{name:"Masks and Bleeds", options:[pageMarksType, registrationMarks, trimMarks, trimMarkWeight, colorBars, offset, pageInformation, bleedOffsetRect]},

								{name:"Output", options:[colorConversionID, colorDestinationID, colorProfileID]},

								{name:"Advanced", options:[fontSubsetThreshold, flattenerPreset]},

								{name:"Security", options:[documentPassword, permissionPassword, pDFAllowPrinting, pDFChangesAllowed, enableAccess, enableCopy, enablePlainText, enableCopyAccess]}
							]}
					];

	if(parseFloat(app.version) < 17){
		// FXG not available in CC and above
		var blendsPolicy = list("blendsPolicy", "Blend Policy", 0, [opt(BlendsExpandPolicy.AUTOMATICALLYCONVERTBLENDS, "Automatically Convert Blends"), opt(BlendsExpandPolicy.RASTERIZEBLENDS, "Rasterize Blends")]);
		var downsampleLinkedImages = bool("downsampleLinkedImages", "Downsample Linked Images", false);
		var filtersPolicy = list("filtersPolicy", "Filters Policy", 1, [opt(FiltersPreservePolicy.EXPANDFILTERS, "Expand Filters"), opt(FiltersPreservePolicy.KEEPFILTERSEDITABLE, "Keep Filters Editable"), opt(FiltersPreservePolicy.RASTERIZEFILTERS, "Rasterize Filters")]);
		var gradientsPolicy = list("gradientsPolicy", "Gradients Policy", 0, [opt(GradientsPreservePolicy.AUTOMATICALLYCONVERTGRADIENTS, "Automatically Convert Gradients"), opt(GradientsPreservePolicy.KEEPGRADIENTSEDITABLE, "Keep Gradients Editable")]);
		var includeUnusedSymbols = bool("includeUnusedSymbols", "Include Unused Symbols", false);
		var preserveEditingCapabilities = bool("preserveEditingCapabilities", "Preserve Editing Capabilities", true);
		var textPolicy = list("textPolicy", "Text Policy", 0, [opt(TextPreservePolicy.AUTOMATICALLYCONVERTTEXT, "Automatically Convert Text"), opt(TextPreservePolicy.OUTLINETEXT, "Outline Text"), opt(TextPreservePolicy.KEEPTEXTEDITABLE, "Keep Text Editable"), opt(TextPreservePolicy.RASTERIZETEXT, "Rasterize Text")]);
		var fxgVersion = list("version", "Version", 1, [opt(FXGVersion.VERSION1PT0, "1.0"), opt(FXGVersion.VERSION2PT0, "2.0")]);
		pack.formats.push(	{name:"FXG", ext:'fxg', defaultDir:'fxg', copyBehaviour:true, getOptions:getFxgOptions, saveFile:saveFxg, props:["trimEdges","fontOutline","ungroup"],
							 more:[	blendsPolicy, downsampleLinkedImages, filtersPolicy, gradientsPolicy, includeUnusedSymbols, preserveEditingCapabilities, textPolicy, fxgVersion ]});
	}

	pack.getFormat = function(formatName){
		for(var i=0; i<pack.formats.length; i++){
			var format = pack.formats[i];
			if(format.name==formatName)return format;
		}
	}

})(smartExport)