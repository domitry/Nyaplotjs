define([
    'underscore',
    "core",
    "state"
],function(_, core, State){
    /*
     * Interactive layer using d3.behavior.zoom
     * Plots created from descrete data are not supported due to d3.behavior.zoom.
     */
    return [
        "interactive_wheel",
        ["context", "stage_uuid", "xscale", "yscale", "updates", "size"],
        {},
        function(context, stage_uuid, xscale, yscale, updates, size, options){
            core.on_parsed(stage_uuid, function(){
                var root = d3.select(context.node().parentNode);

                root.call(d3.behavior.zoom()
                          .size(size)
                          .x(xscale)
                          .y(yscale)
                          .on("zoom", function(){
                              _.each(updates, function(state){
                                  state.update();
                              });
                          }));
            });

            return new State();
	    }
    ];
});
