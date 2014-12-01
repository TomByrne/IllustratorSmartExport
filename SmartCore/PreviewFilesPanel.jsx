(function(pack){
	function PreviewFilesPanel(container){
		this.init(container);
		return this;
	}

	PreviewFilesPanel.prototype={
	    onPatternChanged:null,

		init:function(container){

			this.list = container.add ('ListBox', [0, 0, 410, 470], 'asd', 
									{numberOfColumns: 4, showHeaders: true, multiselect:true,
									columnTitles: ['', '', '', 'Filename'] }); 

			//container.margins =  [5,5,0,0];
		},
		updateList:function(bundleList){
			this.bundleList = bundleList;
			this.refreshList();
		},
		refreshList:function(){
			var lastArtboard;
			this.list.removeAll();
			var docRef = app.activeDocument;
			var lastNames = [];
			this.flattenedList = [];
			for(var i=0; i<this.bundleList.length; i++){
				var exportBundle = this.bundleList[i];
				for(var j=0; j<exportBundle.items.length; j++){
					var exportItem = exportBundle.items[j];
					var item = this.list.add ('item');
					this.updatedExportItem(exportItem, item);

					var names = exportItem.names;

					if(lastNames[0]!=names[0])item.subItems[0].text = names[0];
					if(lastNames[1]!=names[1])item.subItems[1].text = names[1];

					lastNames = names;
					this.flattenedList.push(exportItem);
				}
			}
		},
		/*setItemState:function(index, state){
			switch(state){
				case "success":
					icon = "tick";
					break;
				case "failed":
					icon = "cross";
					break;
				case "waiting":
					icon = "null";
					break;
			}
			var item = this.list.items[index];
			item.image = File(smartExport.directory+"/icons/"+icon+".png");
		},*/

		indexOf: function ( array, element ) {
			for(var i=0; i<array.length; i++){
				if(array[i]==element)return i;
			}
			return -1;
		},
		updatedExportItem:function(itemData, item){
			var state = itemData.state;

			if(!item){
				item = this.list.items[this.indexOf(this.flattenedList, itemData)];
			}

			var icon;
			switch(state){
				case "success":
					icon = "tick";
					break;
				case "failed":
					icon = "cross";
					break;
				case "waiting":
					icon = "null";
					break;
				case "skipped":
					icon = "downArrow";
					break;
			}
			item.image = File(pack.directory+"/icons/"+icon+".png");
			item.subItems[2].text = itemData.fileName;
		}
	};
	pack.PreviewFilesPanel = PreviewFilesPanel;
})(smartExport)