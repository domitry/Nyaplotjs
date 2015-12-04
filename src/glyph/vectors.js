define([
    'underscore'
],function(_){
    return [
        "vectors",
        ["data", "x1", "y1", "x2", "y2", "position"],
        {
            color:'steelblue',
            stroke_color: '#000',
            stroke_width: 2,
            with_arrow: false
        },
        function(context, data, x1, y1, x2, y2, position, options){
            var shapes = context.selectAll("line").data(data.asarray());
            var p1 = position(x1, y1), p2 = position(x2, y2);

            if(options.with_arrow){
                context.append("defs").append("marker")
                    .attr({
                        id: "arrow",
                        viewBox: '0 0 10 10',
                        refX: 8,
                        refY: 5,
                        markerWidth: 4,
                        markerHeight: 4,
                        orient: "auto"
                    })
                    .append('path')
                    .attr({
                        d: 'M10 5 0 0 0 10Z',
                        stroke: 'none',
                        fill: 'black'
                    });
            }
            
            shapes.enter()
                .append("line")
                .attr({
                    'x1': p1.x,
                    'x2': p1.y,
                    'y1': p2.x,
                    'y2': p2.y,
                    'fill': options.color,
                    'stroke': options.stroke_color,
                    'stroke-width':options.stroke_width,
                    'marker-end': (options.with_arrow ? 'arrow' : 'none')
                });

            return shapes;
        }
    ];
});
