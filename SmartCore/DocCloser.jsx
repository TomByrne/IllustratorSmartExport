(function(pack){
	var DocCloser = {};

	DocCloser.setMainDoc = function(doc){
		DocCloser.mainDoc = doc;
	}

	DocCloser.closePending = function(){
		//alert("close: "+DocCloser.pendingClose);
		if(DocCloser.pendingClose){
			DocCloser.pendingClose.close(SaveOptions.DONOTSAVECHANGES);
			DocCloser.pendingClose = null;
		}
	}

	DocCloser.closeDocument = function(doc){
		DocCloser.closePending();
		DocCloser.pendingClose = doc;
		app.activeDocument = DocCloser.mainDoc;
	}

	pack.DocCloser = DocCloser;

})(smartExport)