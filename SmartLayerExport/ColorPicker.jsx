(function(pack){
	function ColorPicker(container, color, optional){
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


	/*
	 The line width, in pixels, for the main color swatch.
	 @type Number
	*/
	var kSwatchBorderWidth = 1;

	function drawRGBSwatch (drawingStateObj)
	{
		var gfx = this.graphics;
		gfx.strokePath (this.fillPen, this.boxPath);
		gfx.strokePath (this.shadowPen, this.boxPath);
	}
	function updateSwatch (swatchGrp, swatchBtn, rgbValue)
	{
		var swatchGfx = swatchGrp.graphics;
		swatchGfx.backgroundColor = swatchGfx.newBrush (swatchGfx.BrushType.SOLID_COLOR, rgbValue);
		swatchGfx.disabledBackgroundColor = swatchGfx.backgroundColor;
		swatchBtn.fillPen = swatchGfx.newPen (swatchGfx.PenType.SOLID_COLOR, rgbValue, kSwatchBorderWidth);
	}

	ColorPicker.prototype={
	    onChange:null,

		init:function(container, color, optional){
			var scopedThis = this;

			this.optional = optional;

			if(typeof(color)=="string")color = parseColor(color);

			var row = container.add("group");
			row.orientation = "row";
			row.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.CENTER];

			if(optional){
				this.checkbox = row.add('checkbox');
				this.checkbox.value = (color!=null);
				this.checkbox.size = [16, 16];
				/*this.checkbox.onClick = function(){
					scopedThis.input.enabled = scopedThis.checkbox.value;
					scopedThis.button.enabled = scopedThis.checkbox.value;
				}*/
			}

			this.input = row.add('edittext', undefined, formatColor(color));
			this.input.preferredSize = [65, 20];

			this.group = row.add("group");
			this.group.size = [16, 16];

			this.button = this.group.add("button");
			this.button.size = [16, 16];
			this.button.onDraw = drawRGBSwatch;

			this.button.onClick = function(){
				var color = $.colorPicker();
				if(color!=-1){
					scopedThis.checkbox.value = true;
					scopedThis.setColor(color);
				}
			}
			this.input.onChange = function(){
				scopedThis.setColorStr(scopedThis.input.text);
				scopedThis.checkbox.value = true;
			}
			var gfx = this.button.graphics;
			var btnW = this.button.size.width;
			var btnH = this.button.size.height;
			//	Define the top-left and bottom-right border paths
			var halfBorderW = kSwatchBorderWidth / 2;
			gfx.newPath();
			gfx.moveTo (halfBorderW, btnH - halfBorderW);
			gfx.lineTo (halfBorderW, halfBorderW);
			gfx.lineTo (btnW - halfBorderW, halfBorderW);
			gfx.lineTo (btnW - halfBorderW, btnH - halfBorderW);
			gfx.lineTo (halfBorderW, btnH - halfBorderW);
			this.button.boxPath = gfx.currentPath;

			this.button.shadowPen = gfx.newPen (gfx.PenType.SOLID_COLOR, [0, 0, 0, 1], kSwatchBorderWidth);

			/*if(optional && !this.checkbox.value){
				this.input.enabled = false;
				this.button.enabled = false;
			}*/

			this.rgbValue = colorToRGB(color);
			updateSwatch(this.group, this.button, this.rgbValue);
		},

		setColorStr : function(colStr){
			var color = parseColor(colStr);
			this.input.text = formatColor(color);
			this.rgbValue = colorToRGB(color);
			updateSwatch(this.group, this.button, this.rgbValue);
			if(this.onChange)this.onChange();
		},

		getColorStr : function(){
			return !this.optional || this.checkbox.value?formatColor(rgbToColor(this.rgbValue)):null;
		},

		setColor : function(color){
			this.input.text = formatColor(color);
			this.rgbValue = colorToRGB(color);
			updateSwatch(this.group, this.button, this.rgbValue);
			if(this.onChange)this.onChange();
		},

		getColor : function(){
			return !this.optional || this.checkbox.value?rgbToColor(this.rgbValue):null;
		}
	};
	pack.ColorPicker = ColorPicker;
})(smartExport)