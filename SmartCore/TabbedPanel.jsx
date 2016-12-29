(function(pack){
	function TabbedPanel(container){
		this.init(container);
		return this;
	}

	TabbedPanel.useNative = (parseInt(app.version) > 20 && $.os.indexOf("Win")!=-1);

	if(TabbedPanel.useNative){
		TabbedPanel.prototype={
		    onChange:null,

			init:function(container){
				var scopedThis = this;

				this.tabPanel = container.add("tabbedpanel");
				this.tabPanel.orientation = 'row';
				this.items = [];
			},
			onDropdownChange:function(){
				if(this.selection == this.tabPanel.selection.index) return;
				this.selection = this.tabPanel.selection.index;
				if(this.onChange!=null) this.onChange();
			},
			setSelection:function(selectedInd){
				this.selection = selectedInd;
				var totalItems = (this.items==null ? 0 : this.items.length);
				if(selectedInd > totalItems-1) selectedInd = totalItems-1;
				this.tabPanel.selection = selectedInd;
			},
			add:function(label){
				this.items.push(label);
				return this.tabPanel.add("tab", undefined, label);
			}
		};

	}else{


		function indexOf ( array, element ) {
			for(var i=0; i<array.length; i++){
				if(array[i]==element)return i;
			}
			return -1;
		}

		TabbedPanel.prototype={
		    onChange:null,

			init:function(container){
				var scopedThis = this;

				this.panels = [];
				this.buttons = [];

				this.column = container.add("group");
				this.column.orientation = "column";
				this.column.alignChildren = ["left", "center"];
				this.column.margins = [0, 0, 0, 0];
				this.column.spacing = 0;

				this.row = this.column.add("group");
				this.row.orientation = "row";
				this.row.alignChildren = ["left", "center"];
				this.row.margins = [0, 0, 0, 0];
				this.row.spacing = 0;

				this.container = this.column.add("group");
				this.container.orientation = "stack";
				this.container.alignChildren = ["left", "top"];
				this.container.margins = [0, 0, 0, 0];
				this.container.spacing = 0;
			},
			setSelection:function(selectedInd){
				this.selection = selectedInd;
				for(var i=0; i<this.buttons.length; i++){
					var button = this.buttons[i];
					var panel = this.panels[i];

					button.value = (selectedInd == i);
					panel.visible = (selectedInd == i);
				}

				try{
					if(this.onChange != null) this.onChange();
				}catch(e){
					alert(e);
				}
			},
			add:function(label){
				var scopedThis = this;
				var button = this.row.add("button", undefined, label);
				button.onClick = function(){
					scopedThis.setSelection(indexOf(scopedThis.buttons, button));
				}
				this.buttons.push(button);

				var panel = this.container.add("panel");
				this.panels.push(panel);

				if(this.panels.length == 1){
					this.setSelection(0);
				}else{
					panel.visible = false;
				}

				return panel;
			}
		};
	}

	pack.TabbedPanel = TabbedPanel;
})(smartExport)