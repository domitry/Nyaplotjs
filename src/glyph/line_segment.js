define([
    "underscore"
], function(_){
    return [
        "line_segment",
        ["context", "data", "x1", "y1", "x2", "y2"],
        {
            color: "steelblue"
        },
        function(context, data, x1, y1, x2, y2, options){
            return context
                .selectAll("line")
                .data(data)
                .enter()
                .append("line")
                .attr({
                    x1: x1,
                    y1: y1,
                    x2: x2,
                    y2: y2,
                    stroke: options.color
                });
        }
    ];
});
