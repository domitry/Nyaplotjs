define([
    'underscore',
    'd3'
],function(_, d3){
    return [
        "vectors",
        ["data", "x1", "y1", "x2", "y2", "position"],
        {
            color:'#000',
            fill_color: '#000',
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
                        fill: options.color
                    });
            }
            
            shapes.enter()
                .append("line")
                .attr({
                    'fill': options.fill_color,
                    'stroke': options.color,
                    'stroke-width':options.stroke_width,
                    'marker-end': (options.with_arrow ? 'url(#arrow)' : 'none')
                });

            shapes
                .attr({
                    'x1': p1.x,
                    'x2': p2.x,
                    'y1': p1.y,
                    'y2': p2.y
                })
                .style("visibility", options.visible ? "visible" : "hidden");

            return shapes;
        }
    ];
});

