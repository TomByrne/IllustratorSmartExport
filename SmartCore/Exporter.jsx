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
		cancelled:false,
		running:false,

		checkValid: function(bundleList, exportSettings, directory) {
			this.bundleList = bundleList;
			this.exportSettings = exportSettings;
			this.directory = directory;
			this.cancelled = false;
			this.running = true;

			this.num_exported = 0;
			this.layerItemWarned = false;

			this.num_to_export = 0;
			for (var x = 0; x < this.bundleList.length; x++ ) {
				this.num_to_export += this.bundleList[x].items.length;
			}

			if(exportSettings.formats.length == 0){
				this.running = false;
				alert('No exports settings added.\n\nPlease use the Export Settings tab to add export settings.');
				return false;
			}else{
				for (var x = 0; x < exportSettings.formats.length; x++ ) {
					var formatSettings = exportSettings.formats[x];
					formatSettings.saveOptions = formatSettings.formatRef.getOptions(formatSettings);
				}
			}


			if(!this.num_to_export){
				this.running = false;
				alert('No items selected for export.\n\nPlease use Artboards / Layers / Elements / Symbols tabs to select which items to export.');
				return false;
			}

			if(!directory){
				this.running = false;
				alert('Please select select a destination');
				return false;
			}
			if(!Folder(directory).exists){
				if(confirm("Output directory doesn't exist.\nCreate it now?")){
					Folder(directory).create();
				}else{
					this.doFinish(false);
					return false;
				}
			}
			return true;
		},

		doRun:function(){
			var docRef = app.activeDocument;
			var failed = [];
			for (var x = 0; x < this.bundleList.length; x++ ) {
				var bundle = this.bundleList[x];
				var items = bundle.items;
				if(this.cancelled)return this.doFinish(false);

				var pendingItems = false;
				for(var i=0; i<items.length; i++){
					if(this.cancelled)return this.doFinish(false);

					var item = items[i];
					if(item.state == "invalid" || item.state=="success"){
						continue;
					}
					pendingItems = true;
					break;
				}
				if(!pendingItems)continue;

				try{
					var i=0; // in case error is thrown
					var copyDoc = bundle.prepareHandler(docRef, this.exportSettings, bundle);
					var isWin = ($.os.indexOf("Win")!=-1);

					for(var i=0; i<items.length; i++){
						if(this.cancelled)return this.doFinish(false);

						var item = items[i];
						if(item.state == "invalid" || item.state=="success"){
							continue;
						}
						item.state = "processing";
						this.updatedExportItem(item);

						if(copyDoc=="skipped"){
							item.state = "skipped";

						}else if(!copyDoc || copyDoc=="failed"){
							failed.push(item);
							item.state = "failed";

						}else{
							try{
								var formatSettings = item.formatSettings;
								var dir;
								if(formatSettings.directory && formatSettings.directory.length){

									if((this.exportSettings.directory == null || this.exportSettings.directory == "") &&
										((isWin && formatSettings.directory.charAt(1)==":") || (!isWin && formatSettings.directory.charAt(1)=="/"))){

										dir = formatSettings.directory;
									}else{
										dir = this.directory + (formatSettings.directory?"/"+formatSettings.directory:"");
									}
								}else{
									dir = this.directory;
								}
								var dirObj = Folder(dir);
								if(!dirObj.exists){
									dirObj.create();
								}
								var fileName = dir + "/" + item.fileName;
								formatSettings.formatRef.saveFile(copyDoc, fileName, item.formatSettings.saveOptions );
								item.state = "success";

							}catch(e){
								alert("Save Failed: "+e);
								failed.push(item);
								item.state = "failed";
							}
						}
						this.updateProgress(++this.num_exported, this.num_to_export);
						this.updatedExportItem(item);
						//$.sleep(40) // Allows UI update;
					}

					if(copyDoc/* && copyDoc!="skipped" && copyDoc!="failed"*/){
						if(bundle.cleanupHandler)bundle.cleanupHandler(docRef, this.exportSettings, bundle);
					}
				}catch(e){
					alert(e);
					try{
						if(bundle.cleanupHandler)bundle.cleanupHandler(docRef, this.exportSettings, bundle);
					}catch(e){}

					for(i; i<items.length; i++){
						var item = items[i];
						item.state = "failed";
						this.updatedExportItem(item);
						failed.push(item);
					}
					this.num_exported += (items.length - i);
					this.updateProgress(this.num_exported, this.num_to_export);
				}
			}
			if(failed.length){
				var msg = "Exports failed:";
				var n = Math.min(20, failed.length);
				for(var i=0; i<n; ++i){
					var item = failed[i];
					msg += "\n - "+item.fileName;
				}
				if(failed.length > n) msg += "\nPlus "+(failed.length - n)+" more";
				msg += "\n\nTry again?";
				if(confirm(msg)){
					return this.doRun();
				}else{
					return this.doFinish(false);
				}
			}else{
				return this.doFinish(true);
			}
		},

		doFinish: function(success){
			this.running = false;
			if(this.onExportFinished){
				if(success){
					this.onExportFinished(true, null);
				}else{
					this.onExportFinished(null, true);
				}
			}
			return success;
		},

		cancel:function(){
			this.cancelled = true;
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