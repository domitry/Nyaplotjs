/*
 * Scatter: Scatter and Bubble chart
 *
 * Scatter chart. This can create bubble chart when specified 'size_by' option.
 * Tooltip, fill_by, size_by options should be implemented to other charts refering to this chart.
 *
 *
 * options:
 *    x,y             -> String: column name. both of continuous and descrete data are allowed.
 *    fill_by         -> String: column name. Fill vectors according to this column. (c/d are allowd.)
 *    shape_by        -> String: column name. Fill vectors according to this column. (d is allowd.)
 *    size_by         -> String: column name. Fill vectors according to this column. (c/d are allowd.)
 *    color           -> Array : Array of String.
 *    shape           -> Array : Array of String.
 *                       ['circle','triangle-up', 'diamond', 'square', 'triangle-down', 'cross']
 *    size            -> Array : Array of Float. specified when creating bubble chart.
 *    stroke_color    -> String: stroke color.
 *    stroke_width    -> Float : stroke width.
 *    hover           -> Bool  : set whether pop-up tool-tips when bars are hovered.
 *    tooltip-contents-> Array : Array of column name. Used to create tooltip on points when hovering them.
 *    tooltip         -> Object: instance of Tooltip. set by pane.
 *
 * example:
 *    http://bl.ocks.org/domitry/78e2a3300f2f27e18cc8
 *    http://bl.ocks.org/domitry/308e27d8d12c1374e61f
 */

require([
    'underscore',
    'parser/glyph'
],function(_, glyph){
    glyph.register_glyph(
        "scatter",
        ["context", "data", "position"],
        {
            color: "steelblue",
            shape: "circle",
            size: 100,
            stroke_color: 'black',
            stroke_width: 1,
            hover: true
        },
        function(context, data, position, options){
            var shapes = context.selectAll("path").data(data);

            shapes
                .enter()
                .append("path")
                .attr("transform", function(row) {
                    var d = position(row);
                    return "translate(" + d.x + "," + d.y + ")"; })
                .attr("fill", options.color)
                .attr("stroke", options.stroke_color)
                .attr("stroke-width", options.stroke_width)
                .transition().duration(200)
                .attr("d", d3.svg.symbol().type(options.shape).size(options.size));

            return shapes;
        }
    );
});
