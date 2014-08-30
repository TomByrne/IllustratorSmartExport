(function(pack){
	function Queue(timeAllowance, progressHandler){
		this.timeAllowance = timeAllowance;
		this.progressHandler = progressHandler;
		return this;
	}

	Queue.prototype={
		type:Queue,
		running:false,
		queue:[],
		total:0,
		progress:0,
		timeDefecit:0,
		label:"",
		start:function(){
			if(this.running)return;
			this.running = true;
			this.timeDefecit = 0;
			if(this.queue.length)this.doFrame();
			return this;
		},

		stop:function(reset){
			if(!this.running)return;
			this.running = false;
			if(reset)this.reset();
			return this;
		},

		reset:function(){
			this.queue = [];
			this.total = 0;
			this.progress = 0;
			this.timeDefecit = 0;
			this.updateProgress();
			return this;
		},

		add:function(scope, meth, args, label, count, autoRemove){
			if(autoRemove===undefined)autoRemove = true;

			this.queue.push({handler:closure(scope, meth, args), count:count, label:label, run:0, autoRemove:autoRemove});
			this.total += count;
			this.updateProgress();

			if(this.running)this.doFrame();
		},
		updateCurrent:function(scope, meth, args, subLabel){
			var curr = this.queue[0];
			curr.handler = closure(scope, meth, args);
			if(subLabel)curr.subLabel = subLabel;
		},
		removeCurrent:function(){
			this.queue.shift();
		},

		doFrame:function(){
			if(!this.running)return;
			
			if(this.timeDefecit > this.timeAllowance){
				this.timeDefecit -= this.timeAllowance;
				pack.Timer.addFrameHandler(this, this.doFrame);
				return;
			}
			//fl.trace("--------------FRAME------------ ");
			var maxTime = getTimer() + this.timeAllowance - this.timeDefecit;
			while(getTimer() < maxTime && this.queue.length){
				var curr = this.queue[0];
				this.label = curr.label + (curr.subLabel?" - "+curr.subLabel:"");
				curr.handler();
				if(curr != this.queue[0]){
					this.label = "";
					// was removed
					if(curr.run < curr.count)this.progress += curr.count-curr.run;
				}else{
					curr.run++;
					if(curr.run <= curr.count){
						this.progress++;
						if(curr.autoRemove && curr.run == curr.count){
							this.removeCurrent();
						}
					}
				}
			}
			this.timeDefecit = getTimer() - maxTime;
			if(this.queue.length){
				pack.Timer.addFrameHandler(this, this.doFrame);
			}else{
				this.label = "";
				this.progress = 0;
				this.total = 0;
			}
			this.updateProgress();
		},
		updateProgress:function(){
			if(this.progressHandler)this.progressHandler(this.progress, this.total);
		}
	};
	pack.Queue = Queue;
})(smartExport)