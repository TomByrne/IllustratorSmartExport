(function(pack){
	function RangeControl(container, min, max, value, unit){
		this.init(container, min, max, value, unit);
		return this;
	}



	RangeControl.prototype={
	    onChange:null,

		init:function(container, min, max, value, unit){
			var scopedThis = this;

			if(unit==null)unit = '';
			if(value==null)value = min;

			this.unit = unit;
			this.value = value;
			this.min = min;
			this.max = max;

			var row = container.add("group");
			row.orientation = "row";

			this.slider = row.add("slider", undefined, value, min, max);
			this.slider.preferredSize = [145, 20];
			this.slider.onChanging = function(){
				scopedThis.setValue(parseInt(scopedThis.slider.value));
			}

			this.input = row.add('edittext', undefined, value+unit);
			this.input.preferredSize = [45, 20];
			this.input.onChange = function(){
				scopedThis.setValue(parseInt(scopedThis.input.text));
			}
		},
		setValue : function(value){
			if(isNaN(value))value = this.min;
			else if(value < this.min)value = this.min;
			else if(value > this.max)value = this.max;
			this.value = value;
			this.input.text = value+this.unit;
			this.slider.value = value;
			if(onChange)onChange();
		},

		getValue : function(){
			return this.value;
		}
	};
	pack.RangeControl = RangeControl;
})(smartExport)