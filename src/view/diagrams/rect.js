define([
    'underscore',
    'core/manager'
],function(_, Manager){
    function Rect(parent, scales, data, options){
	if(arguments.length>3){
	    _.extend(options,{
		x:'',
		y:'',
		width:'',
		height:'',
		color:'#ff0000'
	    });
	}

	_.each(data, function(val,key){
	    
	});

	var model = parent.append("g");


	return this;
    }

    Rect.prototype.zoom = function(){

    }

    return Rect;
});
