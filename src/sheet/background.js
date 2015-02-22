/*
 * Background
 */

define([
], function(){
    return [
        "background2d",
        ["context", "width", "height"],
        {
            bg_color: "#eee",
            stroke_width: 1,
            stroke_color: "#666"
        },
        function(context, width, height, options){
            var g = context
                    .append("g")
                    .attr("class", "background");

            g
                .append("rect")
                .attr({
                    "x" : 0,
                    "y" : 0,
                    "width" : width,
                    "height" : height,
                    "fill" : options.bg_color,
                    "stroke": options.stroke_color,
                    "stroke-width": options.stroke_width
                });

            return g;
        }
    ];
});
