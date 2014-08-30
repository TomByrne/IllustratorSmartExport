(function(pack){
	function SettingsPanel(container, layerPattern, artboardPattern, tokens, artboardsEnbled, scaling, directory){
		this.init(container, layerPattern, artboardPattern, tokens, artboardsEnbled, scaling, directory);
		return this;
	}

	SettingsPanel.prototype={
	    onPatternChanged:null,
	    onScalingChanged:null,
	    onDirectoryChanged:null,

		init:function(container, layerPattern, artboardPattern, tokens, artboardsEnbled, scaling, directory){
			this.tokens = tokens;
			var scopedThis = this;
			this.layerPattern = layerPattern;
			this.artboardPattern = artboardPattern;
			this.scaling = scaling;
			this.directory = directory;

			var row;
			var column = container.add('panel', undefined, 'General Settings')
			column.orientation = 'column';
			column.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP];

			// Artboard Pattern Heading and tokens
			row = column.add('group', undefined, '')
			row.orientation = 'row';
			row.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP];

			var patternSt = row.add('statictext', undefined, 'Artboard Filename Pattern:'); 
			patternSt.size = [260,20];

			this.artboardTokenList = row.add('dropdownlist', undefined, tokens);
			this.artboardTokenList.onChange = function() {
				scopedThis.addToken(scopedThis.artboardTokenList, scopedThis.artboardPatternInput);
			};
			this.artboardTokenList.selection = 0;
			this.artboardTokenList.enabled = artboardsEnbled;

			// Artboard Pattern Input
			row = column.add('group', undefined, '')
			row.orientation = 'row';
			row.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP];

			this.artboardPatternInput = row.add('edittext', undefined, artboardPattern); 
			this.artboardPatternInput.size = [ 400,20 ];

			this.artboardPatternInput.onChange = function() {
				scopedThis.artboardPattern = scopedThis.artboardPatternInput.text;
				if(scopedThis.onPatternChanged)scopedThis.onPatternChanged();
			};
			this.artboardPatternInput.addEventListener("keyup", this.artboardPatternInput.onChange);
			this.artboardPatternInput.enabled = artboardsEnbled;

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

			this.layerPatternInput = row.add('edittext', undefined, layerPattern); 
			this.layerPatternInput.size = [ 400,20 ];

			this.layerPatternInput.onChange = function() {
				scopedThis.layerPattern = scopedThis.layerPatternInput.text;
				if(scopedThis.onPatternChanged)scopedThis.onPatternChanged();
			};
			this.layerPatternInput.addEventListener("keyup", this.layerPatternInput.onChange);

			// scaling row
			row = column.add('group', undefined, '')
			row.orientation = 'row';
			row.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP]

			var scalingLabel = row.add('statictext', undefined, 'Scaling:');

			this.scalingInput = row.add('edittext', undefined, this.scaling+"%"); 
			this.scalingInput.size = [ 50,20 ];
			this.scalingInput.onChange = function(){
				var scaling = parseFloat( scopedThis.scalingInput.text.replace( /\% /, '' ));

				if(scaling){
					scopedThis.scaling = scaling
					if(scopedThis.onScalingChanged)scopedThis.onScalingChanged();
				}
				scopedThis.scalingInput.text = scopedThis.scaling + "%";
			}
			this.scalingInput.addEventListener("keydown", function(e){
				if(e.keyName=="Up"){
					scopedThis.scaling += 10;
				}else if(e.keyName=="Down"){
					scopedThis.scaling = Math.max(10, scopedThis.scaling - 10);
				}
				scopedThis.scalingInput.text = scopedThis.scaling + "%";
			});

			var scalingTip = row.add('statictext', undefined, 'Raster formats only, Use 200% for Retina');

			// DIR GROUP
			row = column.add( 'group', undefined, '') 
			row.orientation = 'row'
			row.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP]

			var chooseBtn = row.add('button', undefined, 'Output Directory...' );
			chooseBtn.onClick = function() {
				scopedThis.directoryInput.text = Folder.selectDialog().fsName;
				scopedThis.directoryInput.onChange();
			}

			this.directoryInput = row.add('edittext', undefined, directory); 
			this.directoryInput.size = [ 256,20 ];
			this.directoryInput.onChange = function(){
				scopedThis.directory = scopedThis.directoryInput.text;
				if(scopedThis.onDirectoryChanged)scopedThis.onDirectoryChanged();
			}
		},

		addToken:function(tokenList, input){
			if(tokenList.selection>0){
				var selected = Number(tokenList.selection);
				var token = this.tokens[selected];
				input.text += token;
				tokenList.selection = 0;
				if(this.onPatternChanged)this.onPatternChanged();
			}
		},

		setArtboardsEnabled:function(value){
			this.artboardPatternInput.enabled = value;
			this.artboardTokenList.enabled = value;
		}
	};
	pack.SettingsPanel = SettingsPanel;
})(smartExport)