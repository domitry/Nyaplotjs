define([
    'underscore'
], function(_){
    return [
        "wheelzoom",
        ["xscale", "yscale"],
        {
            updates: [],
            width: "auto",
            height: "auto"
        },
        function(g, xscale, yscale, options){
            g.attr("class", "wheelzoom");
            var root = d3.select(g.node().parentNode);

            root.call(d3.behavior.zoom()
                      .size([options.width, options.height])
                      .x(xscale)
                      .y(yscale)
                      .on("zoom", function(){
                          _.each(options.updates, function(state){
                              state.construct();
                          });
                      }));
        }
    ];
});
