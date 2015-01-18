/*
 * Background
 */

define([
    'parser/sheet'
], function(sheet){
    sheet.register_sheet(
        "background2d",
        ["context"],
        {
            width: 500,
            height: 500,
            bg_color: "#eee",
            stroke_width: 1,
            stroke: "#666"
        },
        function(context, options){
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
        });
});
