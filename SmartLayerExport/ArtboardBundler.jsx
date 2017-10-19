(function(pack){
	ArtboardBundler = {};


	ArtboardBundler.add = function(docRef, bundles, exportSettings, patternName, hasBoundErrorRef){

		ArtboardBundler.hasBoundErrorRef = hasBoundErrorRef;

		var artboardInd = exportSettings.artboardInd;
		var hasExports = false;

		for (var i = 0; i < artboardInd.length; i++ ) {
			var artI = artboardInd[i];
			if(artI >= docRef.artboards.length) continue;

			var artboard = docRef.artboards[artI];
			var artboardName = artboard.name;

			var bundleMap = {};

			for (var x = 0; x < exportSettings.formats.length; x++ ) {
				var formatSettings = exportSettings.formats[x];
				if(!formatSettings.active) continue;
				
				var format = formatSettings.formatRef;
				var bundle = this.getBundle(bundleMap, artI, formatSettings.innerPadding, formatSettings.scaling, formatSettings.trimEdges, format.copyBehaviour, formatSettings.fontHandling=="outline", formatSettings.ungroup, formatSettings.colorSpace);

				var item = new pack.ExportItem(formatSettings, ArtboardBundler.makeFileName(formatSettings.patterns[patternName], docRef.fullName.name, formatSettings.formatRef.ext, i, artboardName));
				item.names = ["Artboard "+(artI+1)];
				bundle.items.push(item);

				hasExports = true;
			}

			for(var j in bundleMap){
				bundle = bundleMap[j];
				if(bundle.items.length){
					bundles.push(bundle);
				}
			}
		}
		
		return hasExports;
	}
	ArtboardBundler.getBundle = function(bundleMap, artI, padding, scaling, trim, forceCopy, doOutline, ungroup, colorSpace){
		if(doOutline || padding || trim || colorSpace) forceCopy = true;

		var key = (padding?"pad":"nopad")+"_"+(forceCopy?"copy":"nocopy")+"_"+(doOutline?"outline":"nooutline")+"_"+(trim?"trim":"notrim") + (colorSpace==null ? "" : "_"+colorSpace);
		var bundle = bundleMap[key];
		if(bundle){
			return bundle;
		}else if(!forceCopy){
			// export types which don't require a new document to be created just show/hide layers to complete export. (No pad, raster exports)
			bundle = new pack.ExportBundle();
			bundle.prepareHandler = closure(ArtboardBundler, ArtboardBundler.prepareRegular, [artI], true);

		}else{
			bundle = new pack.ExportBundle();
			bundle.prepareHandler = closure(ArtboardBundler, ArtboardBundler.prepareCopy, [artI, trim, padding, doOutline, ungroup, colorSpace], true);
			bundle.cleanupHandler = ArtboardBundler.cleanupCopy;

		}
		bundleMap[key] = bundle;
		return bundle;
	}
	ArtboardBundler.prepareRegular = function(docRef, exportSettings, exportBundle, artI){
		docRef.artboards.setActiveArtboardIndex(artI);
		return docRef;
	}
	ArtboardBundler.prepareCopy = function(docRef, exportSettings, exportBundle, artI, trim, padding, doOutline, ungroup, colorSpace){
		var artboard = docRef.artboards[artI];
		docRef.artboards.setActiveArtboardIndex(artI);
		
		app.coordinateSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM;
		var rect = artboard.artboardRect;

		var layerCheck = function(layer){
			return (layer.visible && DocUtils.indexOf(pack.IGNORE_LAYERS, layer.name)==-1);
		};

		var offset;
		if(trim){
			var allLayerBounds;
			for(var i=0; i<docRef.layers.length; i++){
				var layer = docRef.layers[i];
				if(!layerCheck(layer))continue;

				var layerBounds = pack.DocUtils.getLayerBounds(docRef, layer, rect);
				if(!layerBounds)continue;

				if(allLayerBounds==null){
					allLayerBounds = layerBounds;
				}else{
					if(allLayerBounds[0]>layerBounds[0]){
						allLayerBounds[0] = layerBounds[0];
					}
					if(allLayerBounds[1]<layerBounds[1]){
						allLayerBounds[1] = layerBounds[1];
					}
					if(allLayerBounds[2]<layerBounds[2]){
						allLayerBounds[2] = layerBounds[2];
					}
					if(allLayerBounds[3]>layerBounds[3]){
						allLayerBounds[3] = layerBounds[3];
					}
				}
			}
			if(!allLayerBounds)return "skipped";
			
			// crop to artboard
			if(allLayerBounds[0]<rect[0]){
				allLayerBounds[0] = rect[0];
			}
			if(allLayerBounds[1]>rect[1]){
				allLayerBounds[1] = rect[1];
			}
			if(allLayerBounds[2]>rect[2]){
				allLayerBounds[2] = rect[2];
			}
			if(allLayerBounds[3]<rect[3]){
				allLayerBounds[3] = rect[3];
			}
			rect = allLayerBounds;
			offset = { x: rect[3] - allLayerBounds[3], y: rect[0] - allLayerBounds[0] };
		}

		var artW = rect[2]-rect[0];
		var artH = rect[1]-rect[3];

		
		exportBundle.copyDoc = pack.DocUtils.copyDocument(docRef, artboard, rect, artW, artH, padding, layerCheck, null, doOutline, ungroup, null, exportSettings.ignoreWarnings, ArtboardBundler.hasBoundErrorRef, offset, colorSpace);
		
		return exportBundle.copyDoc;
	}
	ArtboardBundler.cleanupCopy = function(docRef, exportSettings, exportBundle){
		if(!exportBundle.copyDoc)return;
		exportBundle.copyDoc.close(SaveOptions.DONOTSAVECHANGES);
		exportBundle.copyDoc = null;
	}

	ArtboardBundler.makeFileName = function(pattern, docName, ext, artNum, artName){
		var ret = pattern;
		docName = docName.substring(0, docName.lastIndexOf("."));
		ret = ret.split(pack.tokens.ARTBOARD_NUM_TOKEN).join(artNum);
		ret = ret.split(pack.tokens.ARTBOARD_NAME_TOKEN).join(artName);
		ret = ret.split(pack.tokens.FILE_EXT_TOKEN).join(ext);
		ret = ret.split(pack.tokens.DOC_NAME_TOKEN).join(docName);
		return ret;
	}

	pack.ArtboardBundler = ArtboardBundler;

})(smartExport)