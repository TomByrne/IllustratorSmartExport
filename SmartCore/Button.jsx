(function(pack){
	function Button(container, label, style){
		this.init(container, label, style);
		return this;
	}

	Button.STYLE_MAIN_TAB = "mainTab";
	Button.STYLE_MAIN_TAB_OUTPUT = "mainTab.output";


	Button.prototype={
	    onClick:null,

		init:function(container, label, style){
			var scopedThis = this;

			this.nativeButton = container.add("button", undefined, label);
			this.nativeButton.onClick = closure(this, this.onButtonClick);

			if(style != null){
				var g = this.nativeButton.graphics;
				this.hPadding = 0;
				this.vPadding = 0;
				this.backingOffset = 0;
				var origFont = this.nativeButton.graphics.font;
				if(style == Button.STYLE_MAIN_TAB || style == Button.STYLE_MAIN_TAB_OUTPUT){
					var darkGrey = 0x40 / 0xff;
					var normalGrey = 0x49 / 0xff;

					this.normalBacking = g.newBrush(g.BrushType.SOLID_COLOR, [darkGrey, darkGrey, darkGrey, 1]);
					this.activeBacking = g.newBrush(g.BrushType.SOLID_COLOR, [normalGrey, normalGrey, normalGrey, 1]);

					//this.normalPen = g.newPen (g.PenType.SOLID_COLOR, [1, 1, 1, 1], 1);
					this.activePen = g.newPen (g.PenType.SOLID_COLOR, [1, 1, 1, 1], 5);

					this.textPen = g.newPen (g.PenType.SOLID_COLOR, [1, 1, 1, 1], 1);
					this.font = ScriptUI.newFont( origFont.name,  ScriptUI.FontStyle.BOLD, 20 );
					this.hPadding = 8;
					this.vPadding = 8;
					this.uppercase = true;
					this.backingOffset = -1;

					if(style == Button.STYLE_MAIN_TAB_OUTPUT){
						this.normalBacking = g.newBrush(g.BrushType.SOLID_COLOR, [darkGrey * 0.9, darkGrey * 0.9, darkGrey, 1]);
						this.activePen = g.newPen (g.PenType.SOLID_COLOR, [0.9, 0.9, 1, 1], 5);
					}
				}
				this.nativeButton.onDraw = closure(this, this.doDraw);
			}
		},
		doDraw:function(){
			var but = this.nativeButton;
			var g = but.graphics;
			var width;
			var height;
			if(but.size != null){
				width = but.size[0];
				height = but.size[1];
			}else{
				var measurements = g.measureString (but.text, this.font, but.maximumSize ? but.maximumSize[0] - this.hPadding * 2 : null);
				width = measurements[0] + this.hPadding * 2;
				height = measurements[0] + this.vPadding * 2;
			}
			g.rectPath(this.backingOffset, this.backingOffset, width - this.backingOffset * 2, height - this.backingOffset * 2);
			if(but.active && this.activeBacking){
				g.fillPath(this.activeBacking);
			}else{
				if(this.normalBacking != null) g.fillPath(this.normalBacking);
			}

			g.newPath();
			g.moveTo(0, 0);
			g.lineTo(0, height);
			if(but.active && this.activePen){
				g.strokePath(this.activePen);
			}else{
				if(this.normalPen != null) g.strokePath(this.normalPen);
			}

			if(but.text){
				var measurements = g.measureString (but.text, this.font, width - this.hPadding * 2);
				var x = (width - measurements[0]) / 2;
				var y = (height - measurements[1]) / 2;

				var text = but.text;
				if(this.uppercase){
					text = text.toUpperCase();
				}
				g.drawString(text, this.textPen, x, y, this.font);
			}
		},
		setSize:function(w, h){
			if(w == null || h == null){
				this.nativeButton.size = null;
			}else{
				this.nativeButton.size = [w, h];
				if(this.path != null){
					this.path
				}
			}
		},
		setAlignment:function(h, v){
			if(h == null || v == null){
				this.nativeButton.alignment = null;
			}else{
				this.nativeButton.alignment = [h, v];
			}
		},
		setText:function(text){
			this.nativeButton.text = text;
			this.nativeButton.notify("onDraw");
		},
		setHelpTip:function(text){
			this.nativeButton.helpTip = text;
		},
		setActive:function(active){
			this.nativeButton.active = active;
			this.nativeButton.notify("onDraw");
		},
		setEnabled:function(enabled){
			this.nativeButton.enabled = enabled;
			this.nativeButton.notify("onDraw");
		},
		onButtonClick:function(){
			if(this.onClick) this.onClick();
		}
	};

	pack.Button = Button;
})(smartExport)