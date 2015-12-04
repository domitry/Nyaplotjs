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
 *
 * example:
 *    http://bl.ocks.org/domitry/f0e3f5c91cb83d8d715e
 */

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
                .attr("height", function(d){return pos1.y({y: 0}) - pos1.y(d);});

            return rects;
        }
    ];
});
