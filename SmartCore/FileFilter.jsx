(function(pack){
	function FileFilter(fileTypes, optimistic){
		this.init(fileTypes, optimistic);
		return this;
	}



	FileFilter.prototype={
	    onChange:null,

		init:function(fileTypes, optimistic){

			this.fileTypes = fileTypes;
			this.optimistic = optimistic;

			this.filterStr = "";
			this.allowedExt = {};
			for(var i=0; i<fileTypes.length; i++){
				var type = fileTypes[i];
				var name = type.name;
				var ext = type.ext;
				if(this.filterStr.length)this.filterStr += ";";
				this.filterStr += name+":*."+ext;
				this.allowedExt[ext] = true;
				if(ext=="*"){
					this.allAllowed = true;
				}
			}
		},

		getFilter : function(){
			if(Folder.fs=="Windows"){
				return this.filterStr;
			}else{
				return closure(this, this.doFilter, [], true);
			}
		},

		doFilter : function(file){
			if(this.allAllowed)return true;
			if(file instanceof Folder) return true;

			var filename = file.name;
			var extIndex = filename.lastIndexOf(".");
			if(extIndex==-1){
				// no extension
				return this.optimistic;
			}else{
				var ext = filename.substr(extIndex+1);
				return this.allowedExt[ext];
			}
		}
	};
	pack.FileFilter = FileFilter;
})(smartExport)