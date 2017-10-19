closure = function(scope, meth, args, passArgs, passMethod){
	if(passArgs){
		var ret = function(){
			var args2 = Array.prototype.slice.call(arguments);
			return meth.apply(scope, args2.concat(args));
		}
	}else{
		if(!args) args = [];
		var ret = function(){
			return meth.apply(scope, args);
		}
	}
	if(passMethod){
		if(!args)args = [ret];
		else args.push(ret);
	}
	return ret;
}