(function(pack){
	DocUtils = {};


		
	DocUtils.copyDocument = function(docRef, artboard, artboardRect, w, h, offset, doInnerPadding, layerCheck, layerDepths, outlineText, ungroup, layerVis) {
		var preset = new DocumentPreset();
		preset.width = w;
		preset.height = h;
		preset.colorMode = docRef.documentColorSpace;
		preset.units = docRef.rulerUnits;

		var copyDoc = app.documents.addDocument(docRef.documentColorSpace, preset);
		try{
			//app.activeDocument = docRef; // this allows us to do the selection trick when copying layers
			var emptyLayer = copyDoc.layers[0];

			// for some mystical reason, setting these can mess up the artboard dimensions
			copyDoc.pageOrigin = docRef.pageOrigin;
			copyDoc.rulerOrigin = docRef.rulerOrigin;

			var count = 1; // indices are 1 based!
			var n = docRef.layers.length;
			for ( var j=docRef.layers.length-1; j >= 0; j-- ) {
				layer = docRef.layers[j];
				
				var vis = (layerVis ? layerVis[j] : layer.visible );
				if (layerCheck==null || layerCheck(layer, vis)) {
					var layerBounds = this.getLayerBounds(layer);
					if(layerBounds && this.intersects(artboardRect, layerBounds)){
						var newLayer = this.copyLayer(docRef, artboard, artboardRect, layer, copyDoc.layers.add(), offset, doInnerPadding, outlineText, ungroup, docRef.rulerOrigin);
						this.setLayerDepth(newLayer, count);
						if(!newLayer.pageItems.length && !newLayer.layers.length){
							newLayer.remove();
						}else{
							++count;
							if(emptyLayer){
								emptyLayer.remove();
								emptyLayer = null;
							}
						}
					}
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
		
	DocUtils.copyLayer = function(doc, artboard, artboardRect, fromLayer, toLayer, offset, doInnerPadding, outlineText, ungroup, rulerOrigin) {

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

		if(!offset.norm){
			var oldBounds = this.getLayerBounds(fromLayer);
			 //for mystery reasons, this only works if done before copying items across
		}
		this.copyIntoLayer(doc, fromLayer, toLayer);

		if(toLayer.pageItems.length && !offset.norm){

			var newBounds = this.getLayerBounds(toLayer);
			if(this.rectEqual(oldBounds, newBounds)){
				//$.sleep(5000); // sleeping doesn't help!!
				if(!this.exportSettings.ignoreWarnings)alert("Illustrator visibleBounds issue workaround.\nTry removing groups on layer '"+fromLayer.name+"' to avoid this in future.\nPlease press OK");
				newBounds = this.getLayerBounds(toLayer);
				// sometimes it takes a moment for bounds to be updated
			}
			if(oldBounds && newBounds){
				offset.x += oldBounds[0]-newBounds[0];
				offset.y += oldBounds[3]-newBounds[3];
				offset.norm = true;
			}
		}
		if(toLayer.parent.artboards!=null){ // only if top level layer
			this.shiftLayer(toLayer, offset.x, offset.y);
		}
		if(doInnerPadding)this.innerPadLayer(toLayer, artboardRect, rulerOrigin);
		if(outlineText)this.doOutlineLayer(toLayer);
		if(ungroup)this.doUngroupLayer(toLayer);

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
	DocUtils.getLayerBounds = function(layer) {
		var rect;
		var items = layer.pageItems;
		for(var i=0; i<items.length; ++i){
			var item = items[i];

			if(item.guides || item.hidden){
				continue;
			}
			var visBounds = this.getItemBounds(item);
			if(visBounds==null)continue;

			if(rect==null){
				rect = visBounds;
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
		for(var i=0; i<layer.layers.length; ++i){
			var childLayer = layer.layers[i];

			if(!childLayer.visible)continue;

			var childRect = this.getLayerBounds(childLayer);
			if(childRect==null)continue;

			if(rect==null){
				rect = childRect;
			}else{
				if(rect[0]>childRect[0]){
					rect[0] = childRect[0];
				}
				if(rect[1]<childRect[1]){
					rect[1] = childRect[1];
				}
				if(rect[2]<childRect[2]){
					rect[2] = childRect[2];
				}
				if(rect[3]>childRect[3]){
					rect[3] = childRect[3];
				}
			}
		}
		if(rect[0]<rect[2] && rect[1]>rect[3]){
			return rect;
		}else{
			return null;
		}
	}

	DocUtils.artboardIntersects = function(doc, artI, rect){
		var artboard = docRef.artboards[artI];
		var artRect = artboard.artboardRect;
		return this.intersects(artRect, rect);
	}

	DocUtils.copyIntoLayer = function(doc, fromLayer, toLayer) {
		var items = this.getAllPageItems(doc, fromLayer);
		try{
			this.copyItems(doc, items, toLayer);
		}catch(e){
			alert(e);
			alert("copy items failed");
		}
	}
		
	DocUtils.copyItems = function(doc, fromList, toLayer) {
		var visWas = toLayer.visible;
		toLayer.visible = true;
		for(var i=0; i<fromList.length; ++i){
			var item = fromList[i];
			if(item.typename=="Layer"){
				if(item.visible && (item.pageItems.length || item.layers.length)){
					this.copyIntoLayer(doc, item, toLayer)
				}
			}else{
				if(item.hidden)continue;

				/*if(item.typename == "GroupItem" && !item.clipped){
					this.copyItems(doc, item.pageItems, toLayer);
				}else{*/
					item.duplicate(toLayer, ElementPlacement.PLACEATEND);
				//}
			}
		}
		toLayer.visible = visWas;
	}

	DocUtils.innerPadLayer = function(layer, rect, rulerOrigin){
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
				var scaleX = (artW-gap) / w * 100; // resize takes percentage values
				var scaleY = (artH-gap) / h * 100;
				item.resize(scaleX, scaleY, true, true, true, true, null, Transformation.CENTER);
			}
		}
		for(var i=0; i<layer.layers.length; ++i){
			innerPadLayer(layer.layers[i], docW, docH);
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

	DocUtils.getAllPageItems = function(doc, layer) {
		if(layer.layers.length==0){
			return layer.pageItems;
		}
		if(layer.pageItems.length==0){
			return layer.layers;
		}
		if(!this.layerItemWarned && !this.exportSettings.ignoreWarnings){
			this.layerItemWarned = true;
			alert("To improve output performance, avoid using child layers (groups can do the same thing).");
		}
		var items = [];
		var layers = layer.layers;
	    for(var i=0; i<doc.pageItems.length; i++){
	    	var pageItem = doc.pageItems[i];
	    	if(pageItem.parent == layer){
	    		items.push(pageItem);
	    	}else if(pageItem.parent.typename=="Layer" && pageItem.parent.parent==layer && this.indexOf(items, pageItem.parent)==-1){
	    		items.push(pageItem.parent);
	    	}
	    }
	    return items;
	}

	
	DocUtils.shiftLayer = function(layer, shiftX, shiftY) {
		if(shiftX==undefined)shiftX = 0;
		if(shiftY==undefined)shiftY = 0;

		for(var i=0; i<layer.pageItems.length; ++i){
			layer.pageItems[i].translate(shiftX, shiftY, true, true, true, true)
		}

		// copy backwards for correct z-ordering
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

	DocUtils.getItemBounds = function(parent){
		if(parent.typename=="GroupItem"){
			var rect;
			var maskRect;
			var items = parent.pageItems;
			for(var i=0; i<items.length; ++i){
				var item = items[i];

				if(item.guides || item.hidden){
					continue;
				}
				var visBounds = item.visibleBounds;
				if(visBounds==null)continue;
				else if(parent.clipped && item.clipping){
					maskRect = visBounds;
					continue;
				}

				if(rect==null){
					rect = visBounds;
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
			if(maskRect){
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
			return parent.visibleBounds;
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
		return ( layer.name.match( /^\+/ ) && vis);
	},

	pack.DocUtils = DocUtils;
})(smartExport)