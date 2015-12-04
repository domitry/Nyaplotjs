define([
    'underscore',
    'd3'
], function(_, d3){
    return [
        "circle",
        ["data", "x", "y", "position"],
        {
            radius: 100,
            color: "steelblue",
            stroke_color: "black",
            stroke_width: 0.0,
            opacity: 1.0
        },
        function(g, data, cx, cy, position, options){
            var pos = position(cx, cy);
            
            g
                .selectAll("circle")
                .data(data.asarray())
                .enter()
                .append("circle")
                .attr({
                    r: 1.0,
                    fill: options.color,
                    "stroke-width": options.stroke_width,
                    "fill-opacity": options.opacity,
                    "stroke-opacity": options.opacity,
                    stroke: options.stroke_color
                });

            g.selectAll("circle")
                .attr({
                    cx: pos.x,
                    cy: pos.y,
                    transform: function(d){
                        var next = {};
                        next[cx] = d[cx] + options.radius;
                        next[cy] = 0;
                        var sx = Math.abs(pos.x(d) - pos.x(next));

                        next[cx] = 0;
                        next[cy] = d[cy] + options.radius;
                        var sy = Math.abs(pos.y(d) - pos.y(next));

                        var cx_ = pos.x(d);
                        var cy_ = pos.y(d);

                        return "matrix(" + sx + ",0,0," + sy + "," + (cx_-sx*cx_).toString() + "," + (cy_-sy*cy_).toString() + ")";
                    }
                });
        }
    ];
});
