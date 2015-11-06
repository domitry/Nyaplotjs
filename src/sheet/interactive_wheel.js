define([
    'underscore',
    "core"
],function(_, core){
    return [
        "interactive_wheel",
        ["context", "stage_uuid"],
        {},
        function(context, stage_uuid, options){
	    core.on_parsed(stage_uuid, function(){
		var root = d3.select(context.node().parentNode);
		root.on("wheel", function(e){
		    d3.event.preventDefault();
		    console.log("hello");
		});
	    });
	}
    ];
});
