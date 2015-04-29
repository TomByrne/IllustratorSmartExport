(function(pack){
	function FilePatternControl(container, label, value, tokens){
		this.init(container, label, value, tokens);
		return this;
	}



	FilePatternControl.prototype={
	    onChange:null,

		init:function(container, label, value, tokens){
			var scopedThis = this;

			if(value==null)value = "";

			this.value = value;
			this.tokens = tokens;

			if(container.orientation == "column"){
				var column = container;
			}else{
				var column = container.add('group');
				column.orientation = "column";
				row.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP];
			}

			var row = column.add('group', undefined, '')
			row.orientation = 'row';
			row.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP];

			this.label = row.add('statictext', undefined, label); 
			this.label.size = [220,20];

			this.dropdown = row.add('dropdownlist', undefined, tokens);
			this.dropdown.onChange = function() {
				scopedThis.addToken();
			};
			this.dropdown.size = [110,20];
			this.dropdown.selection = 0;

			row = column.add('group', undefined, '')
			row.orientation = 'row';
			row.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP];

			this.input = row.add('edittext', undefined, value); 
			this.input.size = [ 340,20 ];

			this.input.onChange = function() {
				scopedThis.setValue(scopedThis.input.text);
			};
			this.input.addEventListener("keyup", this.input.onChange);
		},
		setValue : function(value){
			this.value = value;
			if(this.input.text != value)this.input.text = value; // Important to check first for CS6
			if(this.onChange)this.onChange();
		},

		getValue : function(){
			return this.value;
		},

		addToken:function(){
			if(dropdown.selection>0){
				var selected = Number(dropdown.selection);
				var token = this.tokens[selected];
				setValue(input.text + token);
				dropdown.selection = 0;
			}
		},
		setEnabled : function(value){
			this.label.enabled = value;
			this.input.enabled = value;
			this.dropdown.enabled = value;
		}
	};
	pack.FilePatternControl = FilePatternControl;
})(smartExport)