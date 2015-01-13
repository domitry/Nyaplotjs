/*
 * Background
 */

define([
], function(){
    return {
        func: function(context, options){
            var g = context
                    .append("g")
                    .attr("class", "background");

            g
                .append("rect")
                .attr({
                    "x" : 0,
                    "y" : 0,
                    "width" : options.width,
                    "height" : options.height,
                    "fill" : options.bg_color,
                    "stroke": options.stroke,
                    "stroke-width": options.stroke_width
                });

            return g;
        },
        required_args: ["context"],
        optional_args: {
            width: 500,
            height: 500,
            bg_color: "#eee",
            stroke_width: 1,
            stroke: "#666"
        }
    };
});
