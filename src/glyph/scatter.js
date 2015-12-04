define([
    'underscore',
    'd3'
],function(_, d3){
    return [
        "scatter",
        ["data", "x", "y", "position"],
        {
            color: "steelblue",
            shape: "circle",
            size: 100,
            stroke_color: 'black',
            stroke_width: 1,
            hover: true
        },
        function(context, data, xlabel, ylabel, position, options){
            var shapes = context.selectAll("path").data(data.asarray());
            var pos = position(xlabel, ylabel);

            shapes
                .enter()
                .append("path")
                .attr("fill", options.color)
                .attr("stroke", options.stroke_color)
                .attr("stroke-width", options.stroke_width)
                .attr("d", d3.svg.symbol().type(options.shape).size(options.size));
            
            context.selectAll("path")
                .attr("transform", function(d) {
                    return "translate(" + pos.x(d) + "," + pos.y(d) + ")"; })
                .style("visibility", options.visible ? "visible" : "hidden");

            return shapes;
        }
    ];
});
