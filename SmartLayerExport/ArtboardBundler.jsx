(function(pack){
	ArtboardBundler = {};


	ArtboardBundler.add = function(docRef, bundles, exportSettings, patternName){

		var artboardInd = exportSettings.artboardInd;

		for (var i = 0; i < artboardInd.length; i++ ) {
			var artI = artboardInd[i];
			if(artI >= docRef.artboards.length)continue;

			var artboard = docRef.artboards[artI];
			var artboardName = artboard.name;

			var bundleMap = {};

			for (var x = 0; x < exportSettings.formats.length; x++ ) {
				var formatSettings = exportSettings.formats[x];
				var format = formatSettings.formatRef;
				var bundle = this.getBundle(bundleMap, artI, formatSettings.innerPadding, formatSettings.scaling, format.copyBehaviour, formatSettings.fontHandling=="outline", formatSettings.ungroup);

				var item = new pack.ExportItem(formatSettings, ArtboardBundler.makeFileName(formatSettings.patterns[patternName], formatSettings.formatRef.ext, i, artboardName));
				item.names = ["Artboard "+(artI+1)];
				bundle.items.push(item);
			}

			for(var j in bundleMap){
				bundle = bundleMap[j];
				if(bundle.items.length){
					bundles.push(bundle);
				}
			}
		}
	}
	ArtboardBundler.getBundle = function(bundleMap, artI, padding, scaling, forceCopy, doOutline, ungroup){
		if(doOutline || padding)forceCopy = true;

		var key = (padding?"pad":"nopad")+"_"+(forceCopy?"copy":"nocopy")+"_"+(doOutline?"outline":"nooutline");
		var bundle = bundleMap[key];
		if(bundle){
			return bundle;
		}else if(!forceCopy){
			// export types which don't require a new document to be created just show/hide layers to complete export. (No pad, raster exports)
			bundle = new pack.ExportBundle();
			bundle.prepareHandler = closure(ArtboardBundler, ArtboardBundler.prepareRegular, [artI], true);

		}else{
			bundle = new pack.ExportBundle();
			bundle.prepareHandler = closure(ArtboardBundler, ArtboardBundler.prepareCopy, [artI, padding, doOutline, ungroup], true);
			bundle.cleanupHandler = ArtboardBundler.cleanupCopy;

		}
		bundleMap[key] = bundle;
		return bundle;
	}
	ArtboardBundler.prepareRegular = function(docRef, exportSettings, exportBundle, artI){
		docRef.artboards.setActiveArtboardIndex(artI);
		return docRef;
	}
	ArtboardBundler.prepareCopy = function(docRef, exportSettings, exportBundle, artI, padding, doOutline, ungroup){
		var artboard = docRef.artboards[artI];
		docRef.artboards.setActiveArtboardIndex(artI);
			
		var rect = artboard.artboardRect;

		var artW = rect[2]-rect[0];
		var artH = rect[1]-rect[3];

		var offset = {x:0, y:0};
		exportBundle.copyDoc = pack.DocUtils.copyDocument(docRef, artboard, rect, artW, artH, offset, padding, function(layer){return (layer.name!=pack.PREFS_LAYER_NAME && layer.visible)}, null, doOutline, ungroup, null, exportSettings.ignoreWarnings);
		return exportBundle.copyDoc;
	}
	ArtboardBundler.cleanupCopy = function(docRef, exportSettings, exportBundle){
		exportBundle.copyDoc.close(SaveOptions.DONOTSAVECHANGES);
		exportBundle.copyDoc = null;
	}

	ArtboardBundler.makeFileName = function(pattern, ext, artNum, artName){
		var ret = pattern;
		ret = ret.split(pack.tokens.ARTBOARD_NUM_TOKEN).join(artNum);
		ret = ret.split(pack.tokens.ARTBOARD_NAME_TOKEN).join(artName);
		ret = ret.split(pack.tokens.FILE_EXT_TOKEN).join(ext);
		return ret;
	}

	pack.ArtboardBundler = ArtboardBundler;

})(smartExport)