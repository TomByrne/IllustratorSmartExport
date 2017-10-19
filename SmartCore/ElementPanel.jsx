(function(pack){
	function ElementPanel(container, selectedPaths, openPaths, ignoreLayerNames, ignoreOutOfBounds){
		this.init(container, selectedPaths, openPaths, ignoreLayerNames, ignoreOutOfBounds);
		return this;
	}

	ElementPanel.prototype={
	    onSelectedChanged:null,
	    onOpenedChanged:null,
	    onIgnoreOutOfBoundsChanged:null,
	    items:null,
	    itemsByLevel:null,
	    ignoreLayerNames:null,

		init:function(container, selectedPaths, openPaths, ignoreLayerNames, ignoreOutOfBounds){
			this.selectedPaths = selectedPaths;
			this.baseSelectedPaths = selectedPaths.concat([]);
			this.openPaths = openPaths;
			this.baseOpenPaths = openPaths.concat([]);
			this.ignoreOutOfBounds = ignoreOutOfBounds;
			this.ignoreLayerNames = ignoreLayerNames;

			var scopedThis = this;
			var column = container.add('group', undefined, '')
			column.orientation = 'column';
			column.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP];

			this.elementTree = column.add ('treeview');
			this.elementTree.preferredSize = [420, 450];

			this.items = [];
			this.itemsByLevel = [];
			
			var docRef = app.activeDocument;
			//this.createTreeLayers(docRef, docRef.layers, ignoreLayerNames);

			this.elementTree.onExpand = function(item){
				if(this.ignoreChanges) return;
				this.ignoreChanges = true;
				var data = item.itemData;
				data.open = true;
				scopedThis.createTreeElements(data, data.level);
				scopedThis.checkOpened();
				this.ignoreChanges = false;
			}
			this.elementTree.onCollapse = function(item){
				if(this.ignoreChanges) return;
				this.ignoreChanges = true;
				var data = item.itemData;
				data.open = false;
				scopedThis.checkOpened();
				this.ignoreChanges = false;
			}
			this.elementTree.onChange = function(){
				scopedThis.onItemClick(scopedThis.elementTree.selection);
			}


			this.selectionOptions = [
				{name:"Select / Deselect Elements", key:null},

				{name:"Select Layers", handler:closure(this, this.selectByLevel, [true, 0])},
				{name:"Deselect Layers", handler:closure(this, this.selectByLevel, [false, 0])},

				{name:"Select Depth 1", handler:closure(this, this.selectByLevel, [true, 1])},
				{name:"Deselect Depth 1", handler:closure(this, this.selectByLevel, [false, 1])},

				{name:"Select Depth 2", handler:closure(this, this.selectByLevel, [true, 2])},
				{name:"Deselect Depth 2", handler:closure(this, this.selectByLevel, [false, 2])},

				{name:"Select Depth 3", handler:closure(this, this.selectByLevel, [true, 3])},
				{name:"Deselect Depth 3", handler:closure(this, this.selectByLevel, [false, 3])},
			];

			this.selectionList = new pack.Dropdown(column);
			//this.selectionList.setEnabled(false);
			this.selectionList.setSize(420,20);
			var selectionItems = [];
			for(var i=0; i<this.selectionOptions.length; i++){
				var item = this.selectionOptions[i];
				selectionItems.push(item.name);
			}
			this.selectionList.setItems(selectionItems);
			this.selectionList.setSelection(0);
			this.selectionList.onChange = function() {
				var handler = scopedThis.selectionOptions[scopedThis.selectionList.selection].handler;
				if(handler != null) handler.apply(scopedThis, []);
				scopedThis.selectionList.setSelection(0);
			};

			var row = column.add("group");
			row.orientation = "row";
			row.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.BOTTOM];

			this.ignoreOutOfBoundsInput = row.add("checkbox", undefined, "Skip elements out of artboard");
			this.ignoreOutOfBoundsInput.value = ignoreOutOfBounds;
			this.ignoreOutOfBoundsInput.onClick = function(){
				scopedThis.ignoreOutOfBounds = scopedThis.ignoreOutOfBoundsInput.value;
				scopedThis.onIgnoreOutOfBoundsChanged();
			}
			this.ignoreOutOfBoundsInput.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP];

			var tip = row.add ('statictext', undefined, "Select artboards on previous tab"); 
			tip.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP];
		},
		show:function(){
			if(!this.inited){
				this.inited = true;
				var docRef = app.activeDocument;
				this.createTreeLayers(docRef, docRef.layers, this.ignoreLayerNames);
			}
		},
		createTreeLayers:function(doc, layers, ignoreLayerNames){
			var j = 0;
			var itemsHere = [];
			for(var i=0; i<layers.length; ++i){
				var layer = layers[i];
				if(this.indexOf(ignoreLayerNames, layer.name)!=-1){
					continue;
				}
				var path = (i+1).toString();
				var childPath = path + " : ";

				var item = this.elementTree.add("node");
				item.image = File(pack.directory+"/icons/checkbox_"+(item.selected?"":"un")+"selected.png");
				item.text = layer.name == "" ? "Layer: "+path : layer.name;

				var index = this.indexOf(this.baseSelectedPaths, path);
				if(index != -1){
					item.selected = true;
					this.baseSelectedPaths.splice(index, 1);
				}

				var index = this.indexOf(this.baseOpenPaths, path);
				var expanded = false;
				if(index != -1){
					expanded = true;
					this.baseOpenPaths.splice(index, 1);
				}else if(this.baseOpenPaths.length == 0){
					expanded = true;
				}

				var pageItems = DocUtils.getAllPageItems(doc, layer, true);

				var itemData = { item:item, level:0, path:path, open:expanded, selected:item.selected, isGroup:true, visible:layer.visible, childrenBuilt:false, pageItems:layer.pageItems };
				item.itemData = itemData;

				this.items.push( itemData );
				itemsHere.push( itemData );

				this.createTreeElements(itemData, 0);

				item.expanded = expanded; // Must be done after adding children
			}
			this.itemsByLevel[0] = itemsHere;
		},

		createTreeElements:function(itemData, openLevel){
			if(itemData.level - openLevel > 1 || !itemData.isGroup) return;

			var level = itemData.level + 1;
			if(itemData.childrenBuilt)
			{
				var childItems = itemData.childItems;
				for(var i=0; i<childItems.length; ++i){
					var itemData = childItems[i];
					if(itemData.open) openLevel = level;
					this.createTreeElements(itemData, openLevel);
				}
				return;
			}
			itemData.childrenBuilt = true;


			var pageItems = itemData.pageItems;
			var parent = itemData.item;
			var parentPath = itemData.path + ":";
			var parentVis = itemData.visible;
			var childItems = [];
			itemData.childItems = childItems;

			var j = 0;
			var itemsHere = this.itemsByLevel[level];
			if(itemsHere == null){
				itemsHere = [];
				this.itemsByLevel[level] = itemsHere;
			}
			for(var i=0; i<pageItems.length; ++i){
				var pageItem = pageItems[i];

				var path = parentPath + (i+1).toString();
				var childPath = path + " : ";

				var isLayer = (pageItem.typename == "Layer");
				var isGroup = ((isLayer || pageItem.typename == "GroupItem") && pageItem.pageItems.length > 0);

				var item = parent.add(isGroup ? "node" : "item");
				var index = this.indexOf(this.baseSelectedPaths, path);
				if(index != -1){
					item.selected = true;
					this.baseSelectedPaths.splice(index, 1);
				}
				item.image = File(pack.directory+"/icons/checkbox_"+(item.selected?"":"un")+"selected.png");
				item.text = pageItem.name == "" ? (isLayer ? "Layer: " : "Element: ") + path : pageItem.name ;

				var index = this.indexOf(this.baseOpenPaths, path);
				var expanded = false;
				if(index != -1){
					expanded = isGroup;
					this.baseOpenPaths.splice(index, 1);
				}

				var subItems = isLayer ? DocUtils.getAllPageItems(doc, pageItem, true) : pageItem.pageItems;

				var visible = parentVis && ((isLayer && pageItem.visible) || (!isLayer && !pageItem.hidden));
				var itemData = { item:item, level:level, path:path, open:expanded, selected:item.selected, isGroup:isGroup, visible:visible, childrenBuilt:false, pageItems:subItems };
				item.itemData = itemData;

				childItems.push( itemData );
				this.items.push( itemData );
				itemsHere.push( itemData );

				if(isGroup){
					if(expanded) openLevel = level;
					this.createTreeElements(itemData, openLevel);
					item.expanded = expanded; // Must be done after adding children
				}
			}
		},
		onItemClick:function(item){
			if(item == null || this.ignoreChanges) return;
			var data = item.itemData;
			data.selected = !data.selected;
			item.selected = data.selected;
			item.image = File(pack.directory+"/icons/checkbox_"+(data.selected?"":"un")+"selected.png");
			this.checkSelection();

			this.elementTree.selection = null;
		},
		selectByLevel:function(select, level){
			var rootItems = this.itemsByLevel[0];
			this.ignoreChanges = true;
			for(var i=0; i<rootItems.length; i++){
				this.createTreeElements(rootItems[i], level);
			}
			var list = this.itemsByLevel[level];
			if(list == null) return;

			for(var i=0; i<list.length; i++){
				var item = list[i];
				if(item.selected != select){
					item.selected = select;
					item.item.selected = select;
					item.item.image = File(pack.directory+"/icons/checkbox_"+(select?"":"un")+"selected.png");
				}
			}
			this.ignoreChanges = false;
			this.checkSelection();
		},
		checkSelection:function(){
			if(this.ignoreChanges) return;
			var selectedList = this.baseSelectedPaths.length ? this.baseSelectedPaths.concat([]) : [];
			for(var i=0; i<this.items.length; ++i){
				var item = this.items[i];
				if(item.selected){
					selectedList.push(item.path);
				}
			}
			this.updateSelected(selectedList);
		},
		updateSelected:function(selectedPaths){
			this.selectedPaths = selectedPaths;
			if(this.onSelectedChanged){
				try{
					this.onSelectedChanged();
				}catch(e){
					alert("Error in onSelectedChanged callbcak");
				}
			}
		},

		checkOpened:function(){
			this.openPaths = this.baseOpenPaths.length ? this.baseOpenPaths.concat([]) : [];
			for(var i=0; i<this.items.length; ++i){
				var item = this.items[i];
				if(item.open){
					this.openPaths.push(item.path);
				}
			}
			if(this.onOpenedChanged) this.onOpenedChanged();
		},

		indexOf: function ( array, element ) {
			for(var i=0; i<array.length; i++){
				if(array[i]==element)return i;
			}
			return -1;
		}
	};
	pack.ElementPanel = ElementPanel;
})(smartExport)