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
				var filePattern = formatSettings.patterns[patternName];
				if(!formatSettings.active || filePattern == '' || filePattern == null) continue;
				
				var format = formatSettings.formatRef;
				var bundle = this.getBundle(bundleMap, artI, formatSettings.innerPadding, formatSettings.scaling, formatSettings.boundsMode, format.copyBehaviour, formatSettings.fontHandling=="outline", formatSettings.ungroup, formatSettings.colorSpace, formatSettings.rasterResolution);

				var item = new pack.ExportItem(formatSettings, ArtboardBundler.makeFileName(filePattern, docRef.fullName.name, formatSettings.formatRef.ext, i, artboardName));
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
	ArtboardBundler.getBundle = function(bundleMap, artI, padding, scaling, boundsMode, forceCopy, doOutline, ungroup, colorSpace, rasterResolution){
		var trim = boundsMode!=pack.BoundsMode.ARTBOARD;
		if(doOutline || padding || trim || colorSpace) forceCopy = true;

		var key = (padding?"pad":"nopad")+"_"+(forceCopy?"copy":"nocopy")+"_"+(doOutline?"outline":"nooutline")+"_"+boundsMode + "_" + (colorSpace==null ? "" : "_"+colorSpace) + (rasterResolution==null ? "" : "_"+rasterResolution);
		var bundle = bundleMap[key];
		if(bundle){
			return bundle;
		}else if(!forceCopy){
			// export types which don't require a new document to be created just show/hide layers to complete export. (No pad, raster exports)
			bundle = new pack.ExportBundle();
			bundle.prepareHandler = closure(ArtboardBundler, ArtboardBundler.prepareRegular, [artI], true);

		}else{
			bundle = new pack.ExportBundle();
			bundle.prepareHandler = closure(ArtboardBundler, ArtboardBundler.prepareCopy, [artI, boundsMode, padding, doOutline, ungroup, colorSpace, rasterResolution], true);
			bundle.cleanupHandler = ArtboardBundler.cleanupCopy;

		}
		bundleMap[key] = bundle;
		return bundle;
	}
	ArtboardBundler.prepareRegular = function(docRef, exportSettings, exportBundle, artI){
		docRef.artboards.setActiveArtboardIndex(artI);
		return docRef;
	}
	ArtboardBundler.prepareCopy = function(docRef, exportSettings, exportBundle, artI, boundsMode, padding, doOutline, ungroup, colorSpace, rasterResolution){
		var artboard = docRef.artboards[artI];
		docRef.artboards.setActiveArtboardIndex(artI);
		
		app.coordinateSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM;
		var rect = artboard.artboardRect;

		var layerCheck = function(layer){
			return (layer.visible && DocUtils.indexOf(pack.IGNORE_LAYERS, layer.name)==-1);
		};

		var offset;
		if(boundsMode!=pack.BoundsMode.ARTBOARD){
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
			if(boundsMode==pack.BoundsMode.ARTBOARD_AND_ARTWORK){
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
			}
			rect = allLayerBounds;
			offset = { x: rect[3] - allLayerBounds[3], y: rect[0] - allLayerBounds[0] };
		}

		var artW = rect[2]-rect[0];
		var artH = rect[1]-rect[3];

		var elemFilter = (boundsMode == pack.BoundsMode.ARTWORK ? closure(ArtboardBundler, ungroup ? ArtboardBundler.filterByVisibleUngroup : ArtboardBundler.filterByVisible, [], true) : null );
		
		exportBundle.copyDoc = pack.DocUtils.copyDocument(docRef, artboard, rect, artW, artH, padding, layerCheck, null, doOutline, ungroup, null, exportSettings.ignoreWarnings, ArtboardBundler.hasBoundErrorRef, offset, colorSpace, rasterResolution);
		
		return exportBundle.copyDoc;
	}
	ArtboardBundler.filterByVisibleUngroup = function(element, path){
		if(element.hidden){
			return false;
		}else{
			return 'explore';
		}
	}
	ArtboardBundler.filterByVisible = function(element, path){
		if(element.hidden){
			return false;
		}else{
			return true;
		}
	}
	ArtboardBundler.cleanupCopy = function(docRef, exportSettings, exportBundle){
		if(!exportBundle.copyDoc) return;
		//exportBundle.copyDoc.close(SaveOptions.DONOTSAVECHANGES);
		pack.DocCloser.closeDocument(exportBundle.copyDoc);
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