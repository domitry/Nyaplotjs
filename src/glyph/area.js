define([
    'underscore',
    'd3'
],function(_, d3){
    return [
        "area",
        ["data", "x", "y0", "y1", "position"],
        {
            color:'steelblue',
            stroke_width: 0,
            stroke_color: 'none',
            opacity: 0.6
        },
        function(context, data, xlabel, y0label, y1label, position, options){
            var path = (context.select("path").node()==null ? context.append("path") : context.select("path"));
	        path.datum(data.asarray());

            var area = d3.svg.area()
                    .x(position(xlabel, y0label).x)
                    .y0(position(xlabel, y0label).y)
                    .y1(position(xlabel, y1label).y);

            return path
                .attr("d", area)
                .attr("stroke", options.stroke_color)
                .attr("stroke-width", options.stroke_width)
                .attr("fill", options.color)
                .attr("fill-opacity", options.opacity)
                .style("visibility", options.visible ? "visible" : "hidden");
        }
    ];
});
