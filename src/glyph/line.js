/*
 * Line: Line chart
 *
 * Attention: 'Line' is totally designed to be used to visualize line chart for Mathematics. So it is not useful to visualize statistical data like stock price.
 * If you feel so, feel free to add options like 'shape', 'shape_by' and 'fill_by' to this chart and send pull-request.
 * Please be sure to refer to the code of other chart like scatter at that time.
 *
 *
 * options:
 *    title        -> String: title of this chart showen on legend
 *    x,y          -> String: column name.
 *    color        -> Array : color in which line is filled.
 *    stroke_width -> Float : stroke width.
 *
 * example:
 *    http://bl.ocks.org/domitry/e9a914b78f3a576ed3bb
 */

define([
    'underscore'
],function(_){
    return [
        "line",
        ["context", "data", "x", "y", "position"],
        {
            color:'steelblue',
            stroke_width: 2
        },
        function(context, data, x, y, position, options){
            data = data.data;
            var path = (context.select("path").node()==null ? context.append("path") : context.select("path"));
	        path.datum(data);

            var line = d3.svg.line()
                    .x(function(d){return position(d[x], d[y]).x;})
                    .y(function(d){return position(d[x], d[y]).y;});

            path
                .attr("d", line)
                .attr("stroke", options.color)
                .attr("stroke-width", options.stroke_width)
                .attr("fill", "none");

            return path;
        }
    ];
});
