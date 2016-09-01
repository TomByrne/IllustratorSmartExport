(function(pack){
	function FormatSettings(formatName){
		if(formatName){
			this.format = formatName;
			this.formatRef = pack.getFormat(formatName);
		}
		this.options = {};
		this.patterns = {};
		return this;
	}

	FormatSettings.fromXML = function(xml){
		var ret = new FormatSettings();
		ret.populateWithXML(xml);
		return ret;
	}

	FormatSettings.prototype={
		format:null,
		embedImage:true,
		ungroup:false,
		fontHandling:"none",
		colorSpace:null,
		trimEdges:true,
		innerPadding:false,
		scaling:null,
		directory:null,
		options:null,
		patterns:null,
		preset:null,

		formatRef:null,
		saveOptions:null, // for save/export call, generated at runtime, no need to store

		toXML:function(includePatterns){
			if(includePatterns===undefined)includePatterns = true;
			var ret = new XML('<format/>');
			ret.appendChild( new XML('<format>'+this.format+'</format>') );
			if(this.hasProp("scaling") && this.scaling)ret.appendChild( new XML('<scaling>'+this.scaling+'</scaling>') );
			if(this.hasProp("ungroup"))ret.appendChild( new XML('<ungroup>'+this.ungroup+'</ungroup>') );
			if(this.hasProp("embedImage"))ret.appendChild( new XML('<embedImage>'+this.embedImage+'</embedImage>') );
			if(this.hasProp("trimEdges"))ret.appendChild( new XML('<trimEdges>'+this.trimEdges+'</trimEdges>') );
			if(this.hasProp("innerPadding"))ret.appendChild( new XML('<innerPadding>'+this.innerPadding+'</innerPadding>') );
			if(this.directory)ret.appendChild( new XML('<directory>'+this.directory+'</directory>') );
			if(this.fontHandling && this.fontHandling!="none")ret.appendChild( new XML('<fontHandling>'+this.fontHandling+'</fontHandling>') );
			if(this.colorSpace && this.colorSpace!="none")ret.appendChild( new XML('<colorSpace>'+this.colorSpace+'</colorSpace>') );
			if(this.preset)ret.appendChild( new XML('<preset>'+this.preset+'</preset>') );

			if(includePatterns){
				var patterns = new XML('<patterns/>');
				for(var i in this.patterns){
					patterns.appendChild( new XML('<'+i+'>'+this.xmlEncode(this.patterns[i])+'</'+i+'>') );
				}
				ret.appendChild(patterns);
			}

			var options = new XML('<options/>');
			for(var i in this.options){
				options.appendChild( new XML('<'+i+'>'+this.options[i]+'</'+i+'>') );
			}
			ret.appendChild(options);
			return ret;
		},
		xmlEncode:function(str){
			str = str.split("&").join("&amp;");
			str = str.split("<").join("&lt;");
			str = str.split(">").join("&gt;");
			str = str.split('"').join("&quot;");
			str = str.split("'").join("&apos;");
			return str;
		},

		parseObjectNode:function(parentNode){
			var children = parentNode.children();
			var ret = {};
			for(var i=0; i<children.length(); i++){
				var node = children[i];
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
				ret[node.localName()] = value;
			}
			return ret;
		},

		populateWithXML:function(xml){
			this.format		    = xml.format.toString();
			this.ungroup		= xml.ungroup == "true";
			this.embedImage	    = xml.embedImage == "true";
			this.fontHandling   = xml.fontHandling.toString() || "none";
			this.trimEdges	    = xml.trimEdges == "true";
			this.innerPadding   = xml.innerPadding == "true";
			this.scaling 		= parseFloat( xml.scaling.toString().replace( /\% /, '' )) || 100;
			this.directory 		= xml.directory.toString();
			this.colorSpace	    = xml.colorSpace.toString();
			this.preset	        = xml.preset.toString();

			this.patterns = this.parseObjectNode(xml.patterns);
			this.options = this.parseObjectNode(xml.options);
			
			this.formatRef = pack.getFormat(this.format);
			if(!this.formatRef){
				alert("Unrecognised format: "+this.format);
			}else if(!this.hasProp("scaling")){
				this.scaling 	= null;
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