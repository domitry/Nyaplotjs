define([
    'underscore'
], function(_){
    return [
        "text",
        ["data", "x", "y", "position"],
        {
            color: "black",
            font_size: 10,
            text_anchor: "middle"
        },
        function(context, data, text, x, y, position, options){
            var pos = position(x, y);
            return context
                .selectAll("text")
                .data(data.asarray())
                .enter()
                .append("text")
                .attr({
                    cx: pos.x,
                    cy: pos.y,
                    fill: options.color,
                    "font-size": options.font_size,
                    "text-anchor": options.text_anchor
                })
                .text(text);
        }
    ];
});
