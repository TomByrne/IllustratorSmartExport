(function(pack){
	function SymbolPanel(container, selectAll, selectedNames){
		this.init(container, selectAll, selectedNames);
		return this;
	}

	SymbolPanel.prototype={
	    onSelectedChanged:null,

		init:function(container, selectAll, selectedNames){
			this.selectAll = selectAll;
			this.selectedNames = selectedNames;

			var scopedThis = this;
			var column = container.add('group', undefined, '')
			column.orientation = 'column';
			column.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP];

			this.listbox = column.add ('ListBox', [0, 0, 630, 450], '', 
									{numberOfColumns: 3, showHeaders: false, multiselect:true,
									columnTitles: ['', '', 'Symbol'] });
			this.listbox.onChange = function(){
				scopedThis.checkSelection();
			}
			
			var docRef = app.activeDocument;
			for(var i=0; i<docRef.symbols.length; ++i){
				var symbol = docRef.symbols[i];
				var item = this.listbox.add("item");
				item.selected = this.indexOf(selectedNames, symbol.name)!=-1;
				item.image = File(pack.directory+"/icons/checkbox_"+(item.selected?"":"un")+"selected.png");
				item.subItems[0].text = i+1;
				item.subItems[1].text = symbol.name;
			};


			this.checkbox = column.add("checkbox", undefined, "Select/Deselect All Symbols");
			this.checkbox.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP];
			this.checkbox.onClick = function(){
				scopedThis.doSymbolSelect(scopedThis.checkbox.value);
			}
			if(selectAll){
				this.checkbox.value = true;
				this.doSymbolSelect(true);
			}
		},
		doSymbolSelect:function(select){
			var docRef = app.activeDocument;
			this.ignoreChanges = true;
			var selectedNames = [];
			for(var i=0; i<this.listbox.items.length; ++i){
				var item = this.listbox.items[i];
				var symbol = docRef.symbols[i];
				item.selected = select;
				item.image = File(pack.directory+"/icons/checkbox_"+(select?"":"un")+"selected.png");
				if(select)selectedNames.push(symbol.name);
			}
			this.ignoreChanges = false;
			this.updateSelected(select, selectedNames);
		},
		checkSelection:function(select){
			if(this.ignoreChanges)return;
			var docRef = app.activeDocument;
			var selected = 0;
			var selectedNames = [];
			for(var i=0; i<this.listbox.items.length; ++i){
				var symbol = docRef.symbols[i];
				var item = this.listbox.items[i];
				item.image = File(pack.directory+"/icons/checkbox_"+(item.selected?"":"un")+"selected.png");
				if(item.selected){
					++selected;
					selectedNames.push(symbol.name);
				}
			}
			this.checkbox.value = (selected==this.listbox.items.length);
			this.updateSelected(this.checkbox.value, selectedNames);
		},
		updateSelected:function(selectAll, selectedNames){
			this.selectAll = selectAll;
			this.selectedNames = selectedNames;
			if(this.onSelectedChanged)this.onSelectedChanged();
		},

		indexOf: function ( array, element ) {
			for(var i=0; i<array.length; i++){
				if(array[i]==element)return i;
			}
			return -1;
		}
	};
	pack.SymbolPanel = SymbolPanel;
})(smartExport)