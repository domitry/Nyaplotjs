define([
    'underscore'
],function(_){
    return [
        "vectors",
        ["context", "data", "x1", "y1", "x2", "y2", "position"],
        {
            color:'steelblue',
            stroke_color: '#000',
            stroke_width: 2
        },
        function(context, data, x1, y1, x2, y2, position, options){
            var shapes = context.selectAll("line").data(data.asarray());
            var p1 = position(x1, y1), p2 = position(x2, y2);
            
            shapes.enter()
                .append("line")
                .attr({
                    'x1': p1.x,
                    'x2': p1.y,
                    'y1': p2.x,
                    'y2': p2.y,
                    'fill': options.color,
                    'stroke': options.stroke_color,
                    'stroke-width':options.stroke_width
                });

            return shapes;
        }
    ];
});
