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
    'underscore',
    'node-uuid',
    'core/manager',
    'view/components/filter'
],function(_, uuid, Manager, Filter){
    // pre-process data using function embeded in d3.js.
    var processData = function(column, scales, options){
        return d3.layout.histogram()
            .bins(scales.raw.x.ticks(options.bin_num))(column);
    };

    // update SVG dom nodes based on pre-processed data.
    var updateModels = function(selector, scales, options){
        selector
            .attr("x",function(d){return scales.get(d.x, 0).x;})
            .attr("width", function(d){return scales.get(d.dx, 0).x - scales.get(0, 0).x;})
            .attr("fill", options.color)
            .attr("stroke", options.stroke_color)
            .attr("stroke-width", options.stroke_width)
            .transition().duration(200)
            .attr("y", function(d){return scales.get(0, d.y).y;})
            .attr("height", function(d){return scales.get(0, 0).y - scales.get(0, d.y).y;})
            .attr("id", uuid.v4());
    };

    return function(context, scales, df_id, _options){
        var options = {
            title: 'histogram',
            value: null,
            bin_num: 20,
            width: 0.9,
            color:'steelblue',
            stroke_color: 'black',
            stroke_width: 1,
            hover: true,
            tooltip:null,
            legend: true
        };
        if(arguments.length>3)_.extend(options, _options);

        var df = Manager.getData(df_id);

        var column_value = df.columnWithFilters(uuid, options.value);
        var data = processData(column_value, scales, options);

        var models = context.selectAll("rect").data(data);
        models.enter().append("rect").attr("height", 0).attr("y", scales.get(0, 0).y);
        updateModels(models,  scales, options);

        return models;
    };
});
