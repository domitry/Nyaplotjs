define([
    'underscore',
    'd3'
],function(_, d3){
    return [
        "histogram",
        ["data", "value", "position", "scalex"],
        {
            bin_num: 20,
            width: 0.9,
            color:'steelblue',
            stroke_color: 'black',
            stroke_width: 1,
            hover: true
        },
        function(context, data, value_label, position, scalex, options){
            var column = _.map(data.asarray(), function(row){return row[value_label];});
            var pos1 = position('x', 'y'), pos2 = position('dx', 'y');

            var rects = context.selectAll("rect").data(
                d3.layout.histogram()
                    .bins(scalex.ticks(options.bin_num))(column)
            );

            rects.enter().append("rect").attr("height", 0).attr("y", pos1.y({y: 0}));

            rects
                .attr("x", pos1.x)
                .attr("width", function(d){return pos2.x(d) - pos2.x({'dx': 0});})
                .attr("fill", options.color)
                .attr("stroke", options.stroke_color)
                .attr("stroke-width", options.stroke_width)
                .transition().duration(200)
                .attr("y", pos1.y)
                .attr("height", function(d){return pos1.y({y: 0}) - pos1.y(d);})
                .style("visibility", options.visible ? "visible" : "hidden");

            return rects;
        }
    ];
});
