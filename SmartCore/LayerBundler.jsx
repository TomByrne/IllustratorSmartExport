(function(pack){
	LayerBundler = {};

	LayerBundler.NO_COPY = "noCopy";


	LayerBundler.addElements = function(docRef, bundles, exportSettings, patternName, hasBoundErrorRef, elemVis){

		LayerBundler.hasBoundErrorRef = hasBoundErrorRef;


		var artboardInd = exportSettings.artboardInd_elements;
		var elementPaths = exportSettings.elementPaths;

		var hasExports = false;

		if(!elementPaths.length)return;

		for (var i = 0; i < artboardInd.length; i++ ) {
			var artI = artboardInd[i];
			if(artI >= docRef.artboards.length)continue;
			var artboard = docRef.artboards[artI];
			
			for ( var j=0; j < elementPaths.length; j++ ) {
				var path = elementPaths[j];
				var pathParts = path.split(":");
				var layI = parseInt(pathParts[0]) - 1;
				if(layI >= docRef.layers.length)continue;

				var layer = docRef.layers[layI];

				var layerPath = (layI + 1) + "";

				var element;
				var searchPath;
				if(layerPath == path){
					element = layer;
				}else{
					searchPath = path;
					element = LayerBundler.findElement(layerPath, layer.pageItems, path);
					if(element == null) continue;
				}

				var bundleMap = {};

				for (var x = 0; x < exportSettings.formats.length; x++ ) {
					var formatSettings = exportSettings.formats[x];
					var filePattern = formatSettings.patterns[patternName];
					if(!formatSettings.active || filePattern == "" || filePattern == null) continue;

					var format = formatSettings.formatRef;


					var bundle = this.getBundle(bundleMap, artI, layI, formatSettings.innerPadding, formatSettings.scaling, formatSettings.boundsMode, format.copyBehaviour, formatSettings.fontHandling=="outline", exportSettings.ignoreOutOfBounds_elements, formatSettings.ungroup, j==0, j==elementPaths.length-1, elemVis, formatSettings.colorSpace, formatSettings.rasterResolution, searchPath);
					var elemName = (element.name || path);
					var name = LayerBundler.makeElemFileName(filePattern, docRef.fullName.name, formatSettings.formatRef.ext, artI, artboard.name, layI, layer.name, path, elemName);
					var item = new pack.ExportItem(formatSettings, name);
					item.names = ["Artboard "+(artI+1), "Element "+path];
					bundle.items.push(item);

					hasExports = true;
				}
				
				for(var k in bundleMap){
					bundle = bundleMap[k];
					if(bundle.items.length){
						bundles.push(bundle);
					}
				}
			}
		}
		return hasExports;
	}
	LayerBundler.addLayers = function(docRef, bundles, exportSettings, patternName, hasBoundErrorRef, elemVis){

		LayerBundler.hasBoundErrorRef = hasBoundErrorRef;

		var artboardInd = exportSettings.artboardInd_layers;
		var layerInd = exportSettings.layerInd;

		var hasExports = false;

		if(!layerInd.length)return;

		for (var i = 0; i < artboardInd.length; i++ ) {
			var artI = artboardInd[i];
			if(artI >= docRef.artboards.length)continue;
			var artboard = docRef.artboards[artI];
			
			for ( var j=0; j < layerInd.length; j++ ) {
				var layI = layerInd[j];
				if(layI >= docRef.layers.length)continue;

				var layer = docRef.layers[layI];

				var bundleMap = {};

				for (var x = 0; x < exportSettings.formats.length; x++ ) {
					var formatSettings = exportSettings.formats[x];
					var filePattern = formatSettings.patterns[patternName];
					if(!formatSettings.active || filePattern == '' || filePattern == null) continue;
					
					var format = formatSettings.formatRef;


					var bundle = this.getBundle(bundleMap, artI, layI, formatSettings.innerPadding, formatSettings.scaling, formatSettings.boundsMode, format.copyBehaviour, formatSettings.fontHandling=="outline", exportSettings.ignoreOutOfBounds_layers, formatSettings.ungroup, j==0, j==layerInd.length-1, elemVis, formatSettings.colorSpace, formatSettings.rasterResolution);
					var item = new pack.ExportItem(formatSettings, LayerBundler.makeFileName(filePattern, docRef.fullName.name, formatSettings.formatRef.ext, artI, artboard.name, layI, layer.name));
					item.names = ["Artboard "+(artI+1), "Layer "+(layI+1)];
					bundle.items.push(item);

					hasExports = true;
				}

				for(var k in bundleMap){
					bundle = bundleMap[k];
					if(bundle.items.length){
						bundles.push(bundle);
					}
				}
			}
		}
		return hasExports;
	}
	LayerBundler.getBundle = function(bundleMap, artI, layI, padding, scaling, boundsMode, forceCopy, doOutline, ignoreOutOfBounds, ungroup, isFirst, isLast, elemVis, colorSpace, rasterResolution, elemPath){
		// TODO: Remove 'elemPath' from this check after testing it using show/hide & reused doc methods
		var trim = boundsMode != pack.BoundsMode.ARTBOARD;
		if(trim || doOutline || padding || colorSpace) forceCopy = true;

		var key;
		if(!forceCopy){
			key = this.NO_COPY;
		}else{
			key = boundsMode+"_"+(doOutline?"outline":"nooutline")+"_"+(padding?"pad":"nopad")+(ungroup?"_ungroup":"") + (colorSpace==null ? "" : "_"+colorSpace)  + (rasterResolution==null ? "" : "_"+rasterResolution) + (elemPath==null ? "" : "_"+elemPath);
		}
		var bundle = bundleMap[key];
		if(bundle){
			return bundle;

		}else if(!forceCopy){
			// export types which don't require a new document to be created just show/hide layers to complete export. (No pad, no trim, raster exports)
			bundle = new pack.ExportBundle();
			bundle.prepareHandler = isFirst ? closure(LayerBundler, LayerBundler.prepareShowLayerFirst, [artI, layI, elemPath], true) : closure(LayerBundler, LayerBundler.prepareShowLayer, [artI, layI, elemPath], true);
			bundle.cleanupHandler = isLast ? closure(LayerBundler, LayerBundler.cleanupShowLayerLast, [elemVis, layI], true) : closure(LayerBundler, LayerBundler.cleanupShowLayer, [elemVis, artI, layI, elemPath], true);

		}else if(!trim){
			// non-trimmed export types can simply create a new document once for each artboard. (no trim, vector exports)
			bundle = new pack.ExportBundle();
			bundle.prepareHandler = isFirst ? closure(LayerBundler, LayerBundler.prepareCopyDoc, [artI, layI, padding, doOutline, ignoreOutOfBounds, ungroup, elemVis, colorSpace, rasterResolution, elemPath, boundsMode], true) : closure(LayerBundler, LayerBundler.prepareCopyLayer, [artI, layI, padding, doOutline, ignoreOutOfBounds, ungroup, false, elemVis, null, colorSpace, rasterResolution, elemPath, boundsMode], true);
			bundle.cleanupHandler = isLast ? LayerBundler.cleanupCopyDoc : LayerBundler.cleanupCopyLayer;

		}else{
			// trimmed export types must create a new document for each artboard/layer/elem pair. (No pad, trim, vector exports)
			bundle = new pack.ExportBundle();
			bundle.prepareHandler = closure(LayerBundler, LayerBundler.prepareCopyLayer, [artI, layI, padding, doOutline, ignoreOutOfBounds, ungroup, true, elemVis, null, colorSpace, rasterResolution, elemPath, boundsMode], true);
			bundle.cleanupHandler = LayerBundler.cleanupCopyDoc;

		}
		bundleMap[key] = bundle;
		return bundle;
	}

	LayerBundler.prepareCopyDoc = function(docRef, exportSettings, exportBundle, artI, layI, padding, doOutline, ignoreOutOfBounds, ungroup, elemVis, colorSpace, rasterResolution, elemPath, boundsMode){
		var artboard = docRef.artboards[artI];
		docRef.artboards.setActiveArtboardIndex(artI);
		
		app.coordinateSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM;
		var rect = artboard.artboardRect;
		var artW = rect[2]-rect[0];
		var artH = rect[1]-rect[3];

		//var offset = {x:0, y:0};
		LayerBundler.layerDepths = [];
		LayerBundler.copyDoc = pack.DocUtils.copyDocument(docRef, artboard, rect, artW, artH, padding, pack.DocUtils.isAdditionalLayer, LayerBundler.layerDepths, doOutline, ungroup, elemVis, exportSettings.ignoreWarnings, LayerBundler.hasBoundErrorRef, null, colorSpace, rasterResolution);
		LayerBundler.hasAdditLayers = LayerBundler.copyDoc.layers.length > 0 && (LayerBundler.copyDoc.layers.length!=1 || LayerBundler.copyDoc.layers[0].pageItems.length || LayerBundler.copyDoc.layers[0].layers.length);
		return this.prepareCopyLayer(docRef, exportSettings, exportBundle, artI, layI, padding, doOutline, ignoreOutOfBounds, ungroup, false, elemVis, rect, colorSpace, rasterResolution, elemPath, boundsMode);
	}
	LayerBundler.prepareCopyLayer = function(docRef, exportSettings, exportBundle, artI, layI, padding, doOutline, ignoreOutOfBounds, ungroup, createDoc, elemVis, rect, colorSpace, rasterResolution, elemPath, boundsMode){
		//docRef.artboards.setActiveArtboardIndex(artI); // throws an error if new doc has already been created (can't change artboard when doc isn't in focus)
		var doc = LayerBundler.copyDoc || docRef;

		if(LayerBundler.copyDoc) app.activeDocument = docRef; // can't access artboard props when owner doc isn't in focus
		var layer = docRef.layers[layI];
		var artboard = docRef.artboards[artI];
		if(!rect){
			app.coordinateSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM;
			rect = artboard.artboardRect;
		}
		var artboardName = artboard.name;

		if(LayerBundler.copyDoc)app.activeDocument = doc;

		var elemFilter = (elemPath == null ? null : closure(LayerBundler, LayerBundler.filterElements, [elemPath], true));
		if(elemFilter == null && boundsMode == pack.BoundsMode.ARTWORK) elemFilter = closure(LayerBundler, ungroup ? LayerBundler.filterByVisibleUngroup : LayerBundler.filterByVisible, [], true);

		// only process layer if it has bounds (i.e. not guide layer) and falls within current artboard bounds
		var layerRect = pack.DocUtils.getLayerBounds(docRef, layer, null, elemFilter);
		if (layerRect) {
			var isVis = boundsMode == pack.BoundsMode.ARTWORK || (!ignoreOutOfBounds || pack.DocUtils.intersects(rect, layerRect));
			if((createDoc || !LayerBundler.hasAdditLayers) && !isVis){
				// skip layers where nothing is visible
				return "skipped";
			}
			if(createDoc){
		
				app.coordinateSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM;

				var layerOffsetX = 0;
				var layerOffsetY = 0;

				// crop to artboard
				if(boundsMode == pack.BoundsMode.ARTBOARD_AND_ARTWORK){
					if(layerRect[0]<rect[0]){
						layerRect[0] = rect[0];
					}
					if(layerRect[1]>rect[1]){
						layerRect[1] = rect[1];
					}
					if(layerRect[2]>rect[2]){
						layerRect[2] = rect[2];
					}
					if(layerRect[3]<rect[3]){
						layerRect[3] = rect[3];
					}
				}

				layerOffsetY = rect[3] - layerRect[3];
				layerOffsetX = rect[0] - layerRect[0];

				docW = layerRect[2]-layerRect[0];
				docH = layerRect[1]-layerRect[3];

				layOffset = {x:layerOffsetX, y:layerOffsetY};
				LayerBundler.layerDepths = [];
				doc = pack.DocUtils.copyDocument(doc, artboard, rect, docW, docH, padding, pack.DocUtils.isAdditionalLayer, LayerBundler.layerDepths, doOutline, ungroup, elemVis, exportSettings.ignoreWarnings, null, layOffset, colorSpace, rasterResolution);
				LayerBundler.copyDoc = doc;
				
				LayerBundler.hasAdditLayers = doc.layers.length > 0 && (doc.layers.length!=1 || doc.layers[0].pageItems.length || doc.layers[0].layers.length);
			}else{
				layOffset = null;
			}
			if(isVis){
				// only copy layer if it is visible (if not only visible '+' layers will be output)
				var artb = doc.artboards[0];
				app.coordinateSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM;
				var new_layer = pack.DocUtils.copyLayer(docRef, LayerBundler.copyDoc, artb, LayerBundler.copyDoc.artboards[0], rect, layer, doc.layers.add(), padding, doOutline, ungroup, docRef.rulerOrigin, exportSettings.ignoreWarnings, LayerBundler.hasBoundErrorRef, layOffset, elemFilter);
				new_layer.visible = true;
				var depth = LayerBundler.layerDepths[layI];
				pack.DocUtils.setLayerDepth(new_layer, depth);
				exportBundle.copyLayer = new_layer;
			}
			return doc;
		}

		return null;
	}
	LayerBundler.filterElements = function(element, path, matchPath){
		if(matchPath == path){
			return true;
		}else if(matchPath.indexOf(path) == 0){
			return 'explore';
		}
		return false;
	}
	LayerBundler.filterByVisibleUngroup = function(element, path){
		if(element.hidden){
			return false;
		}else{
			return 'explore';
		}
	}
	LayerBundler.filterByVisible = function(element, path){
		if(element.hidden){
			return false;
		}else{
			return true;
		}
	}
	LayerBundler.prepareShowLayerFirst = function(docRef, exportSettings, exportBundle, artI, layI, elemPath){
		pack.DocUtils.hideAllLayers(docRef);

		exportBundle.hasOrigAdditLayers = false;
		for(var i=0; i<docRef.layers.length; i++){
			if(docRef.layers[i].visible){
				exportBundle.hasOrigAdditLayers = true;
				break;
			}
		}
		return LayerBundler.prepareShowLayer(docRef, exportSettings, exportBundle, artI, layI, elemPath);
	}
	LayerBundler.prepareShowLayer = function(docRef, exportSettings, exportBundle, artI, layI, elemPath){
		docRef.artboards.setActiveArtboardIndex(artI);
		var layer = docRef.layers[layI];


		var elemFilter = (elemPath == null ? null : closure(LayerBundler, LayerBundler.filterElements, [elemPath], true));
		var layerRect = pack.DocUtils.getLayerBounds(docRef, layer, null, elemFilter);
		// only process layer if it has bounds (i.e. not guide layer) and falls within current artboard bounds
		if (layerRect) {

			if(!exportBundle.hasOrigAdditLayers && !pack.DocUtils.artboardIntersects(docRef, artI, layerRect)){
				// skip layers where nothing is visible
				if(!exportSettings.ignoreWarnings) alert("Layer '"+layer.name+"' does not intersect with the artboard '"+docRef.artboards[artI].name+"', this file has been skipped.");
				return "skipped";
			}
			layer.visible = true;
			if(elemPath != null) LayerBundler.showElement((layI + 1) + "", layer.pageItems, elemPath);
			return docRef;
		}else{
			return "skipped";
		}
	}
	LayerBundler.findElement = function(parentPath, items, matchPath){
		parentPath += ":";
		for(var i=0; i<items.length; i++){
			var item = items[i];
			var path = parentPath + (i+1);
			if(matchPath == path){
				return item;
			}else if(item.typename == "GroupItem" && matchPath.indexOf(path) == 0){
				var desc = LayerBundler.findElement(path, item.pageItems, matchPath);
				if(desc != null) return desc;
			}
		}
	}
	LayerBundler.showElement = function(parentPath, items, matchPath){
		parentPath += ":";
		for(var i=0; i<items.length; i++){
			var item = items[i];
			var path = parentPath + (i+1);
			item.hidden = (matchPath != path && matchPath.indexOf(path) != 0);
			if(item.isGroup) LayerBundler.showElement(path, item.pageItems, matchPath);
		}
	}
	LayerBundler.cleanupShowLayer = function(docRef, exportSettings, exportBundle, elemVis, artI, layI){
		var layer = docRef.layers[layI];
		pack.DocUtils.setAllElemVisibility(docRef, elemVis, layI);
		layer.visible = false;
	}
	LayerBundler.cleanupShowLayerLast = function(docRef, exportSettings, exportBundle, elemVis, layI){
		//pack.DocUtils.showAllLayers(docRef, elemVis);
		pack.DocUtils.setAllElemVisibility(docRef, elemVis);
		exportBundle.layersWereShown = null;
	}
	LayerBundler.cleanupCopyLayer = function(docRef, exportSettings, exportBundle){
		if(!exportBundle.copyLayer)return;
		exportBundle.copyLayer.remove();
		exportBundle.copyLayer = null;
	}
	LayerBundler.cleanupCopyDoc = function(docRef, exportSettings, exportBundle){
		if(!LayerBundler.copyDoc)return;
		//LayerBundler.copyDoc.close(SaveOptions.DONOTSAVECHANGES);
		pack.DocCloser.closeDocument(LayerBundler.copyDoc);
		LayerBundler.copyDoc = null;
	}

	LayerBundler.makeFileName = function(pattern, docName, ext, artNum, artName, layerNum, layerName){
		var ret = pack.ArtboardBundler.makeFileName(pattern, docName, ext, artNum, artName);
		ret = ret.split(pack.tokens.LAYER_NUM_TOKEN).join(layerNum);
		ret = ret.split(pack.tokens.LAYER_NAME_TOKEN).join(layerName);
		return ret;
	}

	LayerBundler.makeElemFileName = function(pattern, docName, ext, artNum, artName, layerNum, layerName, elemPath, elemName){
		var ret = pack.LayerBundler.makeFileName(pattern, docName, ext, artNum, artName, layerNum, layerName);
		ret = ret.split(pack.tokens.ELEMENT_PATH_TOKEN).join(elemPath);
		ret = ret.split(pack.tokens.ELEMENT_NAME_TOKEN).join(elemName);
		return ret;
	}

	pack.LayerBundler = LayerBundler;

})(smartExport)