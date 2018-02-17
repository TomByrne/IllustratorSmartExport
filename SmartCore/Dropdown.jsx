(function(pack){
	function Dropdown(container, color, optional){
		this.init(container, color, optional);
		return this;
	}


	function pad(str, count, pad){
		while(str.length < count){
			str = pad + str;
		}
		return str;
	}

	function parseColor(colStr){
		colStr = colStr.split("#").join("");
		if(colStr.length>6)colStr = colStr.substr(colStr.length - 6, colStr.length);
		return parseInt(colStr, 16);
	}
	function formatColor(col){
		if(col==null)col = 0;
		return "#" + pad(col.toString(16), 6, "0");
	}
	function colorToRGB(col){
		if(col==null)col = 0;
		var ret = [];
		ret[0] = ((col >> 16) & 0xff) / 0xff;
		ret[1] = ((col >> 8) & 0xff) / 0xff;
		ret[2] =  (col & 0xff) / 0xff;
		return ret;
	}
	function rgbToColor(rgb){
		return Math.round(rgb[0] * 0xff)<<16 | Math.round(rgb[1] * 0xff)<<8 | Math.round(rgb[2] * 0xff);
	}

	Dropdown.useNative = ($.os.indexOf("Win")==-1);

	if(Dropdown.useNative){
		Dropdown.prototype={
		    onChange:null,

			init:function(container, items, selectedInd){
				var scopedThis = this;

				this.dropdown = container.add("dropdownlist");
				this.dropdown.onChange = function(){
					scopedThis.onDropdownChange();
				};

				this.setItems(items);
				this.setSelection(selectedInd);
			},
			onDropdownChange:function(){
				if(this.selection == this.dropdown.selection.index) return;
				this.selection = this.dropdown.selection.index;
				if(this.onChange!=null) this.onChange();
			},
			setItems:function(items){
				this.items = items;
				this.dropdown.removeAll();
				if(items != null){
					for(var i=0; i<items.length; i++){
						var data = items[i];
						var item = this.dropdown.add("item");

						if(!data.separator) item.text = data.label || data;
						data.separator = data.separator;
						item.enabled = data.separator ? false : data.active !== false;
					}
				}
				this.setSelection(this.selection);
			},
			setSize:function(width, height){
				this.dropdown.size = [width, height];
			},
			setSelection:function(selectedInd){
				this.selection = selectedInd;
				var totalItems = (this.items==null ? 0 : this.items.length);
				if(selectedInd > totalItems-1) selectedInd = totalItems-1;
				this.dropdown.selection = selectedInd;
			},
			setEnabled:function(value){
				this.dropdown.enabled = value;
			},
			open:function(){
				// Not supported
			},
			close:function(){
				// Not supported
			}
		};

	}else{

		Dropdown.prototype={
		    onChange:null,
		    selection:-1,

			init:function(container, items, selectedInd){
				var scopedThis = this;

				this.selection = -1;
				this.showing = false;

				this.group = container.add("group");
				this.group.orientation = "row";
				this.group.alignChildren = ["right", "center"];
				this.group.margins = [0, 0, 0, 0];
				this.group.spacing = 0;

				this.button = this.group.add('button');
				//this.button.titleLayout = { margins: [5, 2, 2, 30] };

				this.icon = this.group.add('iconbutton', undefined, ScriptUI.newImage (File(pack.directory+"/icons/dropdownArrow.png")));

				/*this.button = container.add('iconbutton', undefined,  ScriptUI.newImage (File(pack.directory+"/icons/dropdownArrow.png")));
				this.button.title = "Testing";
				this.button.titleLayout = { margins: [5, 2, 2, 3], alignment:["center", "center"] };*/

				this.button.onClick = function(){
					if(!scopedThis.showing){
						scopedThis.open();
					}
				}


				this.icon.onClick = this.button.onClick;

				this.listWindow = new Window("palette", undefined, undefined, {resizeable:false, closeButton:false, borderless:true});

				this.listbox = this.listWindow.add ('ListBox', [0, 0, 10, 10], '', 
										{numberOfColumns: 1, showHeaders: false, multiselect:false });
				this.listbox.enabled = true;
				this.listbox.active = true;

				this.listbox.onChange = function(){
					if(this.ignoreChanges) return;
					scopedThis.setSelection(scopedThis.listbox.selection.index);
				}

				this.listWindow.addEventListener("blur", function(){
					if(scopedThis.showing) scopedThis.close();
				});

				this.button.window.addEventListener("move", function(){
					if(scopedThis.showing) scopedThis.positionWindow();
				});

				this.setItems(items);
				this.setSelection(selectedInd);
			},
			setItems:function(items){
				this.items = items;
				this.listbox.removeAll();
				var maxWidth = 0;
				var stackHeight = 0;
				if(items != null){
					for(var i=0; i<items.length; i++){
						var data = items[i];
						var item = this.listbox.add("item");

						if(!data.separator) item.text = data.label || data;
						data.separator = data.separator;
						item.enabled = data.separator ? false : data.active !== false;

						if(!data.separator){
							this.button.text = item.text;
							if(maxWidth < this.button.preferredSize[0]){
								maxWidth = this.button.preferredSize[0];
							}
						}
						stackHeight += 22;
					}
				}
				if(this.width!=null && maxWidth < this.width){
					maxWidth = this.width;
				}
				if(maxWidth < this.listbox.preferredSize[0]){
					maxWidth = this.listbox.preferredSize[0];
				}
				if(stackHeight < this.listbox.preferredSize[1]){
					stackHeight = this.listbox.preferredSize[1];
				}
				this.listbox.size = [maxWidth, stackHeight];
				this.listWindow.size = [maxWidth, stackHeight];

				if(this.selection >= 0) this.setSelection(this.selection);
			},
			setSize:function(width, height){
				this.width = width;
				this.button.size = [width-this.icon.preferredSize[0], height];
				this.icon.size = [this.icon.preferredSize[0], height]
			},
			positionWindow:function(){
				//alert(this.button.window.frameLocation+"\n "+this.button.window.frameBounds+"\n"+this.button.window.frameSize+"\n"+this.button.window.bounds);
				var x = this.button.windowBounds[0] + this.button.window.bounds[0];
				var y = this.button.windowBounds[3] + this.button.window.bounds[1] + 10;
				this.listWindow.frameLocation = [x, y];
			},
			setSelection:function(selectedInd){

				this.close();
				var max = (this.items==null ? -1 : this.items.length-1);
				if(selectedInd > max){
					selectedInd = max;
				}
				if(this.selection == null) this.selection = -1;
				if(this.selection == selectedInd) return;


				this.selection = selectedInd;
				if(selectedInd == null || selectedInd == -1){
					this.button.text = "";
				}else{
					var item = this.items[selectedInd];
					this.button.text = item.label || item;
				}
				this.ignoreChanges = true;
				this.listbox.selection = this.items ? this.items[selectedInd] : null;
				this.ignoreChanges = false;

				try{
					if(this.onChange != null) this.onChange();
				}catch(e){
					alert(e);
				}
			},
			setEnabled:function(value){
				if(!value && this.showing) close();
				this.button.enabled = value;
				this.icon.enabled = value;
			},
			open:function(){
				this.showing = true;
				this.positionWindow();
				this.listWindow.show();
				this.listWindow.enabled = true;
				this.listbox.active = true;

			},
			close:function(){
				this.listWindow.enabled = false;
				this.listbox.active = false;
				this.showing = false;
				this.listWindow.hide();

			}
		};
	}
	pack.Dropdown = Dropdown;
})(smartExport)