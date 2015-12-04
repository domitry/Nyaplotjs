define([
    'underscore'
], function(_){
    return [
        "circle",
        ["data", "x", "y", "position"],
        {
            radius: 100,
            color: "steelblue",
            stroke_width: 1,
            stroke_color: "black"
        },
        function(context, data, cx, cy, position, options){
            var pos = position(cx, cy);
            return context
                .selectAll("circle")
                .data(data.asarray())
                .enter()
                .append("circle")
                .attr({
                    cx: pos.x,
                    cy: pos.y,
                    r: options.radius,
                    fill: options.color,
                    stroke_width: options.stroke_width,
                    stroke: options.stroke_color
                });
        }
    ];
});
