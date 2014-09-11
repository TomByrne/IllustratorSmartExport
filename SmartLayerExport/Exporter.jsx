(function(pack){
	function Exporter(exportSettings, updateProgress, updatedExportItem){
		this.updateProgress = updateProgress;
		this.exportSettings = exportSettings;
		this.updatedExportItem = updatedExportItem;
		return this;
	}

	Exporter.prototype={
		type:Exporter,
		onExportFinished:null,
		
		// run_export function. does the dirty work
		run_export: function(exportList, directory) {

			this.exportList = exportList;
			this.directory = directory;

			this.export_artboards = this.exportSettings.artboardInd;
			this.export_layers = this.exportSettings.layerInd;
			this.num_to_export = exportList.length;
			this.num_exported = 0;

			if(!this.exportList.length){
				alert('Please select valid artboards / layers');
				return;
			}

			if(!directory){
				alert('Please select select a destination');
				return;
			}

			//this.que = new pack.Queue(100, );


			this.doRun();
		},

		doRun:function(){
			this.failed_artboards = [];
			this.failed_layers = [];

			var docRef = app.activeDocument;
			var exportInfo;

			var were_shown = this.getShownLayers();

			for (var x = 0; x < this.exportSettings.formats.length; x++ ) {
				var formatSettings = this.exportSettings.formats[x];
				var formatInfo = formatSettings.formatRef;
				var scaling = (formatSettings.scaling?formatSettings.scaling:this.exportSettings.scaling);

				var copyBehaviour = formatInfo.copyBehaviour || formatSettings.trimEdges;
				var options = formatInfo.getOptions(formatSettings, scaling);

				Folder(this.directory + (formatSettings.directory?"/"+formatSettings.directory:"")).create();

				for (var i = 0; i < this.export_artboards.length; i++ ) {
					var artI = this.export_artboards[i];
					var artboard = docRef.artboards[artI];
					var artboardName = artboard.name;
					starting_artboard = docRef.artboards.setActiveArtboardIndex(artI);
					
					var rect = artboard.artboardRect;

					var artW = rect[2]-rect[0];
					var artH = rect[1]-rect[3];

					var copyDoc;

					// if exporting artboard by artboard, export layers as is
					if ( exportInfo = this.checkShouldExport(formatSettings, artI) ) {

						try{
							var base_filename = this.directory + (formatSettings.directory?"/"+formatSettings.directory:"") + "/" + exportInfo.fileName;
							if(copyBehaviour){
								var offset = {x:0, y:0};
								copyDoc = this.copyDocument(docRef, artboard, rect, artW, artH, offset, formatSettings.innerPadding, function(layer){return (layer.name!=smartExportPanel.PREFS_LAYER_NAME && layer.visible)}, null, formatSettings.fontHandling=="outline");
								
								formatInfo.saveFile(copyDoc, base_filename, options, artI, artboardName);

								copyDoc.close(SaveOptions.DONOTSAVECHANGES);
								copyDoc = null;
							}else{
								formatInfo.saveFile(docRef, base_filename, options, artI, artboardName);
							}
							exportInfo.state = "success";
							this.updateProgress(++this.num_exported, this.num_to_export);
						}catch(e){
							exportInfo.state = "failed";
							this.failed_artboards.push(artI);
						}
						this.updatedExportItem(exportInfo);
								
					}
					if(this.export_layers.length){
							
						if(copyBehaviour){
							if(!formatSettings.trimEdges){
								var layerDepths = [];
								var offset = {x:0, y:0};
								copyDoc = this.copyDocument(docRef, artboard, rect, docRef.width, docRef.height, offset, formatSettings.innerPadding, this.isAdditionalLayer, layerDepths, formatSettings.fontHandling=="outline");
								var hasAdditLayers = copyDoc.layers.length>0;
							}
						}else{
							this.hideAllLayers();
						}
						
						for ( var j=0; j < this.export_layers.length; j++ ) {
							var layI = this.export_layers[j];
							var layer = docRef.layers[layI];
							var lyr_name = layer.name;

							if( exportInfo = this.checkShouldExport(formatSettings, artI, layI) ){
								try{
									var layerRect
									// only process layer if it has bounds (i.e. not guide layer) and falls within current artboard bounds
									layerRect = this.getLayerBounds(layer);
									if (!layerRect || (layerRect[0]<layerRect[2] && layerRect[1]>layerRect[3])) {
										var isVis = layerRect && this.intersects(rect, layerRect);

										if(!hasAdditLayers && !isVis){
											// skip layers where nothing is visible
											if(!this.exportSettings.ignoreWarnings)alert("Layer '"+lyr_name+"' does not intersect with the artboard '"+artboardName+"', this file has been skipped.");
											exportInfo.state = "skipped";
											this.updateProgress(++this.num_exported, this.num_to_export);
											this.updatedExportItem(exportInfo);
											continue;
										}
										var base_filename = this.directory + (formatSettings.directory?"/"+formatSettings.directory:"") + "/" + exportInfo.fileName;
										if(layerRect && copyBehaviour){

											if(formatSettings.trimEdges){
												if(copyDoc){
													copyDoc.close(SaveOptions.DONOTSAVECHANGES);
													copyDoc = null;
												}

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
												var layerDepths = [];
												var copyDoc = this.copyDocument(docRef, artboard, rect, docW, docH, layOffset, formatSettings.innerPadding, this.isAdditionalLayer, layerDepths, formatSettings.fontHandling=="outline");
											
												var hasAdditLayers = copyDoc.layers.length>1; // there will be one empty layer in the new file (which can be ignored)

												if(!hasAdditLayers && !isVis){
													// skip layers where nothing is visible
													continue;
												}
											}else{
												layOffset = {x:0, y:0};
											}
											if(isVis){
												// only copy layer if it is visible (if not only visible '+' layers will be output)
												var new_layer = this.copyLayer(docRef, layer, copyDoc.layers.add(), layOffset, copyDoc.width, copyDoc.height, formatSettings.innerPadding, formatSettings.fontHandling=="outline");
												if(!new_layer.pageItems.length && !new_layer.layers.length){
													new_layer.remove();
												}else{
													new_layer.visible = true;
													var depth = layerDepths[this.export_layers[j]];
													this.setLayerDepth(new_layer, depth);
												}
											}
											formatInfo.saveFile(copyDoc, base_filename, options, artI, artboardName);
											if(new_layer && !formatSettings.trimEdges){
												new_layer.remove();
												new_layer = null;
											}
										}else{
											layer.visible = true;
											formatInfo.saveFile(docRef, base_filename, options, artI, artboardName);

											layer.visible = false;
										}
									}
									exportInfo.state = "success";
									this.updateProgress(++this.num_exported, this.num_to_export);
								}catch(e){
									alert(e);
									this.failed_artboards.push(artI);
									this.failed_layers.push(layI);
									if(new_layer && !formatSettings.trimEdges){
										new_layer.remove();
										new_layer = null;
									}
									exportInfo.state = "failed";
								}
							}
							this.updatedExportItem(exportInfo);
							$.sleep(40) // Allows UI update;
						}
						if(copyDoc){
							copyDoc.close(SaveOptions.DONOTSAVECHANGES);
							copyDoc = null;
						}
					}
					
				}
			}
			if(!copyBehaviour){
				this.showLayers(were_shown);
			}
			this.hasFailed = (this.failed_layers.length || this.failed_artboards.length);
			if((!this.failed_layers.length && !this.failed_artboards.length) || !this.redoFailed(this.failed_layers, this.failed_artboards)){
				if(this.onExportFinished)this.onExportFinished();
			}
		},

		setLayerDepth:function(layer, depth){
			while(layer.zOrderPosition<depth){
				layer.zOrder(ZOrderMethod.BRINGFORWARD);
			}
			while(layer.zOrderPosition>depth){
				layer.zOrder(ZOrderMethod.SENDBACKWARD);
			}
		},

		checkShouldExport:function(formatSettings, artboard, layer){
			var matchLayer = !(layer===null);
			for(var i=0; i<this.exportList.length; i++){
				var item = this.exportList[i];
				if(item.formatSettings==formatSettings && item.artboard==artboard && (!matchLayer || item.layer==layer)){
					if(item.state!="success"){
						return item;
					}else{
						return false;
					}
				}
			}
			return false;
		},
	
		redoFailed: function(failed_layers, failed_artboards) {
			var newLayers = [];
			for(var i=0; i<failed_layers.length; ++i){
				var index = failed_layers[i];
				if(this.indexOf(newLayers, index)==-1)newLayers.push(index);
			}
			var newArtboards = [];
			for(var i=0; i<failed_artboards.length; ++i){
				var index = failed_artboards[i];
				if(this.indexOf(newArtboards, index)==-1)newArtboards.push(index);
			}
			if(newLayers.length){
				var layerNames = "";
				for(var i=0; i<newLayers.length; ++i){
					var index = newLayers[i];
					layerNames += "\n - "+docRef.layers[index].name;
				}
				var msg = newLayers.length+" layers failed across "+newArtboards.length+" artboards:"+layerNames+"\n Retry?";
			}else{
				var artboardNames = "";
				for(var i=0; i<newArtboards.length; ++i){
					var index = newArtboards[i];
					artboardNames += "\n - "+docRef.artboards[index].name;
				}
				var msg = newArtboards.length+" artboards failed:"+artboardNames+"\nRetry?";
			}
			if(confirm(msg)){
				this.export_artboards = newArtboards;
				this.export_layers = newLayers;
				this.doRun();
				return true;
			}
			return false;
		},
		
		copyDocument: function(docRef, artboard, rect, w, h, offset, doInnerPadding, layerCheck, layerDepths, outlineText) {
			var preset = new DocumentPreset();
			preset.width = w;
			preset.height = h;
			preset.colorMode = docRef.documentColorSpace;
			preset.units = docRef.rulerUnits;

			var copyDoc = app.documents.addDocument(docRef.documentColorSpace, preset);
			//app.activeDocument = docRef; // this allows us to do the selection trick when copying layers
			var emptyLayer = copyDoc.layers[0];
			copyDoc.pageOrigin = docRef.pageOrigin;
			copyDoc.rulerOrigin = docRef.rulerOrigin;
			var count = 1; // indices are 1 based!
			var n = docRef.layers.length;
			for ( var j=docRef.layers.length-1; j >= 0; j-- ) {
				layer = docRef.layers[j];
				
				if (layerCheck(layer)) {
					var layerBounds = this.getLayerBounds(layer);
					if(layerBounds && this.intersects(rect, layerBounds)){
						var newLayer = this.copyLayer(docRef, layer, copyDoc.layers.add(), offset, w, h, doInnerPadding, outlineText);
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
		},
		
		copyLayer: function(doc, fromLayer, toLayer, offset, docW, docH, doInnerPadding, outlineText) {
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
				try{
					this.shiftLayer(toLayer, offset.x, offset.y);
				}catch(e){
					alert("shift layer failed");
				}
			}
			if(doInnerPadding)this.innerPadLayer(toLayer, docW, docH);
			if(outlineText)this.doOutlineLayer(toLayer);

			return toLayer;
		},
		toArray:function(coll) {  
		    var arr = [];  
		    for (var i = 0; i < coll.length; ++i) {  
		        arr.push(coll[i]);  
		    }  
		    return arr;  
		},
		getAllPageItems:function(doc, layer) {
			if(layer.layers.length==0){
				return layer.pageItems;
			}
			if(layer.pageItems.length==0){
				return layer.layers;
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
		},
		
		copyIntoLayer: function(doc, fromLayer, toLayer) {
			var items = this.getAllPageItems(doc, fromLayer);
			try{
				this.copyItems(doc, items, toLayer);
			}catch(e){
				alert(e);
				alert("copy items failed");
			}
		},
		
		doOutlineLayer: function(layer) {
			this.doOutlineItems(layer.pageItems);
			for(var i=0; i<layer.layers.length; i++){
				this.doOutlineLayer(layer.layers[i]);
			}
		},
		
		doOutlineItems: function(items) {
			for(var i=0; i<items.length; ++i){
				var item = items[i];
				if(item.typename == "TextFrame"){
					item.createOutline();
				}else if(item.typename == "GroupItem"){
					this.doOutlineItems(item.pageItems);
				}
			}
		},
	
		shiftLayer: function(layer, shiftX, shiftY) {
			this.shiftItems(layer.pageItems, shiftX, shiftY);

			// copy backwards for correct z-ordering
			for(var i=layer.layers.length-1; i>=0; --i){
				this.shiftLayer(layer.layers[i], shiftX, shiftY)
			}
		},
		
		shiftItems: function(items, shiftX, shiftY) {
			if(shiftX==undefined)shiftX = 0;
			if(shiftY==undefined)shiftY = 0;

			for(var i=0; i<items.length; ++i){
				items[i].translate(shiftX, shiftY)
			}
		},
		
		hideAllLayers: function() {
			var n = docRef.layers.length;
			
			for(var i=0; i<n; ++i) {
				
				layer = docRef.layers[i];
				
				lyr_name = layer.name;
				
				// any layers that start with + are always turned on
				if (this.isAdditionalLayer(layer)) {
					layer.visible = true;
				} else {
					layer.visible = false;
				}
			}
		},
		
		
		showLayers: function(layerIndices) {
			var n = layerIndices.length;
			for(var i=0; i<n; ++i) {
				layer = docRef.layers[layerIndices[i]];
				layer.visible = true;
			}
		},
	
		intersects: function(rect1, rect2) {
			return !(  rect2[0] > rect1[2] || 
			           rect2[1] < rect1[3] ||
			           rect2[2] < rect1[0] || 
			           rect2[3] > rect1[1]);
		},
		
		getShownLayers: function() {
			var shown = []
			var n = docRef.layers.length;
			
			for(var i=0; i<n; ++i) {
				
				layer = docRef.layers[i];
				
				if(layer.visible){
					shown.push(i);
				}
			}
			return shown;
		},
	
		getLayerBounds: function(layer) {
			var rect;
			var items = layer.pageItems;
			for(var i=0; i<items.length; ++i){
				var item = items[i];

				if(item.guides || item.hidden){
					continue;
				}
				var visBounds = item.visibleBounds;
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
			return rect;
		},
		
		rectEqual: function(rect1, rect2) {
			return rect1[0]==rect2[0] && rect1[1]==rect2[1] && rect1[2]==rect2[2] && rect1[3]==rect2[3] ;
		},
		
		copyItems: function(doc, fromList, toLayer) {
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

					if(item.typename == "GroupItem" && !item.clipped){
						this.copyItems(doc, item.pageItems, toLayer);
					}else{
						var copy = item.duplicate(toLayer, ElementPlacement.PLACEATEND);
						if(item.clipping)copy.clipping = true;
						if(item.clipped)copy.clipped = true;
					}
				}
			}
			toLayer.visible = visWas;
		},

		innerPadLayer: function(layer, docW, docH){
			for(var i=0; i<layer.pageItems.length; ++i){
				var item = layer.pageItems[i];
				var bounds = item.visibleBounds;
				// round to two decimal points
				var l = Math.round(bounds[0] * 100) / 100;
				var b = Math.round(bounds[1] * 100) / 100;
				var r = Math.round(bounds[2] * 100) / 100;
				var t = Math.round(bounds[3] * 100) / 100;
				if(l==0 && t==0 && r==docW && b==docH){
					var scaleX = (r-1) / r * 100; // resize takes percentage values
					var scaleY = (b-1) / b * 100;
					item.resize(scaleX, scaleY, null, null, null, null, null, Transformation.CENTER);
				}
			}
			for(var i=0; i<layer.layers.length; ++i){
				innerPadLayer(layer.layers[i], docW, docH);
			}
		},
	
		isAdditionalLayer: function(layer) {
			return ( layer.name.match( /^\+/ ) && layer.visible);
		},

		indexOf: function ( array, element ) {
			for(var i=0; i<array.length; i++){
				if(array[i]==element)return i;
			}
			return -1;
		}
	};
	pack.Exporter = Exporter;
})(smartExport)