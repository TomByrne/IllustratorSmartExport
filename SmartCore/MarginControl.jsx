(function(pack){
	function MarginControl(container, linkable, rect, linked){
		this.init(container, linkable, rect, linked);
		return this;
	}

	MarginControl.prototype={
	    onChange:null,

		init:function(container, linkable, rect, linked){
			var scopedThis = this;

			var enableList = [];

			var col = container.add("group");
			col.orientation = "column";
			col.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.CENTER];

			var hasValue = (rect!=null);
			this.active = hasValue;

			this.margins = hasValue ? rect.concat() : [0,0,0,0];

			var row = col.add("group");
			row.orientation = "row";
			row.spacing = 5;
			row.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.CENTER];

			var inputLabel = row.add("statictext", [0,0, 50, 20], "Top:");
			this.topInput = row.add('edittext', [0,0, 35, 20], this.margins[1]);
			this.topInput.onChange = closure(this, this.onInputChange);
			enableList.push(inputLabel);
			enableList.push(this.topInput);

			var inputLabel = row.add("statictext", [0,0, 50, 20], "Left:");
			this.leftInput = row.add('edittext', [0,0, 35, 20], this.margins[0]);
			this.leftInput.onChange = closure(this, this.onInputChange);
			enableList.push(inputLabel);
			enableList.push(this.leftInput);

			if(linkable){

				var row = col.add("group");
				row.orientation = "row";
				row.alignment = [ScriptUI.Alignment.CENTER, ScriptUI.Alignment.CENTER];
				row.padding = 0;

				this.linkedCheckbox = row.add('checkbox', [0,0,16,16]);
				this.linkedCheckbox.value = linked;
				this.linkedCheckbox.onClick = closure(this, this.onLinkedChange);
				enableList.push(this.linkedCheckbox);
			}

			var row = col.add("group");
			row.orientation = "row";
			row.spacing = 5;
			row.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.CENTER];

			var inputLabel = row.add("statictext", [0,0, 50, 20], "Bottom:");
			this.bottomInput = row.add('edittext', [0,0, 35, 20], this.margins[3]);
			this.bottomInput.onChange = closure(this, this.onInputChange);
			enableList.push(inputLabel);
			enableList.push(this.bottomInput);

			var inputLabel = row.add("statictext", [0,0, 50, 20], "Right:");
			this.rightInput = row.add('edittext', [0,0, 35, 20], this.margins[2]);
			this.rightInput.onChange = closure(this, this.onInputChange);
			enableList.push(inputLabel);
			enableList.push(this.rightInput);

			this.enableList = enableList;

			if(this.linkedCheckbox)this.onLinkedChange();
			this.onInputChange();
			this.setEnabled(this.active);
		},

		onLinkedChange:function(){
			var isLinked = this.linkedCheckbox.value;
			this.leftInput.enabled = !isLinked;
			this.bottomInput.enabled = !isLinked;
			this.rightInput.enabled = !isLinked;
			this.onInputChange();
		},

		onInputChange:function(){
			if(this.linkedCheckbox && this.linkedCheckbox.value){
				var top = this.topInput.text;
				this.leftInput.text = top;
				this.bottomInput.text = top;
				this.rightInput.text = top;
			}
			this.margins = [this.leftInput.text, this.topInput.text, this.rightInput.text, this.bottomInput.text];
			// dispatch change
		},

		getMargins:function(){
			if(this.active){
				return this.margins;
			}else{
				return null;
			}
		},

		getLinked:function(){
			return (this.linkedCheckbox ? this.linkedCheckbox.value : false);
		},

		setEnabled:function(enable){
			this.active = enable;
			for(var i=0; i<this.enableList.length; i++){
				this.enableList[i].enabled = enable;
			}
			if(enable){
				this.onLinkedChange();
			}
		}
	};
	pack.MarginControl = MarginControl;
})(smartExport)