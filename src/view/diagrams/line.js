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
    'underscore',
    'core/manager',
    'view/components/filter',
    'view/components/legend/simple_legend'
],function(_, Manager, Filter, SimpleLegend){
    // pre-process data like: x: [1,3,..,3], y: [2,3,..,4] -> [{x: 1, y: 2}, ... ,{}]
    var processData = function(x_arr, y_arr, options){
        var df = df, length = x_arr.length;
        return _.map(_.zip(x_arr, y_arr), function(d){return {x:d[0], y:d[1]};});
    };

    // update SVG dom nodes based on pre-processed data.
    var updateModels = function(selector, scales, options){
        var onMouse = function(){
            d3.select(this).transition()
                .duration(200)
                .attr("fill", d3.rgb(options.color).darker(1));
        };

        var outMouse = function(){
            d3.select(this).transition()
                .duration(200)
                .attr("fill", options.color);
        };

        var line = d3.svg.line()
                .x(function(d){return scales.get(d.x, d.y).x;})
                .y(function(d){return scales.get(d.x, d.y).y;});

        selector
            .attr("d", line)
            .attr("stroke", options.color)
            .attr("stroke-width", options.stroke_width)
            .attr("fill", "none");
    };

    return function(context, scales, df_id, _options){
        var options = {
            title: 'line',
            x: null,
            y: null,
            color:'steelblue',
            fill_by : null,
            stroke_width: 2,
            legend: true
        };
        if(arguments.length>3)_.extend(options, _options);

        var df = Manager.getData(df_id);

        var data = processData(df.column(options.x), df.column(options.y), options);
        context.selectAll("path").remove();
        var path = context
                .append("path")
                .datum(data);
        
        updateModels(path, scales, options);

        return path;
    };
});
