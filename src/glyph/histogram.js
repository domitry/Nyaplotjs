/*
 * Histogram: Histogram
 *
 * Caluculate hights of each bar from column specified by 'value' option and create histogram.
 * See the page of 'd3.layout.histogram' on d3.js's website to learn more. (https://github.com/mbostock/d3/wiki/Histogram-Layout)
 * 
 *
 * options:
 *    value        -> String: column name. Build histogram based on this data.
 *    bin_num      -> Float : number of bin
 *    width        -> Float : 0..1, width of each bar.
 *    color        -> Array : color in which bars filled.
 *    stroke_color -> String: stroke color
 *    stroke_width -> Float : stroke width
 *    hover        -> Bool  : set whether pop-up tool-tips when bars are hovered.
 *    tooltip      -> Object: instance of Tooltip. set by pane.
 *
 * example:
 *    http://bl.ocks.org/domitry/f0e3f5c91cb83d8d715e
 */

define([
    'underscore'
],function(_){
    return [
        "histogram",
        ["context", "data", "value", "position", "scalex"],
        {
            bin_num: 20,
            width: 0.9,
            color:'steelblue',
            stroke_color: 'black',
            stroke_width: 1,
            hover: true
        },
        function(context, data, value, position, scalex, options){
            data = data.data;
            var column = _.map(data, function(row){return row[value];});

            var rects = context.selectAll("rect").data(
                d3.layout.histogram()
                    .bins(scalex.ticks(options.bin_num))(column)
            );

            rects.enter().append("rect").attr("height", 0).attr("y", position(0, 0).y);

            rects
                .attr("x",function(d){return position(d.x, 0).x;})
                .attr("width", function(d){return position(d.dx, 0).x - position(0, 0).x;})
                .attr("fill", options.color)
                .attr("stroke", options.stroke_color)
                .attr("stroke-width", options.stroke_width)
                .transition().duration(200)
                .attr("y", function(d){return position(0, d.y).y;})
                .attr("height", function(d){return position(0, 0).y - position(0, d.y).y;});

            return rects;
        }
    ];
});
