(function(pack){
	SymbolBundler = {};

	SymbolBundler.add = function(docRef, bundles, exportSettings, patternName){

		var symbolNames = exportSettings.symbolNames;

		if(!symbolNames.length)return;

		for ( var j=0; j < docRef.symbols.length; j++ ) {
			var symbol = docRef.symbols[j];
			if(this.indexOf(symbolNames, symbol.name)==-1)return;

			var bundleMap = {};

			for (var x = 0; x < exportSettings.formats.length; x++ ) {
				var formatSettings = exportSettings.formats[x];
				var format = formatSettings.formatRef;


				var bundle = this.getBundle(bundleMap, symbol, formatSettings.innerPadding, formatSettings.scaling, formatSettings.trimEdges, formatSettings.fontHandling=="outline", formatSettings.ungroup);
				var item = new pack.ExportItem(formatSettings, SymbolBundler.makeFileName(formatSettings.patterns[patternName], formatSettings.formatRef.ext, symbol.name));
				item.names = [symbol.name];
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
	SymbolBundler.getBundle = function(bundleMap, symbol, padding, scaling, trim, doOutline, ungroup){
		if(trim || doOutline || padding)forceCopy = true;

		var key = (trim?"trim":"notrim")+"_"+(doOutline?"outline":"nooutline")+"_"+(padding?"pad":"nopad")+(ungroup?"_ungroup":"");
		var bundle = bundleMap[key];
		if(bundle){
			return bundle;
		}else if(!trim){
			// non-trimmed export types can simply create a new document once for each artboard. (no trim, vector exports)
			bundle = new pack.ExportBundle();
			bundle.prepareHandler = isFirst ? closure(SymbolBundler, SymbolBundler.prepareCopyDoc, [symbol, padding, doOutline, ungroup], true) : closure(SymbolBundler, SymbolBundler.prepareCopyLayer, [artI, layI, padding, doOutline, ungroup, false], true);
			bundle.cleanupHandler = isLast ? SymbolBundler.cleanupCopyDoc : SymbolBundler.cleanupCopyLayer;

		}else{
			// trimmed export types must create a new document for each artboard/layer pair. (No pad, trim, vector exports)
			bundle = new pack.ExportBundle();
			bundle.prepareHandler = closure(SymbolBundler, SymbolBundler.prepareCopyLayer, [symbol, padding, doOutline, ungroup, true], true);
			bundle.cleanupHandler = SymbolBundler.cleanupCopyDoc;

		}
		bundleMap[key] = bundle;
		return bundle;
	}

	SymbolBundler.prepareCopyDoc = function(docRef, exportSettings, exportBundle, symbol, padding, doOutline){
		var artboard = docRef.artboards[artI];
		docRef.artboards.setActiveArtboardIndex(artI);
			
		var rect = artboard.artboardRect;
		var artW = rect[2]-rect[0];
		var artH = rect[1]-rect[3];

		var offset = {x:0, y:0};
		exportBundle.layerDepths = [];
		exportBundle.copyDoc = pack.DocUtils.copyDocument(docRef, artboard, rect, artW, artH, offset, padding, pack.DocUtils.isAdditionalLayer, exportBundle.layerDepths, doOutline, ungroup, exportSettings.ignoreWarnings);
		exportBundle.hasAdditLayers = exportBundle.copyDoc.layers.length > 0 && (exportBundle.copyDoc.layers.length!=1 || exportBundle.copyDoc.layers[0].pageItems.length || exportBundle.copyDoc.layers[0].layers.length);
		return this.prepareCopyLayer(docRef, exportSettings, exportBundle, artI, layI, padding, doOutline, ungroup, false, rect);
	}
	SymbolBundler.prepareCopyLayer = function(docRef, exportSettings, exportBundle, symbol, padding, doOutline, ungroup, createDoc, rect){
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
				doc = pack.DocUtils.copyDocument(doc, artboard, rect, docW, docH, layOffset, padding, pack.DocUtils.isAdditionalLayer, exportBundle.layerDepths, doOutline, ungroup, exportSettings.ignoreWarnings);
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
	SymbolBundler.cleanupCopyLayer = function(docRef, exportSettings, exportBundle){
		exportBundle.copyLayer.remove();
		exportBundle.copyLayer = null;
	}
	SymbolBundler.cleanupCopyDoc = function(docRef, exportSettings, exportBundle){
		exportBundle.copyDoc.close(SaveOptions.DONOTSAVECHANGES);
		exportBundle.copyDoc = null;
	}

	SymbolBundler.makeFileName = function(pattern, ext, symbolName){
		var ret = pattern.split(pack.tokens.SYMBOL_NAME_TOKEN).join(symbolName);
		ret = ret.split(pack.tokens.FILE_EXT_TOKEN).join(ext);
		return ret;
	}
	SymbolBundler.indexOf = function ( array, element ) {
		for(var i=0; i<array.length; i++){
			if(array[i]==element)return i;
		}
		return -1;
	}

	pack.SymbolBundler = SymbolBundler;

})(smartExport)