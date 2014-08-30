(function(pack){
	function StringControl(container, value, optional){
		this.init(container, value, optional);
		return this;
	}



	StringControl.prototype={
	    onChange:null,

		init:function(container, value, optional){
			var scopedThis = this;

			if(value==null)value = "";

			this.value = value;
			this.optional = optional;

			var row = container.add("group");
			row.orientation = "row";
			row.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.CENTER];

			var inputW;
			if(optional){
				this.checkbox = row.add('checkbox');
				this.checkbox.value = (value!=null && value!="");
				this.checkbox.size = [16, 16];
				inputW = 175;
			}else{
				inputW = 200;
			}

			this.input = row.add('edittext', undefined, value);
			this.input.preferredSize = [inputW, 20];
			this.input.onChange = function(){
				scopedThis.setValue(scopedThis.input.text);
			}
		},
		setValue : function(value){
			this.value = value;
			this.input.text = value;
			if(this.optional)this.checkbox.value = (value!="");
			if(onChange)onChange();
		},

		getValue : function(){
			return !this.optional || this.checkbox.value?this.value:null;
		}
	};
	pack.StringControl = StringControl;
})(smartExport)