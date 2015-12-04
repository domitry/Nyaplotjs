define([
    'underscore'
], function(_){
    return [
        "text",
        ["data", "x", "y", "position"],
        {
            text: "",
            color: "black",
            font_size: 16,
            text_anchor: "start",
            dominant_baseline: "middle"
        },
        function(g, data, x, y, position, options){
            var pos = position(x, y);
            g
                .selectAll("text")
                .data(data.asarray())
                .enter()
                .append("text")
                .attr({
                    fill: options.color,
                    "font-size": options.font_size,
                    "text-anchor": options.text_anchor,
                    "dominant-baseline": options.dominant_baseline
                })
                .text(options.text);

            return g
                .selectAll("text")
                .attr({
                    x: pos.x,
                    y: pos.y
                });
        }
    ];
});
