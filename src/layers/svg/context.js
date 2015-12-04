/**
 Prevent glyphs going outside of a fixed area
*/
define([
    "underscore",
    "utils/uuid"
], function(_, uuid){
    return [
        "context",
        [],
        {
            width: "auto",
            height: "auto",
            x_align: "left",
            y_align: "top",
            children: []
        },
        function(g, options){
            var unique_id = uuid() + "clip";
            
            _.each(["width", "height"], function(p){
                if(options[p] == "auto")
                    options[p] = _.max(options.children, function(c){
                        return c[p];
                    })[p];
            });
            
            return g
                .attr("class", "context")
                .attr("clip-path","url(#" + unique_id + ")")
                .append("clipPath")
                .attr("id", unique_id)
                .append("rect")
                .attr({
                    "x" : 0,
                    "y" : 0,
                    "width" : options.width,
                    "height" : options.height
                });
        }
    ];
});
