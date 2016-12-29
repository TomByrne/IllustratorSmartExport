(function(pack){
	function FormatPanel(container, formats, exportSettings, doArtboard, doLayer, doSymbol){
		this.init(container, formats, exportSettings, doArtboard, doLayer, doSymbol);
		return this;
	}

	FormatPanel.prototype={
	    onFormatsChanged:null,

	    formatTabs:null,
	    formatPanels:null,
	    ignoreChanges:false,

		init:function(container, formats, exportSettings, doArtboard, doLayer, doSymbol){
			var scopedThis = this;

			this.formatPanels = [];
			this.formats = formats;
			this.exportSettings = exportSettings;
			this.allowTrim = doArtboard || doLayer;


			var row = container.add("group");
			row.orientation = "row";
			row.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP];


			var column = row.add("group");
			column.orientation = "column";
			column.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP];

			var formatNames = ["--Add Format--"];
			for(var i=0; i<formats.length; ++i){
				formatNames.push(formats[i].name)
			}
			this.formatChooser = new pack.Dropdown(column, formatNames);
			this.formatChooser.setSelection(0);
			this.formatChooser.onChange = function(){
				if(scopedThis.formatChooser.selection > 0){
					scopedThis.addFormatItem(formats[scopedThis.formatChooser.selection - 1]);
					scopedThis.formatChooser.selection = 0;
					scopedThis.formatList.selection = scopedThis.formatList.items.length-1;
					if(scopedThis.onFormatsChanged)scopedThis.onFormatsChanged();
				}
			}

			this.formatList = column.add ('ListBox', [0, 0, 110, 332], '', 
									{numberOfColumns: 1, showHeaders: false, multiselect:false,
									columnTitles: ['Format'] });
			this.formatList.onChange = function(){
				if(scopedThis.formatList.selection===null){
					scopedThis.formatList.selection = scopedThis.currentIndex;
				}else{
					scopedThis.setCurrentFormat(scopedThis.formatList.selection.index);
				}
			}

			this.formatColumn = row.add("panel", undefined, 'Format Settings:');
			this.formatColumn.orientation = "column";
			this.formatColumn.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP]
			this.formatColumn.size = [374, 367]

			if(doArtboard){
				//artboard pattern
				this.artboardPattern = new pack.FilePatternControl(this.formatColumn, 'Artboard Filename Pattern:', null, pack.tokens.ARTBOARD_TOKENS);
				this.artboardPattern.onChange = function(){
					if(scopedThis.ignoreChanges)return;
					scopedThis.currentFormatSettings.patterns["artboard"] = scopedThis.artboardPattern.getValue();
					scopedThis.onFormatsChanged();
				}
				this.artboardPattern.setEnabled(this.exportSettings.exportArtboards);
			}

			if(doLayer){
				//layer pattern
				this.layerPattern = new pack.FilePatternControl(this.formatColumn, 'Layer Filename Pattern:', null, pack.tokens.LAYER_TOKENS);
				this.layerPattern.onChange = function(){
					if(scopedThis.ignoreChanges)return;
					scopedThis.currentFormatSettings.patterns["layer"] = scopedThis.layerPattern.getValue();
					scopedThis.onFormatsChanged();
				}
			}

			if(doSymbol){
				//layer pattern
				this.symbolPattern = new pack.FilePatternControl(this.formatColumn, 'Symbol Filename Pattern:', null, pack.tokens.SYMBOL_TOKENS);
				this.symbolPattern.onChange = function(){
					if(scopedThis.ignoreChanges)return;
					scopedThis.currentFormatSettings.patterns["symbol"] = scopedThis.symbolPattern.getValue();
					scopedThis.onFormatsChanged();
				}
			}

			// scaling & color space row
			var scalingRow = this.formatColumn.add('group', undefined, '')
			scalingRow.orientation = 'row';
			scalingRow.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP]

			this.scalingLabel = scalingRow.add('statictext', undefined, 'Scaling:');
			this.scalingLabel.enabled = false;

			this.scalingInput = scalingRow.add('edittext', undefined, ""); 
			this.scalingInput.size = [ 50,20 ];
			this.scalingInput.enabled = false;
			this.scalingInput.onChange = function(){
				var scaling = parseFloat( scopedThis.scalingInput.text.replace( /\% /, '' ));

				if(scaling){
					scopedThis.currentFormatSettings.scaling = scaling
					if(scopedThis.onScalingChanged)scopedThis.onScalingChanged();
				}
				scopedThis.scalingInput.text = scopedThis.currentFormatSettings.scaling + "%";
				scopedThis.checkSettingsName(scopedThis.currentFormatSettings, true, true);
			}
			this.scalingInput.addEventListener("keydown", function(e){
				if(!scopedThis.currentFormatSettings.scaling)return;

				var pressed;
				if(e.keyName=="Up"){
					pressed = true;
					scopedThis.currentFormatSettings.scaling += 10;
				}else if(e.keyName=="Down"){
					pressed = true;
					scopedThis.currentFormatSettings.scaling = Math.max(10, scopedThis.currentFormatSettings.scaling - 10);
				}
				if(pressed){
					scopedThis.scalingInput.text = scopedThis.currentFormatSettings.scaling + "%";
					scopedThis.checkSettingsName(scopedThis.currentFormatSettings, true, true);
				}
			});

			this.colorSpaceLabel = scalingRow.add('statictext', undefined, 'Color Space:');
			this.colorSpaceLabel.enabled = false;
			this.colorSpaceLabel.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.CENTER];

			this.colorSpaceOptions = [{name:"Same as Document", key:null}, {name:"RGB", key:"rgb"}, {name:"CMYK", key:"cmyk"}];

			this.colorSpaceList = new pack.Dropdown(scalingRow);
			this.colorSpaceList.setEnabled(false);
			this.colorSpaceList.setSize(148,20);
			var colorList = [];
			for(var i=0; i<this.colorSpaceOptions.length; i++){
				var item = this.colorSpaceOptions[i];
				colorList.push(item.name);
			}
			this.colorSpaceList.setItems(colorList);
			this.colorSpaceList.onChange = function() {
				scopedThis.currentFormatSettings.colorSpace = scopedThis.colorSpaceOptions[scopedThis.colorSpaceList.selection].key;
				if(scopedThis.onFormatsChanged) scopedThis.onFormatsChanged();
			};

			// font row
			var fontRow = this.formatColumn.add('group', undefined, '')
			fontRow.orientation = 'row';
			fontRow.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP]

			this.fontHandlingLabel = fontRow.add('statictext', undefined, 'Fonts:');
			this.fontHandlingLabel.enabled = false;
			this.fontHandlingLabel.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.CENTER];

			this.fontHandlingList = new pack.Dropdown(fontRow);
			this.fontHandlingList.setEnabled(false);
			this.fontHandlingList.setSize(105,20);
			this.fontHandlingList.onChange = function() {
				scopedThis.currentFormatSettings.fontHandling = scopedThis.fontHandlingOptions[scopedThis.fontHandlingList.selection].key;
				scopedThis.onFormatsChanged();
			};


			// preset row
			var presetRow = this.formatColumn.add('group', undefined, '')
			presetRow.orientation = 'row';
			presetRow.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP]

			this.presetsLabel = presetRow.add('statictext', undefined, 'Preset:');
			this.presetsLabel.enabled = false;
			this.presetsLabel.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.CENTER];

			//this.presetsList = presetRow.add('dropdownlist', undefined);
			this.presetsList = new pack.Dropdown(presetRow);
			this.presetsList.setEnabled(false);
			//this.presetsList.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.CENTER];
			this.presetsList.setSize(290,20);
			this.presetsList.onChange = function() {
				if(scopedThis.currentFormat.presets == null) return;
				if(scopedThis.presetsList.selection <= 0){
					scopedThis.currentFormatSettings.preset = null;
				}else{
					scopedThis.currentFormatSettings.preset = scopedThis.currentFormat.presets[scopedThis.presetsList.selection-1].key;
				}
				scopedThis.checkOptionsButton();
				scopedThis.onFormatsChanged();
			};

			// embed row
			var embedRow = this.formatColumn.add('group', undefined, '')
			embedRow.orientation = 'row';
			embedRow.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP]

			this.embedImageCheckBox = embedRow.add('checkbox', undefined, 'Embed Imagery');
			this.embedImageCheckBox.value = false;
			this.embedImageCheckBox.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP];
			this.embedImageCheckBox.enabled = false;
			//this.embedImageCheckBox.size = [ 180,20 ];
			this.embedImageCheckBox.onClick = function(){
				scopedThis.currentFormatSettings.embedImage = scopedThis.embedImageCheckBox.value;
				scopedThis.onFormatsChanged();
			}

			this.ungroupCheckBox = embedRow.add('checkbox', undefined, 'Expand Groups');
			this.ungroupCheckBox.value = false;
			this.ungroupCheckBox.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP];
			this.ungroupCheckBox.enabled = false;
			this.ungroupCheckBox.onClick = function(){
				scopedThis.currentFormatSettings.ungroup = scopedThis.ungroupCheckBox.value;
				scopedThis.onFormatsChanged();
			}

			if(this.allowTrim){
				this.trimEdgesCheckBox = embedRow.add('checkbox', undefined, 'Trim Edges');
				this.trimEdgesCheckBox.value = false;
				this.trimEdgesCheckBox.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP];
				this.trimEdgesCheckBox.enabled = false;
				this.trimEdgesCheckBox.onClick = function(){
					scopedThis.currentFormatSettings.trimEdges = scopedThis.trimEdgesCheckBox.value;
					scopedThis.onFormatsChanged();
				}
			}
			
			// padding row
			this.innerPaddingCheckBox = this.formatColumn.add('checkbox', undefined, 'Inner Padding (prevents curved edge clipping)');
			this.innerPaddingCheckBox.value = false;
			this.innerPaddingCheckBox.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP];
			this.innerPaddingCheckBox.enabled = false;
			this.innerPaddingCheckBox.onClick = function(){
				scopedThis.currentFormatSettings.innerPadding = scopedThis.innerPaddingCheckBox.value;
				scopedThis.onFormatsChanged();
			}

			// directory row
			var dirRow = this.formatColumn.add('group', undefined, '')
			dirRow.orientation = 'row';
			dirRow.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP]

			this.dirLabel = dirRow.add('statictext', undefined, 'Export into folder:');
			this.dirLabel.enabled = false;

			this.dirInput = dirRow.add('edittext', undefined, ""); 
			this.dirInput.size = [ 150,20 ];
			this.dirInput.enabled = false;
			this.dirInput.onChange = function(){
				scopedThis.currentFormatSettings.directory = scopedThis.dirInput.text;
				scopedThis.onFormatsChanged();
			}
			

			// Button row
			var buttonRow = this.formatColumn.add('group', undefined, '')
			buttonRow.orientation = 'row';
			buttonRow.alignment = [ScriptUI.Alignment.RIGHT, ScriptUI.Alignment.TOP]
		
			this.moreButton = buttonRow.add('button', undefined, 'More Options');
			this.moreButton.alignment = [ScriptUI.Alignment.RIGHT, ScriptUI.Alignment.TOP];
			this.moreButton.enabled = false;
			this.moreButton.onClick = function(){
				scopedThis.showMoreOptions();
			}
		
			this.removeButton = buttonRow.add('button', undefined, 'Remove Format');
			this.removeButton.alignment = [ScriptUI.Alignment.RIGHT, ScriptUI.Alignment.TOP];
			this.removeButton.enabled = false;
			this.removeButton.onClick = function(){
				scopedThis.removeCurrent();
				if(scopedThis.onFormatsChanged)scopedThis.onFormatsChanged();
			}

			this.updateFormats();
		},
		updateArtboardsEnabled:function(){
			if(this.artboardPattern)this.artboardPattern.setEnabled(this.enabled && this.exportSettings.exportArtboards);
		},
		updateSettings:function(){
			this.updateFormats();
			this.setCurrentFormat(this.currentIndex);
		},
		updateFormats:function(){
			this.formatList.removeAll();
			for(var i=0; i<this.exportSettings.formats.length; i++){
				var settings = this.exportSettings.formats[i];
				this.addFormatItem(pack.getFormat(settings.format), settings);
			}
			if(this.exportSettings.formats.length){
				this.formatList.selection = 0;
			}
		},
		showMoreOptions:function(){
			try{
				new pack.PropertiesPanel(this.currentFormatSettings);
			}catch(e){
				alert(e);
			}
		},
		removeCurrent:function(){
			this.exportSettings.formats.splice(this.currentIndex, 1);
			this.formatList.remove(this.currentIndex);
			if(this.exportSettings.formats.length==0){
				this.setEnabled(false);

			}else if(this.currentIndex==this.exportSettings.formats.length){
				this.formatList.selection = this.currentIndex-1;
				//this.setCurrentFormat(this.currentIndex-1);
			}else{
				this.formatList.selection = this.currentIndex;
				//this.setCurrentFormat(this.currentIndex);
			}
		},
		setEnabled:function(enabled){
			this.enabled = enabled;
			this.dirLabel.enabled = enabled;
			this.dirInput.enabled = enabled;
			this.scalingLabel.enabled = enabled;
			//this.transCheckBox.enabled = enabled;
			if(this.allowTrim)this.trimEdgesCheckBox.enabled = enabled;
			this.embedImageCheckBox.enabled = enabled;
			this.ungroupCheckBox.enabled = enabled;
			this.fontHandlingList.setEnabled(enabled);
			this.fontHandlingLabel.enabled = enabled;
			this.presetsLabel.enabled = enabled;
			this.presetsList.setEnabled(enabled);
			this.colorSpaceList.setEnabled(enabled);
			this.colorSpaceLabel.enabled = enabled;
			this.moreButton.enabled = enabled;
			this.removeButton.enabled = enabled;

			if(this.layerPattern) this.layerPattern.setEnabled(enabled);
			if(this.symbolPattern) this.symbolPattern.setEnabled(enabled);
			this.updateArtboardsEnabled();
		},
		setCurrentFormat:function(index){

			this.ignoreChanges = true;
			this.currentIndex = index;
			this.currentFormatSettings = this.exportSettings.formats[index];
			this.currentFormat = this.currentFormatSettings.formatRef;

			this.setEnabled(true);

			if(this.currentFormatSettings.directory){
				this.dirInput.text = this.currentFormatSettings.directory;
			}else{
				this.dirInput.text = "";
			}

			if(this.artboardPattern) this.artboardPattern.setValue(this.currentFormatSettings.patterns["artboard"]);
			if(this.layerPattern) this.layerPattern.setValue(this.currentFormatSettings.patterns["layer"]);
			if(this.symbolPattern) this.symbolPattern.setValue(this.currentFormatSettings.patterns["symbol"]);

			this.scalingInput.enabled = this.currentFormatSettings.hasProp("scaling");
			this.scalingLabel.enabled = this.scalingInput.enabled;
			if(this.scalingInput.enabled && this.currentFormatSettings.scaling){
				this.scalingInput.text = this.currentFormatSettings.scaling + "%";
			}else{
				this.scalingInput.text = "";
			}

			if(this.allowTrim){
				this.trimEdgesCheckBox.enabled = this.currentFormatSettings.hasProp("trimEdges");
				if(this.trimEdgesCheckBox.enabled){
					this.trimEdgesCheckBox.value = this.currentFormatSettings.trimEdges;
				}else{
					this.trimEdgesCheckBox.value = false;
				}
			}

			this.embedImageCheckBox.enabled = this.currentFormatSettings.hasProp("embedImage");
			if(this.embedImageCheckBox.enabled){
				this.embedImageCheckBox.value = this.currentFormatSettings.embedImage;
			}else{
				this.embedImageCheckBox.value = false;
			}

			this.ungroupCheckBox.enabled = this.currentFormatSettings.hasProp("ungroup");
			if(this.ungroupCheckBox.enabled){
				this.ungroupCheckBox.value = this.currentFormatSettings.ungroup;
			}else{
				this.ungroupCheckBox.value = false;
			}


			var selection = 0;
			for(var i=0; i<this.colorSpaceOptions.length; i++){
				var item = this.colorSpaceOptions[i];
				if(item.key==this.currentFormatSettings.colorSpace){
					selection = i;
				}
			}
			this.colorSpaceList.setSelection(selection);

			if(this.currentFormatSettings.hasProp("fontEmbed")){
				this.fontHandlingOptions = [{name:"No Embed", key:"none"}, {name:"Embed", key:"embed"}];
				if(this.currentFormatSettings.hasProp("fontOutline")){
					this.fontHandlingOptions.push({name:"Outlines", key:"outline"});
				}
			}else if(this.currentFormatSettings.hasProp("fontOutline")){
				this.fontHandlingOptions = [{name:"No Outlines", key:"none"}, {name:"Outlines", key:"outline"}];
			}else{
				this.fontHandlingOptions = []
			}
			var fontList = [];
			//this.fontHandlingList.removeAll();
			if(this.fontHandlingOptions.length){
				var selection = 0;
				for(var i=0; i<this.fontHandlingOptions.length; i++){
					var item = this.fontHandlingOptions[i];
					fontList.push(item.name);
					if(item.key==this.currentFormatSettings.fontHandling){
						selection = i;
					}
				}
				this.fontHandlingList.setSelection(selection);
				this.fontHandlingLabel.enabled = true;
				this.fontHandlingList.setEnabled(true);
			}else{
				this.fontHandlingLabel.enabled = false;
				this.fontHandlingList.setEnabled(false);
			}
			this.fontHandlingList.setItems(fontList);

			//this.presetsList.removeAll();
			var presetList = [];
			if(this.currentFormat.presets != null && this.currentFormat.presets.length){
				var selection = 0;
				presetList.push("None");
				//this.presetsList.add("item", "None");
				for(var i=0; i<this.currentFormat.presets.length; i++){
					var item = this.currentFormat.presets[i];
					//this.presetsList.add("item", item.name);
					presetList.push(item.name);
					if(item.key==this.currentFormatSettings.preset){
						selection = i+1;
					}
				}
				this.presetsList.setSelection(selection);
				this.presetsLabel.enabled = true;
				this.presetsList.setEnabled(true);
			}else{
				this.presetsLabel.enabled = false;
				this.presetsList.setEnabled(false);
			}
			this.presetsList.setItems(presetList);

			this.innerPaddingCheckBox.enabled = this.currentFormatSettings.hasProp("innerPadding");
			if(this.innerPaddingCheckBox.enabled){
				this.innerPaddingCheckBox.value = this.currentFormatSettings.innerPadding;
			}else{
				this.innerPaddingCheckBox.value = false;
			}

			this.checkOptionsButton();
			this.removeButton.enabled = true;

			this.setPanelHeading();
			this.ignoreChanges = false;
		},
		checkOptionsButton:function(){
			if(this.currentFormatSettings.preset == "") this.currentFormatSettings.preset = null;
			this.moreButton.enabled = (this.currentFormatSettings.formatRef.more!=null && this.currentFormatSettings.preset==null);
		},
		setPanelHeading:function(){
			this.formatColumn.text = "Format Settings: "+this.currentFormatSettings.name;
		},
		addFormatItem:function(format, formatSettings){
			var item = this.formatList.add("item");

			if(formatSettings==null){
				formatSettings = new pack.FormatSettings(format.name);
				formatSettings.formatRef = format;
				formatSettings.directory = format.defaultDir;

				if(!formatSettings.patterns)formatSettings.patterns = {};
				if(this.layerPattern) formatSettings.patterns.layer = this.layerPattern.getValue();
				if(this.artboardPattern) formatSettings.patterns.artboard = this.artboardPattern.getValue();
				if(this.symbolPattern) formatSettings.patterns.symbol = this.symbolPattern.getValue();

				this.exportSettings.addNewFormat(formatSettings);
			}
			if(!formatSettings.name){
				this.checkSettingsName(formatSettings);
			}
			item.text = formatSettings.name;
		},
		checkSettingsName:function(formatSettings, updateHeading, updateList){
			var format = formatSettings.formatRef;
			var name = format.name;
			var additional = [];
			if(formatSettings.scaling && formatSettings.scaling!=100){
				additional.push(formatSettings.scaling+"%");
			}
			if(formatSettings.colorSpace){
				additional.push(formatSettings.colorSpace.toUpperCase());
			}
			if(additional.length){
				name += " ("+additional.join(",")+")";
			}
			formatSettings.name = name;
			if(updateHeading)this.setPanelHeading();
			if(updateList){
				var index = this.indexOf(this.exportSettings.formats, formatSettings);
				var item = this.formatList.items[index];
				item.text = name;

				// This is to force a refresh (an issue in CC 2014)
				var item = this.formatList.add("item");
				this.formatList.remove(item);
			}
		},
		indexOf: function ( array, element ) {
			for(var i=0; i<array.length; i++){
				if(array[i]==element)return i;
			}
			return -1;
		}
	};
	pack.FormatPanel = FormatPanel;
})(smartExport)