(function(pack){

	var fillOptions = function(options, formatSettings){
		var props = formatSettings.formatRef.more;
		var values = formatSettings.options;
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
					value = value==-1 ? null : prop.options[value].key;
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
		var extra = formatSettings.formatRef.extra;
		if(extra){
			for(var i in extra){
				options[i] = extra[i];
			}
		}
	}
		
	// Format specific functionality
	var getPng8Options = function ( formatSettings, scaling ) {
		var options = new ExportOptionsPNG8();
		options.antiAliasing = true;
		options.transparency = formatSettings.transparency; 
		options.artBoardClipping = true;
		options.horizontalScale = scaling;
		options.verticalScale = scaling;
		fillOptions(options, formatSettings);
		return options;
	}
	var getPng24Options = function ( formatSettings, scaling ) {
		var options = new ExportOptionsPNG24();
		options.antiAliasing = true;
		options.transparency = formatSettings.transparency; 
		options.artBoardClipping = true;
		options.horizontalScale = scaling;
		options.verticalScale = scaling;	
		fillOptions(options, formatSettings);
		return options;
	}
	var getPdfOptions = function ( formatSettings, scaling ) {
		var options = new PDFSaveOptions();
		options.compatibility = PDFCompatibility.ACROBAT5;
		options.generateThumbnails = true;
		options.preserveEditability = false;
		fillOptions(options, formatSettings);
		return options;
	}
	var getJpgOptions = function ( formatSettings, scaling ) {
		var options = new ExportOptionsJPEG();
		options.antiAliasing = true;
		options.artBoardClipping = true;
		options.horizontalScale = scaling;
		options.verticalScale = scaling;	
		fillOptions(options, formatSettings);
		return options;
	}
	var getGifOptions = function ( formatSettings, scaling ) {
		var options = new ExportOptionsGIF();
		options.antiAliasing = true;
		options.artBoardClipping = true;
		options.horizontalScale = scaling;
		options.verticalScale = scaling;	
		fillOptions(options, formatSettings);
		return options;
	}
	var getEpsOptions = function ( formatSettings, scaling ) {
		var options = new EPSSaveOptions();
		options.embedLinkedFiles = formatSettings.embedImage;
		options.embedAllFonts = (formatSettings.fontHandling=="embed");
		options.includeDocumentThumbnails = true;
		options.saveMultipleArtboards = false;
		fillOptions(options, formatSettings);
		return options;
	}
	var getSvgOptions = function ( formatSettings, scaling ) {
		options = new ExportOptionsSVG();
		options.embedRasterImages = formatSettings.embedImage;
		//options.saveMultipleArtboards = true;
		fillOptions(options, formatSettings);
		return options;
	}
	var getFxgOptions = function ( formatSettings, scaling ) {
		options = new FXGSaveOptions();
		fillOptions(options, formatSettings);
		return options;
	}
	var getAiOptions = function ( formatSettings, scaling ) {
		options = new IllustratorSaveOptions();
		options.embedLinkedFiles = formatSettings.embedImage;
		fillOptions(options, formatSettings);
		return options;
	}

	// Format specific save functions
	var savePng8 = function ( doc, filePath, options, artboardIndex, artboardName ) {
		var destFile = new File( filePath );
		doc.exportFile(destFile, ExportType.PNG8 , options);
	}
	var savePng24 = function ( doc, filePath, options, artboardIndex, artboardName ) {
		var destFile = new File( filePath );
		doc.exportFile(destFile, ExportType.PNG24 , options);
	}
	var savePdf = function ( doc, filePath, options, artboardIndex, artboardName ) {
		var destFile = new File( filePath );
		doc.saveAs( destFile, options, artboardIndex, artboardName )
	}
	var saveJpg = function ( doc, filePath, options, artboardIndex, artboardName ) {
		var destFile = new File( filePath );
		doc.exportFile(destFile, ExportType.JPEG , options);
	}
	var saveGif = function ( doc, filePath, options, artboardIndex, artboardName ) {
		var destFile = new File( filePath );
		doc.exportFile(destFile, ExportType.GIF , options);
	}
	var saveEps = function ( doc, filePath, options, artboardIndex, artboardName ) {
		var destFile = new File( filePath );
		doc.saveAs( destFile, options, artboardIndex, artboardName )			
	}
	var saveAi = function ( doc, filePath, options, artboardIndex, artboardName ) {
		var destFile = new File( filePath );
		doc.saveAs( destFile, options, artboardIndex, artboardName )			
	}
	var saveSvg = function ( doc, filePath, options, artboardIndex, artboardName ) {
		var destFile = new File( filePath );
		doc.exportFile(destFile, ExportType.SVG , options);
	}
	var saveFxg = function ( doc, filePath, options, artboardIndex, artboardName ) {
		var destFile = new File( filePath );
		doc.saveAs( destFile, options, artboardIndex, artboardName )	
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
	var margin = function(id, name, def, optional, linkedProp){
		return {type:"margin", id:id, name:name, def:def, optional:optional, linkedProp:linkedProp};
	}
	var string = function(id, name, def, optionalProp){
		return {type:"string", id:id, name:name, def:def, optionalProp:optionalProp};
	}

	var antiAliasing = bool("antiAliasing", "Anti-aliasing", true);
	var colorCount = range("colorCount", "Color Count", 2, 256, 128);
	var colorDither = list("colorDither", "Color Dither", 1, [opt(ColorDitherMethod.NOREDUCTION, "No Dither"), opt(ColorDitherMethod.DIFFUSION, "Diffusion"), opt(ColorDitherMethod.PATTERNDITHER, "Pattern"), opt(ColorDitherMethod.NOISE, "Noise")]);
	var colorReduction = list("colorReduction", "Color Reduction", 1, [opt(ColorReductionMethod.PERCEPTUAL, "Perceptual"), opt(ColorReductionMethod.SELECTIVE, "Selective"), opt(ColorReductionMethod.ADAPTIVE, "Adaptive"), opt(ColorReductionMethod.WEB, "Restrictive (Web)")]);
	var ditherPercent = percent("ditherPercent", "Dither Percent", 50);
	var interlaced = bool("interlaced", "Interlaced", false);
	var matteColor = color("matteColor", "Matte", null, true, "matte");
	var saveAsHTML = bool("saveAsHTML", "Save with HTML", false);
	var webSnap = percent("webSnap", "Web Snap", 0);
	var blurAmount = range("blurAmount", "Blur Amount", 0, 2, 0);
	var optimization = bool("optimization", "Optimization", true);
	var qualitySetting = percent("qualitySetting", "Quality", 30);
	var infoLossPercent = percent("infoLossPercent", "Info Loss Percent", 0);
	var compatList = [opt(Compatibility.ILLUSTRATOR8, "Illustrator 8"), opt(Compatibility.ILLUSTRATOR9, "Illustrator 9"), opt(Compatibility.ILLUSTRATOR10, "Illustrator 10"), opt(Compatibility.ILLUSTRATOR11, "Illustrator 11 (CS)"), opt(Compatibility.ILLUSTRATOR12, "Illustrator 12 (CS2)"), opt(Compatibility.ILLUSTRATOR13, "Illustrator 13 (CS3)"), opt(Compatibility.ILLUSTRATOR14, "Illustrator 14 (CS4)"), opt(Compatibility.ILLUSTRATOR15, "Illustrator 15 (CS5)"), opt(Compatibility.ILLUSTRATOR16, "Illustrator 16 (CS6)")]
	if(parseFloat(app.version) >= 17){
		compatList.push(opt(Compatibility.ILLUSTRATOR17, "Illustrator 17 (CC)"));
	}
	compatList.push(opt(Compatibility.JAPANESEVERSION3, "Japanese Version 3"));
	var compatibility = list("compatibility", "Compatibility", 9, compatList);
	var fontSubsetThreshold = percent("fontSubsetThreshold", "Font Subset Threshold", 100);

	// AI
	var compressed = bool("compressed", "Compressed", true);
	var embedICCProfile = bool("embedICCProfile", "Embed ICC Profile", false);
	var pdfCompatible = bool("pdfCompatible", "PDF Compatible", true);

	// SVG
	var coordinatePrecision = range("coordinatePrecision", "Precision", 1, 7, 3);
	var cssProperties = list("cssProperties", "CSS Properties", 1, [opt(SVGCSSPropertyLocation.ENTITIES, "Entities"), opt(SVGCSSPropertyLocation.STYLEATTRIBUTES, "Style Attributes"), opt(SVGCSSPropertyLocation.PRESENTATIONATTRIBUTES, "Presentation Attributes"), opt(SVGCSSPropertyLocation.STYLEELEMENTS, "Style Elements")]);
	var documentEncoding = list("documentEncoding", "Document Encoding", 0, [opt(SVGDocumentEncoding.ASCII, "ASCII"), opt(SVGDocumentEncoding.UTF8, "UTF-8"), opt(SVGDocumentEncoding.UTF16, "UTF-16")]);
	var DTD = list("DTD", "DTD Version", 1, [opt(SVGDTDVersion.SVG1_0, "SVG 1.0"), opt(SVGDTDVersion.SVG1_1, "SVG 1.1"), opt(SVGDTDVersion.SVGBASIC1_1, "SVG Basic 1.1"), opt(SVGDTDVersion.SVGTINY1_1, "SVG Tiny 1.1"), opt(SVGDTDVersion.SVGTINY1_1PLUS, "SVG Tiny 1.1+"), opt(SVGDTDVersion.SVGTINY1_2, "SVG Tiny 1.2")]);
	var fontSubsetting = list("fontSubsetting", "Font Subsetting", 0, [opt(SVGFontSubsetting.ALLGLYPHS, "All Glyphs"), opt(SVGFontSubsetting.COMMONENGLISH, "Common English"), opt(SVGFontSubsetting.COMMONROMAN, "Common Roman"), opt(SVGFontSubsetting.GLYPHSUSED, "Glyphs Used"), opt(SVGFontSubsetting.GLYPHSUSEDPLUSENGLISH, "Glyphs used plus English"), opt(SVGFontSubsetting.GLYPHSUSEDPLUSROMAN, "Glyphs used plus Roman"), opt(SVGFontSubsetting.None, "None")]);
	var fontType = list("fontType", "Font Type", 0, [opt(SVGFontType.CEFFONT, "CEF Fonts"), opt(SVGFontType.SVGFONT, "SVG Fonts"), opt(SVGFontType.OUTLINEFONT, "Outline Fonts")]);
	var includeFileInfo = bool("includeFileInfo", "Include File Info", false);
	var includeUnusedStyles = bool("includeUnusedStyles", "Include Unused Styles", false);
	var includeVariablesAndDatasets = bool("includeVariablesAndDatasets", "Include Variables and Data", false);
	var preserveEditability = bool("preserveEditability", "Preserve Editability", false);
	var slices = bool("slices", "Slices", false);
	var sVGAutoKerning = bool("sVGAutoKerning", "SVG Auto Kerning", false);
	var sVGTextOnPath = bool("sVGTextOnPath", "SVG Text on Path", false);

	// FXG
	var blendsPolicy = list("blendsPolicy", "Blend Policy", 0, [opt(BlendsExpandPolicy.AUTOMATICALLYCONVERTBLENDS, "Automatically Convert Blends"), opt(BlendsExpandPolicy.RASTERIZEBLENDS, "Rasterize Blends")]);
	var downsampleLinkedImages = bool("downsampleLinkedImages", "Downsample Linked Images", false);
	var filtersPolicy = list("filtersPolicy", "Filters Policy", 1, [opt(FiltersPreservePolicy.EXPANDFILTERS, "Expand Filters"), opt(FiltersPreservePolicy.KEEPFILTERSEDITABLE, "Keep Filters Editable"), opt(FiltersPreservePolicy.RASTERIZEFILTERS, "Rasterize Filters")]);
	var gradientsPolicy = list("gradientsPolicy", "Gradients Policy", 0, [opt(GradientsPreservePolicy.AUTOMATICALLYCONVERTGRADIENTS, "Automatically Convert Gradients"), opt(GradientsPreservePolicy.KEEPGRADIENTSEDITABLE, "Keep Gradients Editable")]);
	var includeUnusedSymbols = bool("includeUnusedSymbols", "Include Unused Symbols", false);
	var preserveEditingCapabilities = bool("preserveEditingCapabilities", "Preserve Editing Capabilities", true);
	var textPolicy = list("textPolicy", "Text Policy", 0, [opt(TextPreservePolicy.AUTOMATICALLYCONVERTTEXT, "Automatically Convert Text"), opt(TextPreservePolicy.OUTLINETEXT, "Outline Text"), opt(TextPreservePolicy.KEEPTEXTEDITABLE, "Keep Text Editable"), opt(TextPreservePolicy.RASTERIZETEXT, "Rasterize Text")]);
	var fxgVersion = list("version", "Version", 1, [opt(FXGVersion.VERSION1PT0, "1.0"), opt(FXGVersion.VERSION2PT0, "2.0")]);
	
	// EPS
	var cmykPostScript = bool("cmykPostScript", "CMYK Postscript", false);
	var compatibleGradientPrinting = bool("compatibleGradientPrinting", "Compatibility Gradient Printing", false);
	var flattenOuput = list("flattenOuput", "Flatten Output", 0, [opt(OutputFlattening.PRESERVEAPPEARANCE, "Preserve Appearance"), opt(OutputFlattening.PRESERVEPATHS, "Preserve Paths")]);
	var includeDocumentThumbnails = bool("includeDocumentThumbnails", "Include Document Thumbnails", false);
	var overprint = list("overprint", "PDF Overprint", 1, [opt(PDFOverprint.DISCARDPDFOVERPRINT, "Discard"), opt(PDFOverprint.PRESERVEPDFOVERPRINT, "Preserve")]);
	var epsVersion = list("postScript", "Version", 0, [opt(EPSPostScriptLevelEnum.LEVEL2, "2"), opt(EPSPostScriptLevelEnum.LEVEL3, "3")]);
	var epsPreview = list("preview", "Preview Format", 3, [opt(EPSPreview.BWTIFF, "TIFF (B&W)"), opt(EPSPreview.COLORTIFF, "TIFF (Color)"), opt(EPSPreview.TRANSPARENTCOLORTIFF, "TIFF (Color w/ Transparency)"), opt(EPSPreview.None, "None")]);
	
	// PDF
	var pdfCompatibility = list("compatibility", "Version Compatibility", 1, [opt(PDFCompatibility.ACROBAT4, "Acrobat 4"), opt(PDFCompatibility.ACROBAT4, "Acrobat 5"), opt(PDFCompatibility.ACROBAT4, "Acrobat 6"), opt(PDFCompatibility.ACROBAT4, "Acrobat 7"), opt(PDFCompatibility.ACROBAT4, "Acrobat 8")]);
	var acrobatLayers = bool("acrobatLayers", "Acrobat Layers", false);
	//var bleedOffsetRect = margin("bleedOffsetRect", "Bleed Offset", null, true, "bleedLink");
	//var colorBars = bool("colorBars", "Color Bars", false);
	var documentPassword = string("documentPassword", "Open Password", null, "requireDocumentPassword");
	var permissionPassword = string("permissionPassword", "Permission Password", null, "requirePermissionPassword");
	/*var enableAccess = bool("enableAccess", "Enable 128bit Access", true);
	var enableCopy = bool("enableCopy", "Enable 128bit Copy", true);
	var enablePlainText = bool("enableCopy", "Enable 128bit Plaintext Metadata", false);
	var enableCopyAccess = bool("enableCopyAccess", "Enable 40bit Copy and Access", true);*/
	var compressArt = bool("compressArt", "Compress Art", true);
	var generateThumbnails = bool("generateThumbnails", "Generate Thumbnails", true);
	//var offset = num("offset", "Custom Paper Offset", 0, "pts");
	var optimization = bool("optimization", "Optimization", false);
	var pageInformation = bool("pageInformation", "Include Page Information", false);
	/*var pDFAllowPrinting = list("pDFAllowPrinting", "Allow Printing", 0, [	opt(PDFPrintAllowedEnum.PRINT128HIGHRESOLUTION, "High Resolution (128bit)"),
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
																				opt(PDFChangesAllowedEnum.CHANGE40NONE, "None (40bit)")]);*/
	var preserveEditability = bool("preserveEditability", "Preserve Editability", true);
	var printerResolution = num("printerResolution", "Printer Resolution", 800, "dpi");
	//var trapped = bool("trapped", "Manual Trapping Prepared", true);

	//var pageMarksType = list("pageMarksType", "Page Marks", 0, [opt(PageMarksTypes.Roman, "Roman"), opt(PageMarksTypes.Japanese, "Japanese")]);
	var registrationMarks = bool("registrationMarks", "Registration Marks", false);
	var trimMarks = bool("trimMarks", "Trim Marks", false);
	var trimMarkWeight = list("trimMarkWeight", "Trim Mark Weight", 0, [opt(PDFTrimMarkWeight.TRIMMARKWEIGHT0125, "0.125"), opt(PDFTrimMarkWeight.TRIMMARKWEIGHT025, "0.25"), opt(PDFTrimMarkWeight.TRIMMARKWEIGHT05, "0.5")]);
	
	/*var colorCompression = list("colorCompression", "Color Compression", 0, [		opt(CompressionQuality.None, "None"),
																					sublist("Automatic (JPEG)", 0,     [opt(CompressionQuality.AUTOMATICJPEGMINIMUM, "Minimum"),
																														opt(CompressionQuality.AUTOMATICJPEGLOW, "Low"),
																														opt(CompressionQuality.AUTOMATICJPEGMEDIUM, "Medium"),
																														opt(CompressionQuality.AUTOMATICJPEGHIGH, "High"),
																														opt(CompressionQuality.AUTOMATICJPEGMAXIMUM, "Maximum")]),

																					sublist("Automatic (JPEG2000)", 0, [opt(CompressionQuality.AUTOMATICJPEG2000MINIMUM, "Minimum"),
																														opt(CompressionQuality.AUTOMATICJPEG2000LOW, "Low"),
																														opt(CompressionQuality.AUTOMATICJPEG2000MEDIUM, "Medium"),
																														opt(CompressionQuality.AUTOMATICJPEG2000HIGH, "High"),
																														opt(CompressionQuality.AUTOMATICJPEG2000MAXIMUM, "Maximum"),
																														opt(CompressionQuality.AUTOMATICJPEG2000LOSSLESS, "Lossless")]),

																					sublist("JPEG", 0, [				opt(CompressionQuality.JPEGMINIMUM, "Minimum"),
																														opt(CompressionQuality.JPEGLOW, "Low"),
																														opt(CompressionQuality.JPEGMEDIUM, "Medium"),
																														opt(CompressionQuality.JPEGHIGH, "High"),
																														opt(CompressionQuality.JPEGMAXIMUM, "Maximum")]),

																					sublist("JPEG2000", 0, [			opt(CompressionQuality.JPEG2000MINIMUM, "Minimum"),
																														opt(CompressionQuality.JPEG2000LOW, "Low"),
																														opt(CompressionQuality.JPEG2000MEDIUM, "Medium"),
																														opt(CompressionQuality.JPEG2000HIGH, "High"),
																														opt(CompressionQuality.JPEG2000MAXIMUM, "Maximum"),
																														opt(CompressionQuality.JPEG2000LOSSLESS, "Lossless")])
																					]);
	var colorConversionID = list("colorConversionID", "Color Conversion", 0, [opt(ColorConversion.None, "None"), opt(ColorConversion.COLORCONVERSIONREPURPOSE, "Convert to Destination, Preserve Numbers (Select Below)"), opt(ColorConversion.COLORCONVERSIONTODEST, "Convert to Destination (Select Below)")]);
	var colorDestinationID = list("colorDestinationID", "Color Destination", 0, [	opt(ColorDestination.None, "None"),
																					opt(ColorDestination.COLORDESTINATIONDOCCMYK, "Document CMYK"), 
																					opt(ColorDestination.COLORDESTINATIONDOCRGB, "Document RGB"), 
																					opt(ColorDestination.COLORDESTINATIONWORKINGCMYK, "Working CMYK"), 
																					opt(ColorDestination.COLORDESTINATIONWORKINGRGB, "Working RGB"), 
																					opt(ColorDestination.COLORDESTINATIONPROFILE, "Profile (Select Below)")]);
	var colorDownsampling = num("colorDownsampling", "Color Downsampling", 150, "dpi");
	var colorDownsamplingImageThreshold = num("colorDownsamplingImageThreshold", "Color Downsampling Threshold", 225, "dpi");
	var colorDownsamplingMethod = list("colorDownsamplingMethod", "Color Downsample Method", 0, [opt(DownsampleMethod.NODOWNSAMPLE, "None"), opt(DownsampleMethod.AVERAGEDOWNSAMPLE, "Average"), opt(DownsampleMethod.BICUBICDOWNSAMPLE, "Bicubic"), opt(DownsampleMethod.SUBSAMPLE, "Subpixel")]);
	*/


	// copyBehaviour - for vector outputs the output must be done from a copy of the document (to avoid hidden layers being included in output)
	pack.formats =  [   {name:"PNG 8", ext:'png', defaultDir:'png8', copyBehaviour:false, getOptions:getPng8Options, saveFile:savePng8, props:["scaling","transparency","trimEdges","innerPadding"],
							more:[	antiAliasing, colorCount, colorDither, colorReduction, ditherPercent, interlaced, matteColor, saveAsHTML, webSnap]},

						{name:"PNG 24", ext:'png', defaultDir:'png24', copyBehaviour:false, getOptions:getPng24Options, saveFile:savePng24, props:["scaling","transparency","trimEdges","innerPadding"],
							more:[	antiAliasing, matteColor, saveAsHTML]},

						{name:"JPG", ext:'jpg', defaultDir:'jpg', copyBehaviour:false, getOptions:getJpgOptions, saveFile:saveJpg, props:["scaling","trimEdges","innerPadding"],
							more:[	antiAliasing, blurAmount, matteColor, optimization, qualitySetting, saveAsHTML]},

						{name:"GIF", ext:'gif', defaultDir:'gif', copyBehaviour:false, getOptions:getGifOptions, saveFile:saveGif, props:["scaling","transparency","trimEdges","innerPadding"],
							more:[	antiAliasing, colorCount, colorDither, colorReduction, ditherPercent, infoLossPercent, interlaced, matteColor, saveAsHTML, webSnap]},

						{name:"EPS", ext:'eps', defaultDir:'eps', copyBehaviour:true, getOptions:getEpsOptions, saveFile:saveEps, props:["embedImage","fontEmbed","fontOutline","trimEdges"],
							more:[	cmykPostScript, compatibility, flattenOuput, includeDocumentThumbnails, overprint, epsVersion, epsPreview ]},

						{name:"SVG", ext:'svg', defaultDir:'svg', copyBehaviour:true, getOptions:getSvgOptions, saveFile:saveSvg, props:["embedImage","fontOutline","trimEdges"],
							more:[	coordinatePrecision, cssProperties, documentEncoding, DTD, fontSubsetting, fontType, includeFileInfo, includeUnusedStyles, preserveEditability, slices, sVGAutoKerning, sVGTextOnPath ]},

						{name:"AI", ext:'ai', defaultDir:'ai', copyBehaviour:true, getOptions:getAiOptions, saveFile:saveAi, props:["embedImage","fontOutline","trimEdges"],
							more:[	compatibility, compressed, embedICCProfile, fontSubsetThreshold, pdfCompatible ]},

						{name:"SVGZ", ext:'svgz', defaultDir:'svgz', copyBehaviour:true, getOptions:getSvgOptions, saveFile:saveSvg, props:["embedImage","fontOutline","trimEdges"],
							more:[	coordinatePrecision, cssProperties, documentEncoding, DTD, fontSubsetting, fontType, includeFileInfo, includeUnusedStyles, preserveEditability, slices, sVGAutoKerning, sVGTextOnPath ],
							extra:{ compressed:true }},

						{name:"PDF", ext:'pdf', defaultDir:'pdf', copyBehaviour:false, getOptions:getPdfOptions, saveFile:savePdf, props:["trimEdges","fontOutline"],
							more:[	pdfCompatibility, acrobatLayers, documentPassword, permissionPassword,
							fontSubsetThreshold, compressArt, generateThumbnails, optimization, pageInformation, preserveEditability, printerResolution,
							registrationMarks, trimMarks, trimMarkWeight ]},

						{name:"FXG", ext:'fxg', defaultDir:'fxg', copyBehaviour:true, getOptions:getFxgOptions, saveFile:saveFxg, props:["trimEdges","fontOutline"],
							more:[	blendsPolicy, downsampleLinkedImages, filtersPolicy, gradientsPolicy, includeUnusedSymbols, textPolicy, fxgVersion ]}];

	pack.getFormat = function(formatName){
		for(var i=0; i<pack.formats.length; i++){
			var format = pack.formats[i];
			if(format.name==formatName)return format;
		}
	}

})(smartExport)