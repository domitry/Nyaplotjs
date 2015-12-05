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
            interpolate: 'linear',
            transpose: false,
            opacity: 0.6
        },
        function(context, data, xlabel, y0label, y1label, position, options){
            var path = (context.select("path").node()==null ? context.append("path") : context.select("path"));
            var area = area = d3.svg.area().interpolate(options.interpolate);
            
	        path.datum(data.asarray());
            
            if(options.transpose){
                var ylabel = xlabel;
                var x0label = y0label;
                var x1label = y1label;

                area
                    .y(position(x0label, ylabel).y)
                    .x0(position(x0label, ylabel).x)
                    .x1(position(x1label, ylabel).x);
            }else{
                area
                    .x(position(xlabel, y0label).x)
                    .y0(position(xlabel, y0label).y)
                    .y1(position(xlabel, y1label).y);
            }


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
