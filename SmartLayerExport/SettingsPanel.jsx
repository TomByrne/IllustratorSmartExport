(function(pack){
	function SettingsPanel(container, exportSettings, tokens){
		this.init(container, exportSettings, tokens);
		return this;
	}

	SettingsPanel.prototype={
	    onPatternChanged:null,
	    onScalingChanged:null,
	    onDirectoryChanged:null,

		init:function(container, exportSettings, tokens){
			this.tokens = tokens;
			var scopedThis = this;
			this.exportSettings = exportSettings;

			var row;
			var column = container.add('group')
			column.orientation = 'column';
			column.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP];

			// Artboard Pattern Heading and tokens
			/*row = column.add('group', undefined, '')
			row.orientation = 'row';
			row.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP];

			var patternSt = row.add('statictext', undefined, 'Artboard Filename Pattern:'); 
			patternSt.size = [260,20];

			this.artboardTokenList = row.add('dropdownlist', undefined, tokens);
			this.artboardTokenList.onChange = function() {
				scopedThis.addToken(scopedThis.artboardTokenList, scopedThis.artboardPatternInput);
			};
			this.artboardTokenList.selection = 0;
			this.artboardTokenList.enabled = exportSettings.exportArtboards;

			// Artboard Pattern Input
			row = column.add('group', undefined, '')
			row.orientation = 'row';
			row.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP];

			this.artboardPatternInput = row.add('edittext', undefined, exportSettings.artboardPattern); 
			this.artboardPatternInput.size = [ 400,20 ];

			this.artboardPatternInput.onChange = function() {
				scopedThis.exportSettings.artboardPattern = scopedThis.artboardPatternInput.text;
				if(scopedThis.onPatternChanged)scopedThis.onPatternChanged();
			};
			this.artboardPatternInput.addEventListener("keyup", this.artboardPatternInput.onChange);
			this.artboardPatternInput.enabled = exportSettings.exportArtboards;

			// Layer Pattern Heading and tokens
			row = column.add('group', undefined, '')
			row.orientation = 'row';
			row.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP];

			var patternSt = row.add('statictext', undefined, 'Layer Filename Pattern:'); 
			patternSt.size = [260,20];

			this.layerTokenList = row.add('dropdownlist', undefined, tokens);
			this.layerTokenList.onChange = function() {
				scopedThis.addToken(scopedThis.layerTokenList, scopedThis.layerPatternInput);
			};
			this.layerTokenList.selection = 0;

			// Layer Pattern Input
			row = column.add('group', undefined, '')
			row.orientation = 'row';
			row.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP];

			this.layerPatternInput = row.add('edittext', undefined, exportSettings.layerPattern); 
			this.layerPatternInput.size = [ 400,20 ];

			this.layerPatternInput.onChange = function() {
				scopedThis.exportSettings.layerPattern = scopedThis.layerPatternInput.text;
				if(scopedThis.onPatternChanged)scopedThis.onPatternChanged();
			};
			this.layerPatternInput.addEventListener("keyup", this.layerPatternInput.onChange);*/

			// scaling row
			/*row = column.add('group', undefined, '')
			row.orientation = 'row';
			row.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP]

			var scalingLabel = row.add('statictext', undefined, 'Scaling:');

			this.scalingInput = row.add('edittext', undefined, this.exportSettings.scaling+"%"); 
			this.scalingInput.size = [ 50,20 ];
			this.scalingInput.onChange = function(){
				var scaling = parseFloat( scopedThis.scalingInput.text.replace( /\% /, '' ));

				if(scaling){
					scopedThis.exportSettings.scaling = scaling;
					if(scopedThis.onScalingChanged)scopedThis.onScalingChanged();
				}
				scopedThis.scalingInput.text = scopedThis.exportSettings.scaling + "%";
			}
			this.scalingInput.addEventListener("keydown", function(e){
				if(e.keyName=="Up"){
					scopedThis.exportSettings.scaling += 10;
					scopedThis.scalingInput.text = scopedThis.exportSettings.scaling + "%";
				}else if(e.keyName=="Down"){
					scopedThis.exportSettings.scaling = Math.max(10, scopedThis.exportSettings.scaling - 10);
					scopedThis.scalingInput.text = scopedThis.exportSettings.scaling + "%";
				}
			});

			var scalingTip = row.add('statictext', undefined, 'Raster formats only, Use 200% for Retina');*/

			// DIR GROUP
			row = column.add( 'group', undefined, '') 
			row.orientation = 'row'
			row.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP]

			var chooseBtn = row.add('button', undefined, 'Output Directory...' );
			chooseBtn.onClick = function() {
				var file = new Folder(scopedThis.exportSettings.directory).selectDlg();
				if(!file)return;

				scopedThis.directoryInput.text = file.fsName;
				scopedThis.directoryInput.onChange();
			}

			this.directoryInput = row.add('edittext', undefined, exportSettings.directory); 
			this.directoryInput.size = [ 354,20 ];
			this.directoryInput.onChange = function(){
				scopedThis.exportSettings.directory = scopedThis.directoryInput.text;
				if(scopedThis.onDirectoryChanged)scopedThis.onDirectoryChanged();
			}
		},

		updateSettings:function(){
			//this.artboardPatternInput.text = this.exportSettings.artboardPattern;
			//this.layerPatternInput.text = this.exportSettings.layerPattern;
			this.directoryInput.text = this.exportSettings.directory;
			//this.scalingInput.text = this.exportSettings.scaling + "%";
			//this.artboardPatternInput.enabled = this.exportSettings.exportArtboards;
			//this.artboardTokenList.enabled = this.exportSettings.exportArtboards;
		}/*,

		addToken:function(tokenList, input){
			if(tokenList.selection>0){
				var selected = Number(tokenList.selection);
				var token = this.tokens[selected];
				input.text += token;
				tokenList.selection = 0;
				if(this.onPatternChanged)this.onPatternChanged();
			}
		},

		updateArtboardsEnabled:function(){
			//this.artboardPatternInput.enabled = this.exportSettings.exportArtboards;
			//this.artboardTokenList.enabled = this.exportSettings.exportArtboards;
		}*/
	};
	pack.SettingsPanel = SettingsPanel;
})(smartExport)