(function(pack){
	function LayerPanel(container, selectAll, selectedIndices, ignoreLayerNames, ignoreOutOfBounds){
		this.init(container, selectAll, selectedIndices, ignoreLayerNames, ignoreOutOfBounds);
		return this;
	}

	LayerPanel.prototype={
	    onSelectedChanged:null,
	    onIgnoreOutOfBoundsChanged:null,

		init:function(container, selectAll, selectedIndices, ignoreLayerNames, ignoreOutOfBounds){
			this.selectAll = selectAll;
			this.selectedIndices = selectedIndices;
			this.ignoreOutOfBounds = ignoreOutOfBounds;

			var scopedThis = this;
			var column = container.add('group', undefined, '')
			column.orientation = 'column';
			column.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP];

			this.layerList = column.add ('ListBox', [0, 0, 210, 410], '', 
									{numberOfColumns: 3, showHeaders: false, multiselect:true,
									columnTitles: ['', '', 'Layer'] });
			this.layerList.onChange = function(){
				scopedThis.checkSelection();
			}
			
			var docRef = app.activeDocument;
			var j = 0;
			for(var i=0; i<docRef.layers.length; ++i){
				var layer = docRef.layers[i];
				if(this.indexOf(ignoreLayerNames, layer.name)!=-1){
					continue;
				}
				var item = this.layerList.add("item");
				item.selected = this.indexOf(selectedIndices, i)!=-1;
				item.image = File(pack.directory+"/icons/checkbox_"+(item.selected?"":"un")+"selected.png");
				item.subItems[0].text = ++j;
				item.subItems[1].text = layer.name;
				item.dataIndex = i;
			}

			var row = column.add("group");
			row.orientation = "row";
			row.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.BOTTOM];

			this.selectLayers = row.add("checkbox", undefined, "Select/Deselect All Layers");
			this.selectLayers.size = [168, 20];
			this.selectLayers.onClick = function(){
				scopedThis.doLayerSelect(scopedThis.selectLayers.value);
			}
			if(selectAll){
				this.selectLayers.value = true;
				this.doLayerSelect(true);
			}

			var selectVis = row.add('iconbutton');
			selectVis.image = File(pack.directory+"/icons/eye.png");
			selectVis.helpTip = "Select Visible Layers";
			selectVis.onClick = function() {
				scopedThis.selectByVisible();
			};

			this.ignoreOutOfBoundsInput = column.add("checkbox", undefined, "Ignore layers out of artboard");
			this.ignoreOutOfBoundsInput.value = ignoreOutOfBounds;
			this.ignoreOutOfBoundsInput.onClick = function(){
				scopedThis.ignoreOutOfBounds = scopedThis.ignoreOutOfBoundsInput.value;
				scopedThis.onIgnoreOutOfBoundsChanged();
			}
			this.ignoreOutOfBoundsInput.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP];
		},
		selectByVisible:function(){
			this.ignoreChanges = true;
			var selected = 0;
			var selectedList = [];
			var docRef = app.activeDocument;
			for(var i=0; i<this.layerList.items.length; ++i){
				var item = this.layerList.items[i];
				var layer = docRef.layers[item.dataIndex];
				item.selected = layer.visible;

				item.image = File(pack.directory+"/icons/checkbox_"+(item.selected?"":"un")+"selected.png");
				if(item.selected){
					++selected;
					selectedList.push(item.dataIndex);
				}
			}
			this.selectLayers.value = (selected==this.layerList.items.length);
			this.ignoreChanges = false;
			this.updateSelected(this.selectLayers.value, selectedList);
		},
		doLayerSelect:function(select){
			this.ignoreChanges = true;
			var selectedList = [];
			for(var i=0; i<this.layerList.items.length; ++i){
				var item = this.layerList.items[i];
				item.selected = select;
				item.image = File(pack.directory+"/icons/checkbox_"+(select?"":"un")+"selected.png");
				if(select)selectedList.push(item.dataIndex);
			}
			this.ignoreChanges = false;
			this.updateSelected(select, selectedList);
		},
		checkSelection:function(){
			if(this.ignoreChanges)return;
			var selected = 0;
			var selectedList = [];
			for(var i=0; i<this.layerList.items.length; ++i){
				var item = this.layerList.items[i];
				item.image = File(pack.directory+"/icons/checkbox_"+(item.selected?"":"un")+"selected.png");
				if(item.selected){
					++selected;
					selectedList.push(item.dataIndex);
				}
			}
			this.selectLayers.value = (selected==this.layerList.items.length);
			this.updateSelected(this.selectLayers.value, selectedList);
		},
		updateSelected:function(selectAll, selectedIndices){
			this.selectAll = selectAll;
			this.selectedIndices = selectedIndices;
			if(this.onSelectedChanged)this.onSelectedChanged();
		},

		indexOf: function ( array, element ) {
			for(var i=0; i<array.length; i++){
				if(array[i]==element)return i;
			}
			return -1;
		}
	};
	pack.LayerPanel = LayerPanel;
})(smartExport)