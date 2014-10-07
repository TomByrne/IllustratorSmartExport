(function(pack){
	function FormatPanel(container, formats, exportSettings){
		this.init(container, formats, exportSettings);
		return this;
	}

	FormatPanel.prototype={
	    onFormatsChanged:null,

	    formatTabs:null,
	    formatPanels:null,

		init:function(container, formats, exportSettings){
			var scopedThis = this;

			this.formatPanels = [];
			this.formats = formats;
			this.exportSettings = exportSettings;


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
			this.formatChooser = column.add('dropdownlist', undefined, formatNames);
			this.formatChooser.selection = 0;
			this.formatChooser.onChange = function(){
				if(scopedThis.formatChooser.selection > 0){
					scopedThis.addFormatItem(formats[scopedThis.formatChooser.selection - 1]);
					scopedThis.formatChooser.selection = 0;
					scopedThis.formatList.selection = scopedThis.formatList.items.length-1;
					if(scopedThis.onFormatsChanged)scopedThis.onFormatsChanged();
				}
			}

			this.formatList = column.add ('ListBox', [0, 0, 110, 174], '', 
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

			// scaling row
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
					scopedThis.scalingInput.text = scopedThis.currentFormatSettings.scaling + "%";
				}else{
					scopedThis.currentFormatSettings.scaling = "";
				}
				scopedThis.checkSettingsName(scopedThis.currentFormatSettings, true, true);
			}
			this.scalingInput.addEventListener("keydown", function(e){
				if(!scopedThis.currentFormatSettings.scaling)return;

				if(e.keyName=="Up"){
					scopedThis.currentFormatSettings.scaling += 10;
				}else if(e.keyName=="Down"){
					scopedThis.currentFormatSettings.scaling = Math.max(10, scopedThis.currentFormatSettings.scaling - 10);
				}
				scopedThis.scalingInput.text = scopedThis.currentFormatSettings.scaling + "%";
				scopedThis.checkSettingsName(scopedThis.currentFormatSettings, true, true);
			});

			this.scalingTip = scalingRow.add('statictext', undefined, 'Overrides general settings');
			this.scalingTip.enabled = false;

			// transparency / trim row
			var transRow = this.formatColumn.add('group', undefined, '')
			transRow.orientation = 'row';
			transRow.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP]
		
			this.transCheckBox = transRow.add('checkbox', undefined, 'Transparency');
			this.transCheckBox.value = false;
			this.transCheckBox.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP];
			this.transCheckBox.enabled = false; 
			this.transCheckBox.size = [ 120,20 ];
			this.transCheckBox.onClick = function(){
				scopedThis.currentFormatSettings.transparency = scopedThis.transCheckBox.value;
			}

			this.embedImageCheckBox = transRow.add('checkbox', undefined, 'Embed Imagery');
			this.embedImageCheckBox.value = false;
			this.embedImageCheckBox.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP];
			this.embedImageCheckBox.enabled = false;
			this.embedImageCheckBox.onClick = function(){
				scopedThis.currentFormatSettings.embedImage = scopedThis.embedImageCheckBox.value;
			}

			// font row
			var embedRow = this.formatColumn.add('group', undefined, '')
			embedRow.orientation = 'row';
			embedRow.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.CENTER];
		
			this.trimEdgesCheckBox = embedRow.add('checkbox', undefined, 'Trim Edges');
			this.trimEdgesCheckBox.value = false;
			this.trimEdgesCheckBox.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.CENTER];
			this.trimEdgesCheckBox.enabled = false;
			this.trimEdgesCheckBox.size = [ 120,20 ];
			this.trimEdgesCheckBox.onClick = function(){
				scopedThis.currentFormatSettings.trimEdges = scopedThis.trimEdgesCheckBox.value;
			}

			this.fontHandlingLabel = embedRow.add('statictext', undefined, 'Fonts:');
			this.fontHandlingLabel.enabled = false;
			this.fontHandlingLabel.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.CENTER];

			this.fontHandlingList = embedRow.add('dropdownlist', undefined);
			this.fontHandlingList.enabled = false;
			this.fontHandlingList.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.CENTER];
			this.fontHandlingList.size = [ 95,20 ];
			this.fontHandlingList.onChange = function() {
				scopedThis.currentFormatSettings.fontHandling = scopedThis.fontHandlingOptions[scopedThis.fontHandlingList.selection.index].key;
			};
		
			this.innerPaddingCheckBox = this.formatColumn.add('checkbox', undefined, 'Inner Padding (prevents curved edge clipping)');
			this.innerPaddingCheckBox.value = false;
			this.innerPaddingCheckBox.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP];
			this.innerPaddingCheckBox.enabled = false;
			this.innerPaddingCheckBox.onClick = function(){
				scopedThis.currentFormatSettings.innerPadding = scopedThis.innerPaddingCheckBox.value;
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
			if(this.currentIndex==this.exportSettings.formats.length){
				this.formatList.selection = this.currentIndex-1;
				//this.setCurrentFormat(this.currentIndex-1);
			}else{
				this.formatList.selection = this.currentIndex;
				//this.setCurrentFormat(this.currentIndex);
			}
		},
		setCurrentFormat:function(index){
			this.currentIndex = index;
			this.currentFormatSettings = this.exportSettings.formats[index];
			this.currentFormat = this.currentFormatSettings.formatRef;

			this.dirLabel.enabled = true;
			this.dirInput.enabled = true;
			if(this.currentFormatSettings.directory){
				this.dirInput.text = this.currentFormatSettings.directory;
			}else{
				this.dirInput.text = "";
			}

			this.scalingInput.enabled = this.currentFormatSettings.hasProp("scaling");
			this.scalingLabel.enabled = this.scalingInput.enabled;
			this.scalingTip.enabled = this.scalingInput.enabled;
			if(this.scalingInput.enabled && this.currentFormatSettings.scaling){
				this.scalingInput.text = this.currentFormatSettings.scaling + "%";
			}else{
				this.scalingInput.text = "";
			}
			
			this.transCheckBox.enabled = this.currentFormatSettings.hasProp("transparency");
			if(this.transCheckBox.enabled){
				this.transCheckBox.value = this.currentFormatSettings.transparency;
			}else{
				this.transCheckBox.value = false;
			}

			this.trimEdgesCheckBox.enabled = this.currentFormatSettings.hasProp("trimEdges");
			if(this.trimEdgesCheckBox.enabled){
				this.trimEdgesCheckBox.value = this.currentFormatSettings.trimEdges;
			}else{
				this.trimEdgesCheckBox.value = false;
			}

			this.embedImageCheckBox.enabled = this.currentFormatSettings.hasProp("embedImage");
			if(this.embedImageCheckBox.enabled){
				this.embedImageCheckBox.value = this.currentFormatSettings.embedImage;
			}else{
				this.embedImageCheckBox.value = false;
			}

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
			this.fontHandlingList.removeAll();
			if(this.fontHandlingOptions.length){
				var selection = 0;
				for(var i=0; i<this.fontHandlingOptions.length; i++){
					var item = this.fontHandlingOptions[i];
					this.fontHandlingList.add("item", item.name);
					if(item.key==this.currentFormatSettings.fontHandling){
						selection = i;
					}
				}
				this.fontHandlingList.selection = selection;
				this.fontHandlingLabel.enabled = true;
				this.fontHandlingList.enabled = true;
			}else{
				this.fontHandlingLabel.enabled = false;
				this.fontHandlingList.enabled = false;
			}

			this.innerPaddingCheckBox.enabled = this.currentFormatSettings.hasProp("innerPadding");
			if(this.innerPaddingCheckBox.enabled){
				this.innerPaddingCheckBox.value = this.currentFormatSettings.innerPadding;
			}else{
				this.innerPaddingCheckBox.value = false;
			}

			this.moreButton.enabled = (this.currentFormatSettings.formatRef.more!=null);
			this.removeButton.enabled = true;

			this.setPanelHeading();
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
				this.exportSettings.formats.push(formatSettings);
			}
			if(!formatSettings.name){
				this.checkSettingsName(formatSettings);
			}
			item.text = formatSettings.name;
		},
		checkSettingsName:function(formatSettings, updateHeading, updateList){
			var format = formatSettings.formatRef;
			var name = format.name;
			if(formatSettings.scaling){
				name += " ("+formatSettings.scaling+"%)";
			}
			formatSettings.name = name;
			if(updateHeading)this.setPanelHeading();
			if(updateList){
				var index = this.indexOf(this.exportSettings.formats, formatSettings);
				var item = this.formatList.items[index];
				item.text = name;
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