(function(pack){
	function MainTabbedPanel(container, tabWidth, tabHeight){
		this.init(container, tabWidth, tabHeight);
		return this;
	}


	function indexOf ( array, element ) {
		for(var i=0; i<array.length; i++){
			if(array[i]==element)return i;
		}
		return -1;
	}

	MainTabbedPanel.prototype={
	    onChange:null,
	    selection:0,
	    showHandlers:[],
	    hideHandlers:[],

		init:function(container, tabWidth, tabHeight){
			var scopedThis = this;

			this.tabWidth = tabWidth;
			this.tabHeight = tabHeight;
			this.panels = [];
			this.buttons = [];

			this.column = container.add("group");
			this.column.orientation = "row";
			this.column.alignChildren = ["left", "center"];
			this.column.margins = [0, 0, 0, 0];
			this.column.spacing = 0;

			this.row = this.column.add("group");
			this.row.orientation = "column";
			this.row.alignChildren = ["left", "center"];
			this.row.margins = [0, 0, 0, 0];
			this.row.spacing = 0;

			this.container = this.column.add("group");
			this.container.orientation = "stack";
			this.container.alignChildren = ["left", "top"];
			this.container.margins = [0, 0, 0, 0];
			this.container.spacing = 0;

			var normalGrey = 0x48 / 0xff;
			this.container.graphics.backgroundColor = this.container.graphics.newBrush(this.container.graphics.BrushType.SOLID_COLOR, [normalGrey, normalGrey, normalGrey, 1]);
		},
		setSelection:function(selectedInd, userSelected){
			this.selection = selectedInd;
			var callMethods;
			for(var i=0; i<this.buttons.length; i++){
				var button = this.buttons[i];
				var panel = this.panels[i];

				button.setActive(selectedInd == i);
				var newVis = (selectedInd == i);
				if(panel.visible != newVis){
					panel.visible = newVis;
					try{
						if(newVis){
							var show = this.showHandlers[i];
							if(show != null){
								if(!callMethods) callMethods = [];
								callMethods.push(show);
							}
						}else{
							var hide = this.hideHandlers[i];
							if(hide != null){
								if(!callMethods) callMethods = [];
								callMethods.push(hide);
							}
						}
					}catch(e){
						alert("Error in Main Panel show/hide handler: "+e);
					}
				}
			}

			// Call after setting all visiblity for nicer transition
			if(callMethods){
				for(var i=0; i<callMethods.length; i++){
					callMethods[i]();
				}
			}

			try{
				if(this.onChange != null) this.onChange(userSelected);
			}catch(e){
				alert(e);
			}
		},
		add:function(label, style){
			var scopedThis = this;
			//var button = this.row.add("button", undefined, label);
			if(style == null) style = pack.Button.STYLE_MAIN_TAB;
			var button = new pack.Button(this.row, label, style);
			button.onClick = function(){
				scopedThis.setSelection(indexOf(scopedThis.buttons, button), true);
			}
			this.buttons.push(button);

			var panel = this.container.add("panel");
			this.panels.push(panel);

			if(this.panels.length == 1){
				this.setSelection(0);
			}else{
				panel.visible = false;
			}

			if(this.selection == this.buttons.length - 1){
				button.setActive(true);
			}

			for(var i=0; i<this.buttons.length; i++){
				var button = this.buttons[i];
				button.setSize(this.tabWidth, this.tabHeight / this.buttons.length);
			}

			return panel;
		},
		setTransHandlers:function(i, show, hide){

			this.showHandlers[i] = show;
			this.hideHandlers[i] = hide;
		}
	}

	pack.MainTabbedPanel = MainTabbedPanel;
})(smartExport)