(function(pack){
	function ExportSettings(){
		return this;
	}

	ExportSettings.fromXML = function(xml){
		var ret = new pack.ExportSettings();
		ret.populateWithXML(xml);
		return ret;
	}

	ExportSettings.prototype={
		type:ExportSettings,

		artboardPattern:"<ArtboardName>.<Ext>",
		layerPattern:"<ArtboardName>_<LayerName>.<Ext>",
		directory:"",
		scaling:"",

		formats:[],

		artboardAll:true,
		artboardInd:[],
		layerAll:true,
		layerInd:[],
		exportArtboards:false,
		ignoreWarnings:false,


		toXML:function(includePatterns, includeGeneralSettings, includeFormatSettings, includeArtboards, includeLayers){
			if(includePatterns===undefined)includePatterns = true;
			if(includeGeneralSettings===undefined)includeGeneralSettings = true;
			if(includeFormatSettings===undefined)includeFormatSettings = true;
			if(includeArtboards===undefined)includeArtboards = true;
			if(includeLayers===undefined)includeLayers = true;

			var ret = new XML( '<prefs></prefs>' );

			if(includePatterns){
				ret.appendChild( new XML('<artboardPattern>'+this.xmlEncode(this.artboardPattern)+'</artboardPattern>') );
				ret.appendChild( new XML('<layerPattern>'+this.xmlEncode(this.layerPattern)+'</layerPattern>') );
			}
			if(includeGeneralSettings){
				ret.appendChild( new XML('<directory>'+this.directory+'</directory>') );
				ret.appendChild( new XML('<scaling>'+this.scaling+'</scaling>') );
				ret.appendChild( new XML('<exportArtboards>'+this.exportArtboards+'</exportArtboards>') );
				ret.appendChild( new XML('<ignoreWarnings>'+this.ignoreWarnings+'</ignoreWarnings>') );
			}

			if(includeFormatSettings){
				var formats = new XML('<formats/>');
				for(var i=0; i<this.formats.length; ++i){
					var format = this.formats[i];
					formats.appendChild(format.toXML());
				}
				ret.appendChild( formats );
			}

			if(includeArtboards){
				if(!this.artboardAll && this.artboardInd.length)ret.appendChild( new XML('<artboardInd>'+this.artboardInd+'</artboardInd>') );
				else ret.appendChild( new XML('<artboardAll>'+this.artboardAll+'</artboardAll>') );
			}
			
			if(includeLayers){
				if(!this.layerAll && this.layerInd.length)ret.appendChild( new XML('<layerInd>'+this.layerInd+'</layerInd>') );
				else ret.appendChild( new XML('<layerAll>'+this.layerAll+'</layerAll>') );
			}

			return ret;
		},

		populateWithXML:function(xml){
			this.migrateXML(xml);
			
			if(xml.artboardPattern.length())this.artboardPattern = xml.artboardPattern.toString() || this.DEFAULT_ARTBOARD_PATTERN;
			if(xml.layerPattern.length())this.layerPattern	= xml.layerPattern.toString() || this.DEFAULT_LAYER_PATTERN;
			if(xml.directory.length())this.directory		= xml.directory.toString();
			if(xml.scaling.length())this.scaling 		= parseFloat( xml.scaling.toString().replace( /\% /, '' ));

			var formatNodes = xml.formats.format;
			if(formatNodes.length()){
				this.formats = [];
				for(var i=0; i<formatNodes.length(); i++){
					var format = pack.FormatSettings.fromXML(formatNodes[i]);
					if(format.formatRef)this.formats.push(format);
				}
			}
			if(!this.formats.length){
				this.formats.push(new pack.FormatSettings("PNG 24"));
			}

			if(xml.artboardAll.length())this.artboardAll	= xml.artboardAll == "true";
			if(xml.layerAll.length())this.layerAll		= xml.layerAll == "true";
			if(xml.exportArtboards.length())this.exportArtboards = xml.exportArtboards == "true";
			if(xml.ignoreWarnings.length())this.ignoreWarnings = xml.ignoreWarnings == "true";

			if(xml.artboardInd.length()){
				this.artboardInd	= xml.artboardInd.toString();
				if(this.artboardInd.length){
					this.artboardInd = this.artboardInd.split(",")
					var array = [];
					for(var i=0; i<this.artboardInd.length; ++i){
						array[i] = parseInt(this.artboardInd[i]);
					}
					this.artboardInd = array;
				}else if(xml.artboardAll.length()==0){
					this.artboardAll = true;
				}
			}

			if(xml.layerInd.length()){
				this.layerInd		= xml.layerInd.toString();
				if(this.layerInd.length){
					this.layerInd = this.layerInd.split(",")
					var array = [];
					for(var i=0; i<this.layerInd.length; ++i){
						array[i] = parseInt(this.layerInd[i]);
					}
					this.layerInd = array;
				}else if(xml.layerAll.length()==0){
					this.layerAll = true;
				}
			}
			
			if ( ! xml.scaling || xml.scaling == '' ) {
			   this.scaling = 100;
			}
		},

		updateXMLNames:function(node){
			if(node.nodeKind()!="element")return;
			var name = node.name().toString();
			if(name.indexOf("nyt_")==0)node.setName(name.substr(4));
			for(var i=0; i<node.children().length(); ++i){
				this.updateXMLNames(node.children()[i]);
			}
		},


		migrateXML:function(node){
			this.updateXMLNames(node);
			var prefix = node.prefix;
			var suffix = node.suffix;
			if(prefix.length() || suffix.length()){
				node.artboardPattern = node.prefix+"<ArtboardName>"+node.suffix+".<Ext>";
				node.layerPattern = node.prefix+"<ArtboardName>_<LayerName>"+node.suffix+".<Ext>";
				delete node.prefix;
				delete node.suffix;
			}
			var base_path = node.base_path;
			if(base_path.length()){
				node.directory = base_path.toString();
				delete node.base_path;
			}
			var artboards = node.artboards;
			if(artboards.length()){
				var artboards = artboards.toString();
				if(artboards=="all"){
					node.artboardAll = "true";
				}else if(parseInt(artboards).toString()==artboards){
					node.artboardInd = artboards;
				}
				delete node.artboards;
			}
			var layers = node.layers;
			if(layers.length()){
				var layers = layers.toString();
				if(layers=="all"){
					node.layerAll = "true";
				}else if(parseInt(layers).toString()==layers){
					node.layerInd = layers;
				}
				delete node.layers;
			}
			var format = node.format;
			if(format.length()){

				var formats = new XML('<formats/>');
				var formatNode = new XML('<format/>');

				formatNode.format = node.format;
				formatNode.transparency = node.transparency;
				formatNode.embedImage = node.embedImage;
				formatNode.embedFont = node.embedFont;
				formatNode.trimEdges = node.trimEdges;
				formatNode.innerPadding = node.innerPadding;
				formatNode.scaling = "";

				formats.appendChild(formatNode);
				node.appendChild(formats);

				delete node.format;
				delete node.transparency;
				delete node.embedImage;
				delete node.embedFont;
				delete node.trimEdges;
				delete node.innerPadding;

			}
		},
		xmlEncode:function(str){
			str = str.split("&").join("&amp;");
			str = str.split("<").join("&lt;");
			str = str.split(">").join("&gt;");
			str = str.split('"').join("&quot;");
			str = str.split("'").join("&apos;");
			return str;
		}
	};
	pack.ExportSettings = ExportSettings;
})(smartExport)