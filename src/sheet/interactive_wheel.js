define([
    'underscore',
    "core"
],function(_, core){
    /*
     * Interactive layer using d3.behavior.zoom
     * Plots created from descrete data are not supported due to d3.behavior.zoom.
     */
    return [
        "interactive_wheel",
        ["context", "stage_uuid", "size"],
        {},
        function(context, stage_uuid, xscale_uuid, yscale_uuid, size, options){
	    core.on_parsed(stage_uuid, function(){
		var root = d3.select(context.node().parentNode);
		var xscale = core.get(xscale_uuid);
		var yscale = core.get(yscale_uuid);
		
		root.call(d3.behavior.zoom()
			  .size(size)
			  .x(xscale)
			  .y(yscale)
			  .on("zoom", function(){
			      
			  }));
	    });
	}
    ];
});
