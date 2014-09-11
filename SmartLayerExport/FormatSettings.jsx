(function(pack){
	function FormatSettings(formatName){
		if(formatName){
			this.format = formatName;
			this.formatRef = pack.getFormat(formatName);
		}
		return this;
	}

	FormatSettings.fromXML = function(xml){
		var ret = new FormatSettings();
		ret.populateWithXML(xml);
		return ret;
	}

	FormatSettings.prototype={
		format:null,
		transparency:true,
		embedImage:true,
		fontHandling:"none",
		trimEdges:true,
		innerPadding:false,
		scaling:null,
		directory:null,
		options:{},

		formatRef:null,

		toXML:function(){
			var ret = new XML('<format/>');
			ret.appendChild( new XML('<format>'+this.format+'</format>') );
			if(this.hasProp("scaling") && this.scaling)ret.appendChild( new XML('<scaling>'+this.scaling+'</scaling>') );
			if(this.hasProp("transparency"))ret.appendChild( new XML('<transparency>'+this.transparency+'</transparency>') );
			if(this.hasProp("embedImage"))ret.appendChild( new XML('<embedImage>'+this.embedImage+'</embedImage>') );
			if(this.hasProp("trimEdges"))ret.appendChild( new XML('<trimEdges>'+this.trimEdges+'</trimEdges>') );
			if(this.hasProp("innerPadding"))ret.appendChild( new XML('<innerPadding>'+this.innerPadding+'</innerPadding>') );
			if(this.directory)ret.appendChild( new XML('<directory>'+this.directory+'</directory>') );
			if(this.fontHandling && this.fontHandling!="none")ret.appendChild( new XML('<fontHandling>'+this.fontHandling+'</fontHandling>') );

			var options = new XML('<options/>');
			for(var i in this.options){
				options.appendChild( new XML('<'+i+'>'+this.options[i]+'</'+i+'>') );
			}
			ret.appendChild(options);
			return ret;
		},

		populateWithXML:function(xml){
			this.format		    = xml.format.toString();
			this.transparency	= xml.transparency == "true";
			this.embedImage	    = xml.embedImage == "true";
			this.fontHandling   = xml.fontHandling.toString() || "none";
			this.trimEdges	    = xml.trimEdges == "true";
			this.innerPadding   = xml.innerPadding == "true";
			this.scaling 		= parseFloat( xml.scaling.toString().replace( /\% /, '' ));
			this.directory 		= xml.directory.toString();

			var options = xml.options.children();
			this.options = {};
			for(var i=0; i<options.length(); i++){
				var node = options[i];
				var value = node.text().toString();
				if(value=="true"){
					value = true;
				}else if(value=="false"){
					value = false;
				}else{
					var num = parseFloat(value);
					if(num.toString()==value){
						value = num;
					}
				}
				this.options[node.localName()] = value;
			}

			this.formatRef = pack.getFormat(this.format);
			if(!this.formatRef){
				alert("Unrecognised format: "+this.format);
			}
		},

		hasProp:function(prop){
			for(var i=0; i<this.formatRef.props.length; i++){
				if(this.formatRef.props[i] == prop){
					return true;
				}
			}
			return false;
		}
	};
	pack.FormatSettings = FormatSettings;
})(smartExport)