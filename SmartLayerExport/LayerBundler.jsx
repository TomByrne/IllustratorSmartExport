(function(pack){
	LayerBundler = {};

	LayerBundler.NO_COPY = "noCopy";


	LayerBundler.add = function(docRef, bundles, exportSettings, patternName){

		var artboardInd = exportSettings.artboardInd;
		var layerInd = exportSettings.layerInd;

		if(!layerInd.length)return;

		var layerVis = [];
		for (var i = 0; i < docRef.layers.length; i++ ) {
			layerVis.push(docRef.layers[i].visible);
		}

		for (var i = 0; i < artboardInd.length; i++ ) {
			var artI = artboardInd[i];
			var artboard = docRef.artboards[artI];
			
			for ( var j=0; j < layerInd.length; j++ ) {
				var layI = layerInd[j];
				var layer = docRef.layers[layI];

				var bundleMap = {};

				for (var x = 0; x < exportSettings.formats.length; x++ ) {
					var formatSettings = exportSettings.formats[x];
					var format = formatSettings.formatRef;


					var bundle = this.getBundle(bundleMap, artI, layI, formatSettings.innerPadding, formatSettings.scaling, formatSettings.trimEdges, format.copyBehaviour, formatSettings.fontHandling=="outline", formatSettings.ungroup, j==0, j==layerInd.length-1, layerVis);
					var item = new pack.ExportItem(formatSettings, LayerBundler.makeFileName(formatSettings.patterns[patternName], formatSettings.formatRef.ext, artI, artboard.name, layI, layer.name));
					item.names = ["Artboard "+(artI+1), "Layer "+(layI+1)];
					bundle.items.push(item);
				}

				for(var k in bundleMap){
					bundle = bundleMap[k];
					if(bundle.items.length){
						bundles.push(bundle);
					}
				}
			}
		}
	}
	LayerBundler.getBundle = function(bundleMap, artI, layI, padding, scaling, trim, forceCopy, doOutline, ungroup, isFirst, isLast, layerVis){
		if(trim || doOutline || padding)forceCopy = true;

		var key;
		if(!forceCopy){
			key = this.NO_COPY;
		}else{
			key = (trim?"trim":"notrim")+"_"+(doOutline?"outline":"nooutline")+"_"+(padding?"pad":"nopad")+(ungroup?"_ungroup":"");
		}
		var bundle = bundleMap[key];
		if(bundle){
			return bundle;
		}else if(!forceCopy){
			// export types which don't require a new document to be created just show/hide layers to complete export. (No pad, no trim, raster exports)
			bundle = new pack.ExportBundle();
			bundle.prepareHandler = isFirst ? closure(LayerBundler, LayerBundler.prepareShowLayerFirst, [artI, layI], true) : closure(LayerBundler, LayerBundler.prepareShowLayer, [artI, layI], true);
			bundle.cleanupHandler = isLast ? closure(LayerBundler, LayerBundler.cleanupShowLayerLast, [layerVis], true) : LayerBundler.cleanupShowLayer;

		}else if(!trim){
			// non-trimmed export types can simply create a new document once for each artboard. (no trim, vector exports)
			bundle = new pack.ExportBundle();
			bundle.prepareHandler = isFirst ? closure(LayerBundler, LayerBundler.prepareCopyDoc, [artI, layI, padding, doOutline, ungroup, layerVis], true) : closure(LayerBundler, LayerBundler.prepareCopyLayer, [artI, layI, padding, doOutline, ungroup, false, layerVis], true);
			bundle.cleanupHandler = isLast ? LayerBundler.cleanupCopyDoc : LayerBundler.cleanupCopyLayer;

		}else{
			// trimmed export types must create a new document for each artboard/layer pair. (No pad, trim, vector exports)
			bundle = new pack.ExportBundle();
			bundle.prepareHandler = closure(LayerBundler, LayerBundler.prepareCopyLayer, [artI, layI, padding, doOutline, ungroup, true, layerVis], true);
			bundle.cleanupHandler = LayerBundler.cleanupCopyDoc;

		}
		bundleMap[key] = bundle;
		return bundle;
	}

	LayerBundler.prepareCopyDoc = function(docRef, exportSettings, exportBundle, artI, layI, padding, doOutline, layerVis){
		var artboard = docRef.artboards[artI];
		docRef.artboards.setActiveArtboardIndex(artI);
			
		var rect = artboard.artboardRect;
		var artW = rect[2]-rect[0];
		var artH = rect[1]-rect[3];

		var offset = {x:0, y:0};
		exportBundle.layerDepths = [];
		exportBundle.copyDoc = pack.DocUtils.copyDocument(docRef, artboard, rect, artW, artH, offset, padding, pack.DocUtils.isAdditionalLayer, exportBundle.layerDepths, doOutline, ungroup, layerVis, exportSettings.ignoreWarnings);
		exportBundle.hasAdditLayers = exportBundle.copyDoc.layers.length > 0 && (exportBundle.copyDoc.layers.length!=1 || exportBundle.copyDoc.layers[0].pageItems.length || exportBundle.copyDoc.layers[0].layers.length);
		return this.prepareCopyLayer(docRef, exportSettings, exportBundle, artI, layI, padding, doOutline, ungroup, false, layerVis, rect);
	}
	LayerBundler.prepareCopyLayer = function(docRef, exportSettings, exportBundle, artI, layI, padding, doOutline, ungroup, createDoc, layerVis, rect){
		docRef.artboards.setActiveArtboardIndex(artI);

		var doc = exportBundle.copyDoc || docRef;
		var layer = docRef.layers[layI];
		var artboard = docRef.artboards[artI];
		if(!rect)rect = artboard.artboardRect;

		// only process layer if it has bounds (i.e. not guide layer) and falls within current artboard bounds
		var layerRect = pack.DocUtils.getLayerBounds(layer);
		if (layerRect) {
			var isVis = pack.DocUtils.intersects(rect, layerRect);
			if((createDoc || !exportBundle.hasAdditLayers) && !isVis){
				// skip layers where nothing is visible
				if(!exportSettings.ignoreWarnings)alert("Layer '"+layer.name+"' does not intersect with the artboard '"+doc.artboards[artI].name+"', this file has been skipped.");
				return "skipped";
			}
			if(createDoc){

				// crop to artboard
				if(layerRect[0]<rect[0]){
					layerRect[0] = rect[0];
				}else{
					intendedX = 0;
				}
				if(layerRect[1]>rect[1]){
					layerRect[1] = rect[1];
				}
				if(layerRect[2]>rect[2]){
					layerRect[2] = rect[2];
				}
				if(layerRect[3]<rect[3]){
					layerRect[3] = rect[3];
				}else{
					intendedY = 0;
				}
				layerOffsetY = rect[3] - layerRect[3];
				layerOffsetX = rect[0] - layerRect[0];

				docW = layerRect[2]-layerRect[0];
				docH = layerRect[1]-layerRect[3];

				layOffset = {x:layerOffsetX, y:layerOffsetY};
				exportBundle.layerDepths = [];
				doc = pack.DocUtils.copyDocument(doc, artboard, rect, docW, docH, layOffset, padding, pack.DocUtils.isAdditionalLayer, exportBundle.layerDepths, doOutline, ungroup, layerVis, exportSettings.ignoreWarnings);
				exportBundle.copyDoc = doc;
			
				exportBundle.hasAdditLayers = doc.layers.length > 0 && (doc.layers.length!=1 || doc.layers[0].pageItems.length || doc.layers[0].layers.length);
			}else{
				layOffset = {x:0, y:0};
			}
			if(isVis){
				// only copy layer if it is visible (if not only visible '+' layers will be output)
				var artb = doc.artboards[0];
				var new_layer = pack.DocUtils.copyLayer(docRef, artb, artb.artboardRect, layer, doc.layers.add(), layOffset, padding, doOutline, ungroup, docRef.rulerOrigin, exportSettings.ignoreWarnings);
				new_layer.visible = true;
				var depth = exportBundle.layerDepths[layI];
				pack.DocUtils.setLayerDepth(new_layer, depth);
				exportBundle.copyLayer = new_layer;
			}
			return doc;
		}


		return null;
	}
	LayerBundler.prepareShowLayerFirst = function(docRef, exportSettings, exportBundle, artI, layI){
		pack.DocUtils.hideAllLayers(docRef);
		LayerBundler.prepareShowLayer(docRef, exportSettings, exportBundle, artI, layI);

		exportBundle.hasOrigAdditLayers = false;
		for(var i=0; i<docRef.layers.length; i++){
			if(docRef.layers[i].visible){
				exportBundle.hasOrigAdditLayers = true;
				break;
			}
		}
		return docRef;
	}
	LayerBundler.prepareShowLayer = function(docRef, exportSettings, exportBundle, artI, layI){
		var layer = docRef.layers[layI];

		var layerRect = pack.DocUtils.getLayerBounds(layer);
		// only process layer if it has bounds (i.e. not guide layer) and falls within current artboard bounds
		if (layerRect) {

			if(!exportBundle.hasOrigAdditLayers && !pack.DocUtils.artboardIntersects(docRef, artI, layerRect)){
				// skip layers where nothing is visible
				if(!exportSettings.ignoreWarnings)alert("Layer '"+layer.name+"' does not intersect with the artboard '"+docRef.artboards[artI].name+"', this file has been skipped.");
				return "skipped";
			}
			layer.visible = true;
			return docRef;
		}else{
			return "skipped";
		}
	}
	LayerBundler.cleanupShowLayer = function(docRef, exportSettings, exportBundle, artI, layI){
		var layer = docRef.layers[layI];
		layer.visible = false;
	}
	LayerBundler.cleanupShowLayerLast = function(docRef, exportSettings, exportBundle, layerVis){
		pack.DocUtils.showAllLayers(docRef, layerVis);
		exportBundle.layersWereShown = null;
	}
	LayerBundler.cleanupCopyLayer = function(docRef, exportSettings, exportBundle){
		exportBundle.copyLayer.remove();
		exportBundle.copyLayer = null;
	}
	LayerBundler.cleanupCopyDoc = function(docRef, exportSettings, exportBundle){
		exportBundle.copyDoc.close(SaveOptions.DONOTSAVECHANGES);
		exportBundle.copyDoc = null;
	}

	LayerBundler.makeFileName = function(pattern, ext, artNum, artName, layerNum, layerName){
		var ret = pack.ArtboardBundler.makeFileName(pattern, ext, artNum, artName);
		ret = ret.split(pack.tokens.LAYER_NUM_TOKEN).join(layerNum);
		ret = ret.split(pack.tokens.LAYER_NAME_TOKEN).join(layerName);
		return ret;
	}

	pack.LayerBundler = LayerBundler;

})(smartExport)