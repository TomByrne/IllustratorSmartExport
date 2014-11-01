(function(pack){
	function ExportItem(formatSettings, fileName){
		this.init(formatSettings, fileName);
		return this;
	}

	ExportItem.prototype={

		state:"waiting",
		formatSettings:null,
		fileName:null,
		names:null,

		init:function(formatSettings, fileName){
			this.names = [];
			this.formatSettings = formatSettings;
			this.fileName = fileName;
		}
	};
	pack.ExportItem = ExportItem;
})(smartExport)