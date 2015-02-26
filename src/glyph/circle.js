define([
    'underscore'
], function(_){
    return [
        "circle",
        ["context", "data", "cx", "cy"],
        {
            radius: 100,
            color: "steelblue",
            stroke_width: 1,
            stroke_color: "black"
        },
        function(context, data, cx, cy, options){
            return context
                .selectAll("circle")
                .data(data)
                .enter()
                .append("circle")
                .attr({
                    cx: cx,
                    cy: cy,
                    r: options.radius,
                    fill: options.color,
                    stroke_width: options.stroke_width,
                    stroke: options.stroke_color
                });
        }
    ];
});
