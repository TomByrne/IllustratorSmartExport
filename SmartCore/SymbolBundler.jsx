(function(pack){
	SymbolBundler = {};

	SymbolBundler.add = function(docRef, bundles, exportSettings, patternName, hasBoundErrorRef){

		SymbolBundler.hasBoundErrorRef = hasBoundErrorRef;

		var symbolNames = exportSettings.symbolNames;

		var hasExports = false;

		if(!symbolNames.length)return;

		for ( var j=0; j < symbolNames.length; j++ ) {
			var symbolName = symbolNames[j];
			var symbol = docRef.symbols.getByName(symbolName);

			var bundleMap = {};

			for (var x = 0; x < exportSettings.formats.length; x++ ) {
				var formatSettings = exportSettings.formats[x];
				var filePattern = formatSettings.patterns[patternName];
				if(!formatSettings.active || filePattern == '' || filePattern == null) continue;
				
				var format = formatSettings.formatRef;


				var bundle = this.getBundle(bundleMap, symbol, formatSettings.innerPadding, formatSettings.scaling, formatSettings.boundsMode, formatSettings.fontHandling=="outline", formatSettings.ungroup, formatSettings.colorSpace, formatSettings.rasterResolution, j==symbolNames.length-1 && x==exportSettings.formats.length-1);
				var item = new pack.ExportItem(formatSettings, SymbolBundler.makeFileName(filePattern, formatSettings.formatRef.ext, symbol.name));
				item.names = [symbol.name];
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

		return hasExports;
	}
	SymbolBundler.getBundle = function(bundleMap, symbol, padding, scaling, boundsMode, doOutline, ungroup, colorSpace, rasterResolution, isLast){
		var trim = boundsMode != pack.BoundsMode.ARTBOARD;
		if(trim || doOutline || padding)forceCopy = true;

		var key = (doOutline?"outline":"nooutline")+"_"+(padding?"pad":"nopad")+(ungroup?"_ungroup":"")+(colorSpace?"_"+colorSpace:"")+(rasterResolution?"_"+rasterResolution:"");
		var bundle = bundleMap[key];
		if(bundle){
			return bundle;
		}else{
			// trimmed export types must create a new document for each symbol.
			bundle = new pack.ExportBundle();
			bundle.prepareHandler = closure(SymbolBundler, SymbolBundler.prepareCopyLayer, [symbol, padding, doOutline, ungroup, colorSpace, rasterResolution], true);
			bundle.cleanupHandler = !isLast ? SymbolBundler.cleanupCopyDoc : SymbolBundler.cleanupTempLayer;

		}
		bundleMap[key] = bundle;
		return bundle;
	}
	SymbolBundler.prepareCopyLayer = function(docRef, exportSettings, exportBundle, symbol, padding, doOutline, ungroup, colorSpace, rasterResolution){

		docRef.artboards.setActiveArtboardIndex(0);
		var artboard = docRef.artboards[0];
		app.coordinateSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM;
		var rect = artboard.artboardRect;

		var testLayer = SymbolBundler.testLayer;
		if(testLayer==null){
			testLayer = docRef.layers.add();
			testLayer.name = "SmartSymbolExport - temp";
			SymbolBundler.testLayer = testLayer;
		}
		testLayer.symbolItems.add(symbol);
		var item = testLayer.symbolItems[0];

		item.translate(rect[0] - item.visibleBounds[0], rect[1] - item.visibleBounds[1]);

		var doc = docRef;

		// only process layer if it has bounds (i.e. not guide layer) and falls within current artboard bounds
		var layerRect = pack.DocUtils.getLayerBounds(testLayer);
		if (layerRect) {

			docW = layerRect[2]-layerRect[0];
			docH = layerRect[1]-layerRect[3];

			doc = pack.DocUtils.copyDocument(docRef, artboard, rect, docW, docH, padding, pack.DocUtils.isAdditionalLayer, null, doOutline, ungroup, exportSettings.ignoreWarnings, SymbolBundler.hasBoundErrorRef, null, colorSpace, rasterResolution);
			exportBundle.copyDoc = doc;
		
			exportBundle.hasAdditLayers = doc.layers.length > 0 && (doc.layers.length!=1 || doc.layers[0].pageItems.length || doc.layers[0].layers.length);

			var artb = doc.artboards[0];
			app.coordinateSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM;
			var new_layer = pack.DocUtils.copyLayer(docRef, doc, artb, doc.artboards[0], artb.artboardRect, layer, doc.layers.add(), padding, doOutline, ungroup, docRef.rulerOrigin, exportSettings.ignoreWarnings, SymbolBundler.hasBoundErrorRef);
			return doc;
		}


		return null;
	}
	SymbolBundler.cleanupCopyDoc = function(docRef, exportSettings, exportBundle){
		//exportBundle.copyDoc.close(SaveOptions.DONOTSAVECHANGES);
		pack.DocCloser.closeDocument(exportBundle.copyDoc);
		exportBundle.copyDoc = null;
		SymbolBundler.testLayer.symbolItems.removeAll();
	}
	SymbolBundler.cleanupTempLayer = function(docRef, exportSettings, exportBundle){
		SymbolBundler.cleanupCopyDoc(docRef, exportSettings, exportBundle);
		SymbolBundler.testLayer.remove();
		SymbolBundler.testLayer = null;
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