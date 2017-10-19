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

			// if(container.orientation == "column"){
			// 	var column = container;
			// }else{
			// 	var column = container.add('group');
			// 	column.orientation = "column";
			// 	row.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP];
			// }
			var column = container;

			var row = column.add('group', undefined, '')
			row.orientation = 'row';
			row.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP];

			this.label = row.add('statictext', undefined, label); 
			this.label.size = [60,20];

			this.input = row.add('edittext', undefined, value); 
			this.input.size = [ 360,20 ];

			this.dropdown = new pack.Dropdown(row, tokens);
			//this.dropdown = row.add('dropdownlist', undefined, tokens);
			this.dropdown.onChange = function() {
				scopedThis.addToken();
			};
			this.dropdown.setSize(110,20);
			this.dropdown.setSelection(0);

			// row = column.add('group', undefined, '')
			// row.orientation = 'row';
			// row.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP];

			// this.input = row.add('edittext', undefined, value); 
			// this.input.size = [ 340,20 ];

			this.input.onChange = function() {
				scopedThis.setValue(scopedThis.input.text);
			};
			this.input.addEventListener("keyup", this.input.onChange);
		},
		setValue : function(value){
			this.value = value;
			this.input.text = value;
			if(this.onChange)this.onChange();
		},

		getValue : function(){
			return this.value;
		},

		addToken:function(){
			if(this.dropdown.selection>0){
				var selected = Number(this.dropdown.selection);
				var token = this.tokens[selected];
				this.setValue(this.input.text + token);
				this.dropdown.setSelection(0);
			}
		},
		setEnabled : function(value){
			this.label.enabled = value;
			this.input.enabled = value;
			this.dropdown.setEnabled(value);
		}
	};
	pack.FilePatternControl = FilePatternControl;
})(smartExport)