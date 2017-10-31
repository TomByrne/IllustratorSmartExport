(function(pack){
	DocUtils = {};


		
	DocUtils.copyDocument = function(docRef, artboard, artboardRect, w, h, doInnerPadding, layerCheck, layerDepths, outlineText, ungroup, layerVis, ignoreWarnings, hasBoundErrorRef, offset, colorSpace) {
		if(w<1)w = 1;
		if(h<1)h = 1;
		var preset = new DocumentPreset();
		preset.width = w;
		preset.height = h;
		preset.units = docRef.rulerUnits;

		if(colorSpace == "cmyk"){
			preset.colorMode = DocumentColorSpace.CMYK;

		}else if(colorSpace == "rgb"){
			preset.colorMode = DocumentColorSpace.RGB;

		}else{
			preset.colorMode = docRef.documentColorSpace;
		}

		var copyDoc = app.documents.addDocument(preset.colorMode, preset);
		var copyArtboard = copyDoc.artboards[0];
		copyArtboard.shift = null; // Illustrator seems to reuse instances behind the scenes
		app.coordinateSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM;
		copyDoc.isNew = true;
		try{
			//app.activeDocument = docRef; // this allows us to do the selection trick when copying layers

			// for some mystical reason, setting these can mess up the artboard dimensions
			//copyDoc.pageOrigin = docRef.pageOrigin;
			//copyDoc.rulerOrigin = docRef.rulerOrigin;

			var count = 1; // indices are 1 based!
			var n = docRef.layers.length;
			for ( var j=docRef.layers.length-1; j >= 0; j-- ) {
				layer = docRef.layers[j];
				
				var vis = (layerVis ? layerVis[j] : layer.visible );
				if (layerCheck==null || layerCheck(layer, vis)) {
					//var layerBounds = this.getLayerBounds(docRef, layer);
					//if(layerBounds && this.intersects(artboardRect, layerBounds)){
						var newLayer = this.copyLayer(docRef, copyDoc, artboard, copyArtboard, artboardRect, layer, copyDoc.layers.add(), doInnerPadding, outlineText, ungroup, docRef.rulerOrigin, ignoreWarnings, hasBoundErrorRef, offset);
						this.setLayerDepth(newLayer, count);
						if(!newLayer.pageItems.length && !newLayer.layers.length){
							newLayer.remove();
						}else{
							++count;
						}
					//}
				}else if(layerDepths){
					layerDepths[j] = count;
				}
			}

			return copyDoc;
		}catch(e){
			alert("DocUtils.copyDocument failed:\n"+e);
			copyDoc.close(SaveOptions.DONOTSAVECHANGES);
		}
	}
	DocUtils.rectEqual = function(rect1, rect2) {
		return rect1[0]==rect2[0] && rect1[1]==rect2[1] && rect1[2]==rect2[2] && rect1[3]==rect2[3] ;
	}
		
	DocUtils.getArtboardShift = function(artboardRect, toArtboard) {
		var toRect = toArtboard.artboardRect;
		return {x:toRect[0] - artboardRect[0], y:toRect[3] - artboardRect[3]};
	}

	DocUtils.getLayerIndex = function(layers, layer){
		for(var i=0; i<layers.length; i++)
		{
			if(layers[i] == layer) return i;
		}
		return -1;
	}
		
	DocUtils.copyLayer = function(fromDoc, toDoc, fromArtboard, toArtboard, artboardRect, fromLayer, toLayer, doInnerPadding, outlineText, ungroup, rulerOrigin, ignoreWarnings, hasBoundErrorRef, offset, elemFilter) {
		app.coordinateSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM;

		toLayer.artworkKnockout = fromLayer.artworkKnockout;
		toLayer.blendingMode = fromLayer.blendingMode;
		toLayer.color = fromLayer.color;
		toLayer.dimPlacedImages = fromLayer.dimPlacedImages;
		toLayer.isIsolated = fromLayer.isIsolated;
		toLayer.name = fromLayer.name;
		toLayer.opacity = fromLayer.opacity;
		toLayer.preview = fromLayer.preview;
		toLayer.printable = fromLayer.printable;
		toLayer.sliced = fromLayer.sliced;
		toLayer.typename = fromLayer.typename;

		if(toDoc.isNew){
			var artOffset = toArtboard.shift;
			if(!artOffset){
				artOffset = DocUtils.getArtboardShift(artboardRect, toArtboard);
				toArtboard.shift = artOffset;
			}

			var offX = artOffset.x;
			var offY = artOffset.y;
			if(offset){
				offX += offset.x;
				offY += offset.y;
			}
			if(offX!=0 || offY!=0){
				var toRect = toArtboard.artboardRect;
				toRect[0] -= offX;
				toRect[1] -= offY;
				toRect[2] -= offX;
				toRect[3] -= offY;
				toArtboard.artboardRect = toRect;
			}
		}

		var layerPath = (DocUtils.getLayerIndex(fromDoc.layers, fromLayer) + 1) + "";
		this.copyIntoLayer(fromDoc, fromLayer, toLayer, ignoreWarnings, artboardRect, layerPath, elemFilter);
		if(doInnerPadding)this.innerPadLayer(toLayer, toArtboard);
		if(outlineText)this.doOutlineLayer(toLayer);
		if(ungroup)this.doUngroupLayer(toLayer);

		if(toDoc.isNew){
			var ind = toDoc.layers[0]==toLayer ? 1 : 0;
			toDoc.layers[ind].remove();
			toDoc.isNew = false;
		}

		return toLayer;
	}
	DocUtils.doUngroupLayer = function(layer) {
		var items = layer.pageItems;
		for(var i=0; i<items.length; ++i){
			var item = items[i];
			this.doUngroupItem(item);
		}
		for(var i=0; i<layer.layers.length; ++i){
			var childLayer = layer.layers[i];
			this.doUngroup(childLayer);
		}
	}
	DocUtils.doUngroupItem = function(item) {
		if(item.typename == "GroupItem" && !item.clipped){
			var children = item.pageItems;
			for(var j=children.length-1; j>=0; --j){
				var child = children[j];
				child.move(item, ElementPlacement.PLACEAFTER);
				this.doUngroupItem(child);
			}
			item.remove();
		}
	}
	DocUtils.getLayerBounds = function(doc, layer, artboardRect, elemFilter, parentPath) {
		var rect;
		var items = DocUtils.getAllPageItems(doc, layer, true);

		if(parentPath == null) parentPath = (DocUtils.getLayerIndex(doc.layers, layer) + 1) + "";
		parentPath += ":";

		var childFilter = elemFilter;
		for(var i=0; i<items.length; ++i){
			var item = items[i];
			var path = parentPath + (i+1);
			var isLayer = (item.typename=="Layer");

			var ignoreVis = false;

			if(elemFilter){
				var filter = elemFilter(item, path);
				if(!filter) continue;
				if(filter != 'explore') {
					childFilter = null; // clear so all descendants get included
					ignoreVis = true;
				}
			}

			var itemBounds;
			if(isLayer){
				if(!item.visible)continue;
				itemBounds = this.getLayerBounds(doc, item, artboardRect, childFilter, path);
			}else{
				if(item.guides || (!ignoreVis && item.hidden)) continue;
				itemBounds = this.getItemBounds(item, childFilter, path);
			}
			if(itemBounds == null) continue;
			if(artboardRect && !DocUtils.intersects(artboardRect, itemBounds)) continue;

			if(rect==null){
				rect = itemBounds;
			}else{
				if(rect[0]>itemBounds[0]){
					rect[0] = itemBounds[0];
				}
				if(rect[1]<itemBounds[1]){
					rect[1] = itemBounds[1];
				}
				if(rect[2]<itemBounds[2]){
					rect[2] = itemBounds[2];
				}
				if(rect[3]>itemBounds[3]){
					rect[3] = itemBounds[3];
				}
			}
		}

		if(rect && rect[0]<rect[2] && rect[1]>rect[3]){
			return rect;
		}else{
			return null;
		}
	}

	DocUtils.artboardIntersects = function(docRef, artI, rect){
		var artboard = docRef.artboards[artI];
		app.coordinateSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM;
		var artRect = artboard.artboardRect;
		return this.intersects(artRect, rect);
	}

	DocUtils.copyIntoLayer = function(doc, fromLayer, toLayer, ignoreWarnings, artboardRect, parentPath, elemFilter) {
		var items = this.getAllPageItems(doc, fromLayer, ignoreWarnings);
		try{
			this.copyItems(doc, items, toLayer, ignoreWarnings, artboardRect, parentPath, elemFilter);
		}catch(e){
			alert("Copy items failed: "+e);
		}
	}
		
	DocUtils.copyItems = function(doc, fromList, toLayer, ignoreWarnings, artboardRect, parentPath, elemFilter) {
		parentPath += ":";
		var visWas = toLayer.visible;
		toLayer.visible = true;
		for(var i=0; i<fromList.length; ++i){
			var item = fromList[i];
			var path = parentPath + (i+1);
			var isLayer = (item.typename=="Layer");
			if(isLayer){
				if(item.visible && (item.pageItems.length || item.layers.length)){
					this.copyIntoLayer(doc, item, toLayer, ignoreWarnings, artboardRect, path, elemFilter)
				}
			}else if(elemFilter != null){
					
				var filter = elemFilter(item, path);
				if(!filter) continue;

				if(item.typename == "GroupItem" && filter == 'explore'){
					DocUtils.copyItems(doc, item.pageItems, toLayer, ignoreWarnings, artboardRect, path, elemFilter);
				}else{
					item.duplicate(toLayer, ElementPlacement.PLACEATEND);
				}


			}else{
				if(item.hidden || !DocUtils.intersects(artboardRect, item.visibleBounds)){
					continue;
				}
				item.duplicate(toLayer, ElementPlacement.PLACEATEND);
			}
		}
		toLayer.visible = visWas;
	}

	DocUtils.innerPadLayer = function(layer, artboard){
		var rect = artboard.artboardRect;
		var artL = this.precision(rect[0], 0.01);
		var artB = this.precision(rect[1], 0.01);
		var artR = this.precision(rect[2], 0.01);
		var artT = this.precision(rect[3], 0.01);
		var artW = artR-artL;
		var artH = artB-artT;

		var gap = 1;

		for(var i=0; i<layer.pageItems.length; ++i){
			var item = layer.pageItems[i];
			var bounds = item.visibleBounds;
			// round to two decimal points
			var l = this.precision(bounds[0], 0.01);
			var b = this.precision(bounds[1], 0.01);
			var r = this.precision(bounds[2], 0.01);
			var t = this.precision(bounds[3], 0.01);
			var w = r-l;
			var h = b-t;
			//alert("ya:\n"+l+" "+b+" "+r+" "+t+"\n"+artL+" "+artB+" "+artR+" "+artT);
			var diffL = (l-artL);
			var diffB = (b-artB);
			var diffW = w - artW;
			var diffH = h - artH;
			if(diffL<1 && diffB<1 && diffW<1 && diffH<1){
				if(diffL || diffB){
					item.translate(artL + (artW - w)/2 - l, artB + (artH - h)/2 - b, true, true, true, true);
				}

				var w = r - l;
				var h = b - t;
				var scaleX = (artW-gap*2) / w * 100; // resize takes percentage values
				var scaleY = (artH-gap*2) / h * 100;
				item.resize(scaleX, scaleY, true, true, true, true, null, Transformation.CENTER);
			}
		}
		for(var i=0; i<layer.layers.length; ++i){
			DocUtils.innerPadLayer(layer.layers[i], artboard);
		}
	}

	DocUtils.setLayerDepth = function(layer, depth){
		while(layer.zOrderPosition<depth){
			layer.zOrder(ZOrderMethod.BRINGFORWARD);
		}
		while(layer.zOrderPosition>depth){
			layer.zOrder(ZOrderMethod.SENDBACKWARD);
		}
	}

	DocUtils.intersects = function(rect1, rect2) {
		return !(  rect2[0] > rect1[2] || 
		           rect2[1] < rect1[3] ||
		           rect2[2] < rect1[0] || 
		           rect2[3] > rect1[1]);
	}

	var setGetVisiblity = function(visState, doc, elems, path, ignoreWarnings, isSetting){
		if(path == null) path = "";
		else path += ":";

		for(var i=0; i<elems.length; i++){
			var item = elems[i];
			var children;
			var thisPath = path + (i + 1);
			var wasLocked = item.locked;
			var isVis;
			if(isSetting && wasLocked) item.locked = false;
			if(item.typename == "Layer"){
				children = DocUtils.getAllPageItems(doc, item, ignoreWarnings);
				if(isSetting) item.visible = true;
				isVis = item.visible;
			}else{
				children = item.pageItems;
				if(isSetting) item.hidden = false;
				isVis = !item.hidden;
			}
			if(!isSetting) visState[thisPath] = isVis;
			if(children && children.length){
				setGetVisiblity(visState, doc, children, thisPath, ignoreWarnings, isSetting);
			}

			if(item.typename == "Layer"){
				if(isSetting && item.visible != visState[thisPath]) item.visible = (visState[thisPath] != false);
			}else{
				if(isSetting && item.hidden != (!visState[thisPath])) item.hidden = (visState[thisPath] == false);
			}
			if(isSetting && wasLocked) item.locked = wasLocked;
		}
	}
	DocUtils.getAllElemVisibility = function(doc, ignoreWarnings) {
		var ret = [];
		for(var i=0; i<doc.layers.length; i++){
			var layer = doc.layers[i];
			var path = (i + 1) + "";
			var children = DocUtils.getAllPageItems(doc, layer, ignoreWarnings);
			var elemVis = {};
			elemVis[path] = layer.visible;
			setGetVisiblity(elemVis, doc, children, path, ignoreWarnings, false);
			ret.push(elemVis);
		}
		return ret;
	}
	DocUtils.setAllElemVisibility = function(doc, visState, layerInd, ignoreWarnings) {
		for(var i=0; i<doc.layers.length; i++){
			if(layerInd != null && i != layerInd) continue;

			var layer = doc.layers[i];
			var path = (i + 1) + "";
			var children = DocUtils.getAllPageItems(doc, layer, ignoreWarnings);
			var elemVis = visState[i];
			var wasLocked = layer.locked;
			layer.locked = false;
			layer.visible = true; // Layer must be visible to affect child visibility
			setGetVisiblity(elemVis, doc, children, path, ignoreWarnings, true);
			layer.visible = (elemVis[path] != false);
			layer.locked = wasLocked;
		}
	}


	DocUtils.getAllPageItems = function(doc, layer, ignoreWarnings) {
		if(layer.layers.length==0){
			return layer.pageItems;
		}
		if(layer.pageItems.length==0){
			return layer.layers;
		}
		if(!this.layerItems){
			if(!this.layerItemWarned && !ignoreWarnings){
				this.layerItemWarned = true;
				alert("To improve output performance, avoid using child layers (groups can do the same thing).");
			}
			//var items = [];
			//var layers = layer.layers;
			this.layerItems = [];
			var docLayers = doc.layers;
			var pageItems = doc.pageItems;
		    for(var i=0; i<pageItems.length; i++){
		    	var pageItem = pageItems[i];
		    	if(pageItem.parent.typename!="Layer" && (pageItem.guides || pageItem.hidden)) continue;

		    	var parIndex = -1;
		    	var checkInd = false;
		    	var ind = DocUtils.indexOf(docLayers, pageItem.parent);
		    	if(ind !=-1){
		    		parIndex = ind;
		    	}else if(pageItem.parent.typename=="Layer"){
		    		var ind = DocUtils.indexOf(docLayers, pageItem.parent.parent);
		    		if( ind!=-1 ){
		    			parIndex = ind;
		    			pageItem = pageItem.parent;
		    			checkInd = true;
		    		}
		    	}
		    	if(parIndex!=-1){
		    		var par = doc.layers[parIndex];
		    		var items = this.layerItems[parIndex];
		    		if(!items){
		    			items = [pageItem];
		    			this.layerItems[parIndex] = items;
		    		}else if(!checkInd || DocUtils.indexOf(items, pageItem)==-1){
		    			items.push(pageItem);
		    		}
		    	}
		    }

		    /*var msg = "";
		    for(var i=0; i<docLayers.length; i++){
		    	msg += docLayers[i].name +" - "+this.layerItems[i].length+"\n";
		    }
		    alert(msg);*/
		}
		var ind = DocUtils.indexOf(doc.layers, layer);
	    return this.layerItems[ind];
	}

	
	DocUtils.shiftLayer = function(layer, shiftX, shiftY) {
		if(shiftX==undefined)shiftX = 0;
		if(shiftY==undefined)shiftY = 0;

		for(var i=0; i<layer.pageItems.length; ++i){
			layer.pageItems[i].translate(shiftX, shiftY, true, true, true, true);
		}
		for(var i=layer.layers.length-1; i>=0; --i){
			this.shiftLayer(layer.layers[i], shiftX, shiftY)
		}
	}

	DocUtils.doOutlineLayer = function(layer) {
		this.doOutlineItems(layer.pageItems);
		for(var i=0; i<layer.layers.length; i++){
			this.doOutlineLayer(layer.layers[i]);
		}
	}
	DocUtils.doOutlineItems = function(items) {
		for(var i=0; i<items.length; ++i){
			var item = items[i];
			if(item.typename == "TextFrame"){
				item.createOutline();
			}else if(item.typename == "GroupItem"){
				this.doOutlineItems(item.pageItems);
			}
		}
	}

	DocUtils.getItemBounds = function(parent, elemFilter, parentPath){
		if(parent.typename=="GroupItem"){
			parentPath += ":";
			var rect;
			var maskRect;
			var items = parent.pageItems;
			var childFilter = elemFilter;
			for(var i=0; i<items.length; ++i){
				var item = items[i];
				var path = parentPath + (i + 1);

				var ignoreVis = false;

				if(elemFilter){
					var filter = elemFilter(item, path);
					if(!filter) continue;
					if(filter != 'explore'){
						childFilter = null; // clear so all descendants get included
						ignoreVis = true;
					}
				}

				if(item.guides || (!ignoreVis && item.hidden)){
					continue;
				}
				//var visBounds = item.visibleBounds;
				var visBounds = DocUtils.getItemBounds(item, childFilter, path);
				if(visBounds==null)continue;
				else if(parent.clipped && item.clipping){
					maskRect = visBounds;
					continue;
				}

				if(rect==null){
					rect = visBounds.concat();
				}else{
					if(rect[0]>visBounds[0]){
						rect[0] = visBounds[0];
					}
					if(rect[1]<visBounds[1]){
						rect[1] = visBounds[1];
					}
					if(rect[2]<visBounds[2]){
						rect[2] = visBounds[2];
					}
					if(rect[3]>visBounds[3]){
						rect[3] = visBounds[3];
					}
				}
			}
			if(maskRect && rect){
				if(rect[0]<maskRect[0]){
					rect[0] = maskRect[0];
				}
				if(rect[1]>maskRect[1]){
					rect[1] = maskRect[1];
				}
				if(rect[2]>maskRect[2]){
					rect[2] = maskRect[2];
				}
				if(rect[3]<maskRect[3]){
					rect[3] = maskRect[3];
				}
			}

			return rect;
		}else{
			return parent.visibleBounds.concat();
		}
	}

	DocUtils.precision = function(num, roundTo){
		return Math.round(num / roundTo) * roundTo;
	}


	DocUtils.indexOf = function ( array, element ) {
		for(var i=0; i<array.length; i++){
			if(array[i]==element)return i;
		}
		return -1;
	}


	DocUtils.getShownLayers = function(docRef, hideAll) {
		var shown = []
		var n = docRef.layers.length;
		
		for(var i=0; i<n; ++i) {
			
			layer = docRef.layers[i];
			
			if(layer.visible){
				shown.push(i);
			}
			if(this.isAdditionalLayer(layer)){
				layer.visible = true;
			}else if(layer.visible && hideAll){
				layer.visible = false;
			}
		}
		return shown;
	}
	DocUtils.showAllLayers = function(docRef, layerVis) {
		var n = docRef.layers.length;
		
		for(var i=0; i<n; ++i) {
			layer = docRef.layers[i];
			layer.visible = layerVis[i];
		}
	}
	DocUtils.hideAllLayers = function(docRef) {
		var n = docRef.layers.length;
		
		for(var i=0; i<n; ++i) {
			
			layer = docRef.layers[i];
			
			// any layers that start with + are always turned on
			if (this.isAdditionalLayer(layer)) {
				layer.visible = true;
			} else {
				layer.visible = false;
			}
		}
	}
	DocUtils.isAdditionalLayer = function(layer, vis) {
		if(vis == null) vis = layer.visible;
		return ( layer.name.match( /^\+/ ) && vis);
	},

	pack.DocUtils = DocUtils;
})(smartExport)