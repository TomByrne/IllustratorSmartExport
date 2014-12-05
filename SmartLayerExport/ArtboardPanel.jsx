(function(pack){
	function ArtboardPanel(container, selectAll, selectedIndices, wholeArtboardMode){
		this.init(container, selectAll, selectedIndices, wholeArtboardMode);
		return this;
	}

	ArtboardPanel.prototype={
	    onWholeArtboardModeChanged:null,
	    onSelectedChanged:null,

		init:function(container, selectAll, selectedIndices, wholeArtboardMode){
			this.selectAll = selectAll;
			this.selectedIndices = selectedIndices;

			var scopedThis = this;
			var column = container.add('group', undefined, '')
			column.orientation = 'column';
			column.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP];

			this.artboardList = column.add ('ListBox', [0, 0, 200, 380], '', 
									{numberOfColumns: 3, showHeaders: false, multiselect:true,
									columnTitles: ['', '', 'Artboard'] });
			this.artboardList.onChange = function(){
				scopedThis.checkSelection();
			}
			
			var docRef = app.activeDocument;
			for(var i=0; i<docRef.artboards.length; ++i){
				var artboard = docRef.artboards[i];
				var item = this.artboardList.add("item");
				item.selected = this.indexOf(selectedIndices, i)!=-1;
				item.image = File(pack.directory+"/icons/checkbox_"+(item.selected?"":"un")+"selected.png");
				item.subItems[0].text = i+1;
				item.subItems[1].text = artboard.name;
			};


			this.selectArtboards = column.add("checkbox", undefined, "Select/Deselect All Artboards");
			this.selectArtboards.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP];
			this.selectArtboards.onClick = function(){
				scopedThis.doArtboardSelect(scopedThis.selectArtboards.value);
			}
			if(selectAll){
				this.selectArtboards.value = true;
				this.doArtboardSelect(true);
			}

			this.exportArtboardsCheckBox = column.add("checkbox", undefined, "Export Artboard Images");
			this.exportArtboardsCheckBox.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP];
			this.exportArtboardsCheckBox.value = wholeArtboardMode;
			this.exportArtboardsCheckBox.onClick = function() {
				scopedThis.wholeArtboardMode  = scopedThis.exportArtboardsCheckBox.value;
				if(scopedThis.onWholeArtboardModeChanged)scopedThis.onWholeArtboardModeChanged();
			};

			var key;
			if($.os.toLowerCase().indexOf("mac")!=-1){
				key = "CMD";
			}else{
				key = "CTRL";
			}
			var tip = column.add ('statictext', undefined, key+"+Click to select multiple in lists"); 
			tip.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP];
		},
		doArtboardSelect:function(select){
			this.ignoreChanges = true;
			var selectedList = [];
			for(var i=0; i<this.artboardList.items.length; ++i){
				var item = this.artboardList.items[i];
				item.selected = select;
				item.image = File(pack.directory+"/icons/checkbox_"+(select?"":"un")+"selected.png");
				if(select)selectedList.push(i);
			}
			this.ignoreChanges = false;
			this.updateSelected(select, selectedList);
		},
		checkSelection:function(select){
			if(this.ignoreChanges)return;
			var selected = 0;
			var selectedList = [];
			for(var i=0; i<this.artboardList.items.length; ++i){
				var item = this.artboardList.items[i];
				item.image = File(pack.directory+"/icons/checkbox_"+(item.selected?"":"un")+"selected.png");
				if(item.selected){
					++selected;
					selectedList.push(i);
				}
			}
			this.selectArtboards.value = (selected==this.artboardList.items.length);
			this.updateSelected(this.selectArtboards.value, selectedList);
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
	pack.ArtboardPanel = ArtboardPanel;
})(smartExport)