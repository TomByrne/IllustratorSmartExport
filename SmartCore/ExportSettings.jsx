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
		DEFAULT_ARTBOARD_PATTERN:"<ArtboardName>.<Ext>",
		DEFAULT_LAYER_PATTERN:"<ArtboardName>_<LayerName>.<Ext>",
		DEFAULT_ELEMENT_PATTERN:"<ArtboardName>_<ElementName>.<Ext>",
		DEFAULT_SYMBOL_PATTERN:"<SymbolName>.<Ext>",

		type:ExportSettings,

		selectedTab:0,
		directory:"",
		formats:[],

		artboardAll:false,
		artboardInd:[],

		layerAll:false,
		layerInd:[],
		artboardAll_layers:true,
		artboardInd_layers:[],

		symbolAll:false,
		symbolNames:[],

		elementPaths:[], // e.g. ["layerInd : rootElemInd : childElemInd", "layerInd : rootElemInd : childElemInd"]
		elementOpenPaths:[], // e.g. ["layerInd : rootElemInd : childElemInd", "layerInd : rootElemInd : childElemInd"]
		artboardAll_elements:true,
		artboardInd_elements:[],

		//exportArtboards:false,
		ignoreWarnings:false,
		fontHandling:"none",

		ignoreOutOfBounds_layers:true,
		ignoreOutOfBounds_elements:true,


		toXML:function(includePatterns, includeGeneralSettings, includeFormatSettings, includeArtboards, includeLayers, includeElements, includeSymbols){
			if(includeGeneralSettings===undefined)includeGeneralSettings = true;
			if(includeFormatSettings===undefined)includeFormatSettings = true;
			if(includeArtboards===undefined)includeArtboards = true;
			if(includeLayers===undefined)includeLayers = true;
			if(includeElements===undefined)includeElements = true;
			if(includeSymbols===undefined)includeSymbols = true;

			var ret = new XML( '<prefs></prefs>' );

			/*if(includePatterns){
				ret.appendChild( new XML('<artboardPattern>'+this.xmlEncode(this.artboardPattern)+'</artboardPattern>') );
				ret.appendChild( new XML('<layerPattern>'+this.xmlEncode(this.layerPattern)+'</layerPattern>') );
			}*/
			if(includeGeneralSettings){
				ret.appendChild( new XML('<selectedTab>'+this.selectedTab+'</selectedTab>') );
				ret.appendChild( new XML('<directory>'+this.directory+'</directory>') );
				ret.appendChild( new XML('<ignoreWarnings>'+this.ignoreWarnings+'</ignoreWarnings>') );
				ret.appendChild( new XML('<ignoreOutOfBounds_layers>'+this.ignoreOutOfBounds_layers+'</ignoreOutOfBounds_layers>') );
				ret.appendChild( new XML('<ignoreOutOfBounds_elements>'+this.ignoreOutOfBounds_elements+'</ignoreOutOfBounds_elements>') );
			}

			if(includeFormatSettings){
				var formats = new XML('<formats/>');
				for(var i=0; i<this.formats.length; ++i){
					var format = this.formats[i];
					formats.appendChild(format.toXML(includePatterns));
				}
				ret.appendChild( formats );
			}

			if(includeArtboards){
				if(!this.artboardAll && this.artboardInd.length) ret.appendChild( new XML('<artboardInd>'+this.artboardInd+'</artboardInd>') );
				else ret.appendChild( new XML('<artboardAll>'+this.artboardAll+'</artboardAll>') );
			}
			
			if(includeLayers){
				if(!this.layerAll && this.layerInd.length) ret.appendChild( new XML('<layerInd>'+this.layerInd+'</layerInd>') );
				else ret.appendChild( new XML('<layerAll>'+this.layerAll+'</layerAll>') );
				if(!this.artboardAll_layers && this.artboardInd_layers.length) ret.appendChild( new XML('<artboardInd_layers>'+this.artboardInd_layers+'</artboardInd_layers>') );
				else ret.appendChild( new XML('<artboardAll_layers>'+this.artboardAll_layers+'</artboardAll_layers>') );
			}
			
			if(includeElements){
				if(this.elementPaths.length){
					ret.appendChild( new XML('<elementPaths>'+this.elementPaths.join(",")+'</elementPaths>') );
				}
				if(this.elementOpenPaths.length){
					ret.appendChild( new XML('<elementOpenPaths>'+this.elementOpenPaths.join(",")+'</elementOpenPaths>') );
				}
				if(!this.artboardAll_elements && this.artboardInd_elements.length) ret.appendChild( new XML('<artboardInd_elements>'+this.artboardInd_elements+'</artboardInd_elements>') );
				else ret.appendChild( new XML('<artboardAll_elements>'+this.artboardAll_elements+'</artboardAll_elements>') );
			}
			
			if(includeSymbols){
				if(!this.symbolAll && this.symbolNames.length)ret.appendChild( new XML('<symbolNames>'+this.symbolNames+'</symbolNames>') );
				else ret.appendChild( new XML('<symbolAll>'+this.symbolAll+'</symbolAll>') );
			}

			return ret;
		},

		addNewFormat:function(formatSettings){
			this.formats.push(formatSettings);

			var defaultPatterns = {};
			var scaling;
			for(var i=this.formats.length-1; i>=0; --i){
				var format = this.formats[i];
				if(format.scaling)scaling = format.scaling;
				if(format==formatSettings)continue;
				for(var j in format.patterns){
					if(!defaultPatterns[j])defaultPatterns[j] = format.patterns[j];
				}
			}
			if(formatSettings.hasProp("scaling")){
				formatSettings.scaling = scaling || 100;
			}else{
				formatSettings.scaling = null;
			}
			if(!defaultPatterns.artboard) defaultPatterns.artboard = this.DEFAULT_ARTBOARD_PATTERN;
			if(!defaultPatterns.layer) defaultPatterns.layer = this.DEFAULT_LAYER_PATTERN;
			if(!defaultPatterns.element) defaultPatterns.element = this.DEFAULT_ELEMENT_PATTERN;
			if(!defaultPatterns.symbol) defaultPatterns.symbol = this.DEFAULT_SYMBOL_PATTERN;

			for(var j in defaultPatterns){
				if(!formatSettings.patterns[j]) formatSettings.patterns[j] = defaultPatterns[j];
			}
		},

		populateWithXML:function(xml){
			this.migrateXML(xml);
			
			//if(xml.artboardPattern.length())this.artboardPattern = xml.artboardPattern.toString() || this.DEFAULT_ARTBOARD_PATTERN;
			//if(xml.layerPattern.length())this.layerPattern	= xml.layerPattern.toString() || this.DEFAULT_LAYER_PATTERN;
			if(xml.selectedTab.length())this.selectedTab	= parseInt(xml.selectedTab.toString());
			if(xml.directory.length())this.directory		= xml.directory.toString();
			if(xml.scaling.length())this.scaling 			= parseFloat( xml.scaling.toString().replace( /\% /, '' ));

			var defaultPatterns = {artboard:this.DEFAULT_ARTBOARD_PATTERN, layer:this.DEFAULT_LAYER_PATTERN, element:this.DEFAULT_ELEMENT_PATTERN, symbol:this.DEFAULT_SYMBOL_PATTERN};
			var formatNodes = xml.formats.format;
			if(formatNodes.length()){
				this.formats = [];
				for(var i=0; i<formatNodes.length(); i++){
					var format = pack.FormatSettings.fromXML(formatNodes[i]);
					if(format.formatRef)this.formats.push(format);
					for(var j in format.patterns){
						defaultPatterns[j] = format.patterns[j];
					}
					for(var j in defaultPatterns){
						if(!format.patterns[j])format.patterns[j] = defaultPatterns[j];
					}
				}
			}
			if(!this.formats.length){
				this.addNewFormat(new pack.FormatSettings("PNG 24"));
			}

			if(xml.artboardAll.length())this.artboardAll	= xml.artboardAll == "true";
			if(xml.layerAll.length())this.layerAll		= xml.layerAll == "true";
			if(xml.symbolAll.length())this.symbolAll		= xml.symbolAll == "true";
			//if(xml.exportArtboards.length())this.exportArtboards = xml.exportArtboards == "true";
			if(xml.ignoreWarnings.length())this.ignoreWarnings = xml.ignoreWarnings == "true";

			if(xml.ignoreOutOfBounds.length()){
				var ignoreOutOfBounds = xml.ignoreOutOfBounds != "false";
				this.ignoreOutOfBounds_layers = ignoreOutOfBounds;
				this.ignoreOutOfBounds_elements = ignoreOutOfBounds;
			}
			if(xml.ignoreOutOfBounds_layers.length()) this.ignoreOutOfBounds_layers = xml.ignoreOutOfBounds_layers != "false";
			if(xml.ignoreOutOfBounds_elements.length()) this.ignoreOutOfBounds_elements = xml.ignoreOutOfBounds_elements != "false";

			 // ARTBOARDS
			if(xml.artboardInd.length()){
				this.artboardInd	= xml.artboardInd.toString();
				if(this.artboardInd.length){
					this.artboardInd = this.artboardInd.split(",");
					var array = [];
					for(var i=0; i<this.artboardInd.length; ++i){
						array[i] = parseInt(this.artboardInd[i]);
					}
					this.artboardInd = array;
					this.artboardAll = false;
				}else if(xml.artboardAll.length()==0){
					this.artboardAll = true;
				}
			}

			 // LAYERS
			if(xml.layerInd.length()){
				this.layerInd = xml.layerInd.toString();
				if(this.layerInd.length){
					this.layerInd = this.layerInd.split(",");
					var array = [];
					for(var i=0; i<this.layerInd.length; ++i){
						array[i] = parseInt(this.layerInd[i]);
					}
					this.layerInd = array;
					this.layerAll = false;
				}else if(xml.layerAll.length()==0){
					this.layerAll = true;
				}
			}
			if(xml.artboardInd_layers.length()){
				this.artboardInd_layers	= xml.artboardInd_layers.toString();
				if(this.artboardInd_layers.length){
					this.artboardInd_layers = this.artboardInd_layers.split(",");
					var array = [];
					for(var i=0; i<this.artboardInd_layers.length; ++i){
						array[i] = parseInt(this.artboardInd_layers[i]);
					}
					this.artboardInd_layers = array;
					this.artboardAll_layers = false;

				}
			}else if(xml.artboardAll_layers.length()!=0){
				this.artboardAll_layers = xml.artboardAll_layers.toString() == "true";
			}else{
				this.artboardAll_layers = this.artboardAll;
			}

			 // ELEMENTS
			if(xml.elementPaths.length()){
				this.elementPaths = xml.elementPaths.toString();
				if(this.elementPaths.length){
					this.elementPaths = this.elementPaths.split(",");
				}
			}
			if(xml.elementOpenPaths.length()){
				this.elementOpenPaths = xml.elementOpenPaths.toString();
				if(this.elementOpenPaths.length){
					this.elementOpenPaths = this.elementOpenPaths.split(",");
				}
			}
			if(xml.artboardInd_elements.length()){
				this.artboardInd_elements	= xml.artboardInd_elements.toString();
				if(this.artboardInd_elements.length){
					this.artboardInd_elements = this.artboardInd_elements.split(",");
					var array = [];
					for(var i=0; i<this.artboardInd_elements.length; ++i){
						array[i] = parseInt(this.artboardInd_elements[i]);
					}
					this.artboardInd_elements = array;
					this.artboardAll_elements = false;

				}
			}else if(xml.artboardAll_elements.length()!=0){
				this.artboardAll_elements = xml.artboardAll_elements.toString() == "true";
			}else{
				this.artboardAll_elements = this.artboardAll;
			}

			// SYMBOLS
			if(xml.symbolNames.length()){
				this.symbolNames		= xml.symbolNames.toString();
				if(this.symbolNames.length){
					this.symbolNames = this.symbolNames.split(",");
					this.symbolAll = false;

				}else if(xml.symbolAll.length()==0){
					this.symbolAll = false;
				}
			}

			if(xml.exportArtboards.length() && xml.exportArtboards.toString() == "false"){
				this.artboardAll = false;
				this.artboardInd = [];
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
			if(node.elementPaths == null){
				node.elementPaths = [];
			}
			if(node.elementOpenPaths == null){
				node.elementOpenPaths = [];
			}
			var format = node.format;
			if(format.length()){

				var formats = new XML('<formats/>');
				var formatNode = new XML('<format/>');

				formatNode.format = node.format;
				formatNode.transparency = node.transparency;
				formatNode.embedImage = node.embedImage;
				formatNode.fontHandling = (node.embedFont?"embed":"none");
				formatNode.trimEdges = node.trimEdges;
				formatNode.innerPadding = node.innerPadding;

				formats.appendChild(formatNode);
				node.appendChild(formats);

				delete node.format;
				delete node.transparency;
				delete node.embedImage;
				delete node.embedFont;
				delete node.trimEdges;
				delete node.innerPadding;
			}
			var formats = node.formats.format;
			if(formats.length() && (node.artboardPattern || node.layerPattern || node.scaling)){
				for(var i=0; i<formats.length(); ++i){
					var formatNode = formats[i];
					if(formatNode.patterns.length()==0){
						formats.appendChild(new XML("<patterns/>"));
					}
					if(node.artboardPattern.length() && formatNode.patterns.artboard.length()==0){
						formatNode.patterns.artboard = node.artboardPattern.toString();
					}
					if(node.layerPattern.length() && formatNode.patterns.layer.length()==0){
						formatNode.patterns.layer = node.layerPattern.toString();
					}
					if(node.scaling && formatNode.scaling.length()==0){
						formatNode.scaling = node.scaling.toString();
					}
				}
				delete node.artboardPattern;
				delete node.layerPattern;
				delete node.scaling;
			}
		}/*,
		xmlEncode:function(str){
			str = str.split("&").join("&amp;");
			str = str.split("<").join("&lt;");
			str = str.split(">").join("&gt;");
			str = str.split('"').join("&quot;");
			str = str.split("'").join("&apos;");
			return str;
		}*/
	};
	pack.ExportSettings = ExportSettings;
})(smartExport)