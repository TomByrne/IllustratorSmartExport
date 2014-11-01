(function(pack){
	function NumberControl(container, value, optional, units){
		this.init(container, value, optional, units);
		return this;
	}



	NumberControl.prototype={
	    onChange:null,

		init:function(container, value, optional, units){
			var scopedThis = this;

			if(value==null)value = "";

			this.value = value;
			this.optional = optional;

			var row = container.add("group");
			row.orientation = "row";
			row.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.CENTER];

			if(optional){
				this.checkbox = row.add('checkbox');
				this.checkbox.value = (value!=null && value!="");
				this.checkbox.size = [16, 16];
			}

			this.input = row.add('edittext', undefined, value);
			this.input.preferredSize = [45, 20];
			this.input.onChange = function(){
				scopedThis.setValue(parseFloat(scopedThis.input.text));
			}

			if(units){
				row.add('statictext', undefined, units);
			}
		},
		setValue : function(value){
			this.value = value;
			this.input.text = isNaN(value)?"":value;
			if(this.optional)this.checkbox.value = (!isNaN(value));
			if(onChange)onChange();
		},

		getValue : function(){
			return !this.optional || this.checkbox.value?this.value:null;
		}
	};
	pack.NumberControl = NumberControl;
})(smartExport)