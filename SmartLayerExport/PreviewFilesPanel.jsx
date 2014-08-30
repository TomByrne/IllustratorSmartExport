(function(pack){
	function PreviewFilesPanel(container){
		this.init(container);
		return this;
	}

	PreviewFilesPanel.prototype={
	    onPatternChanged:null,

		init:function(container){

			this.list = container.add ('ListBox', [0, 0, 465, 470], 'asd', 
									{numberOfColumns: 4, showHeaders: true, multiselect:true,
									columnTitles: ['', 'Artboard', 'Layer', 'Filename'] }); 

			//container.margins =  [5,5,0,0];
		},
		updateList:function(data){
			this.data = data;
			this.refreshList();
		},
		refreshList:function(){
			var lastArtboard;
			this.list.removeAll();
			var docRef = app.activeDocument;
			for(var i=0; i<this.data.length; i++){
				var itemData = this.data[i];
				var item = this.list.add ('item');
				this.updatedExportItem(itemData, item);

				var artboard = itemData.artboard;
				var layer = itemData.layer;
				if(artboard!=lastArtboard){
					lastArtboard = artboard;
					item.subItems[0].text = docRef.artboards[artboard].name;
				}
				if(layer!=null){
					item.subItems[1].text = docRef.layers[layer].name;
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
				item = this.list.items[this.indexOf(this.data, itemData)];
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