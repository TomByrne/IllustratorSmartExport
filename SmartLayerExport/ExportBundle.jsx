(function(pack){
	function ExportBundle(prepareHandler, cleanupHandler){
		this.init(prepareHandler, cleanupHandler);
		return this;
	}

	ExportBundle.prototype={
		items:null,
		prepareHandler:null,
		cleanupHandler:null,

		init:function(prepareHandler, cleanupHandler){
			this.items = [];
			this.prepareHandler = prepareHandler;
			this.cleanupHandler = cleanupHandler;
		}
	};
	pack.ExportBundle = ExportBundle;
})(smartExport)