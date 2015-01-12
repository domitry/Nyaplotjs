/*
 * Bar chart
 *
 * This diagram has two mode, ordinal-mode and count-mode. The former creates bar from x and y column.
 * The latter counts unique value in 'value' column and generates bar from the result.
 * 
 *
 * options:
 *    value   -> String: column name. set when you'd like to build bar chart based on one-dimention data
 *    x, y    -> String: column name. x should be discrete. y should be continuous.
 *    width   -> Float : 0..1, width of each bar.
 *    color   -> Array : color in which bars filled.
 *    hover   -> Bool  : set whether pop-up tool-tips when bars are hovered.
 *    tooltip -> Object: instance of Tooltip. set by pane.
 *
 * example:
 *    specified 'value' option : http://bl.ocks.org/domitry/b8785f02f36deef567ce
 *    specified 'x' and 'y' : http://bl.ocks.org/domitry/2f53781449025f772676
 */

define([
    'underscore',
    'node-uuid'
],function(_, uuid){
    // process data as:
    //     x: [1,2,3,...], y: [4,5,6,...] -> [{x: 1, y: 4},{x: 2, y: 5},...]
    var processData = function(x, y, options){
        return _.map(_.zip(x,y),function(d, i){return {x:d[0], y:d[1]};});
    };

    // update dom object
    var updateModels = function(selector, scales, options, color_scale){
        var width = scales.raw.x.rangeBand()*options.width;
        var padding = scales.raw.x.rangeBand()*((1-options.width)/2);

        selector
            .attr("x",function(d){return scales.get(d.x, d.y).x + padding;})
            .attr("width", width)
            .attr("fill", function(d){return color_scale(d.x);})
            .transition().duration(200)
            .attr("y", function(d){return scales.get(d.x, d.y).y;})
            .attr("height", function(d){return scales.get(0, 0).y - scales.get(0, d.y).y;})
            .attr("id", uuid.v4());
    };

    // count unique value. called when 'value' option was specified insead of 'x' and 'y'
    var countData = function(values){
        var hash = {};
        _.each(values, function(val){
            hash[val] = hash[val] || 0;
            hash[val] += 1;
        });
        return {x: _.keys(hash), y: _.values(hash)};
    };

    return function(context, scales, df, _options){
        var options = {
            value: null,
            x: null,
            y: null,
            width: 0.9,
            color: null,
            hover: true,
            tooltip_contents:null,
            tooltip:null,
            legend: true
        };
        if(arguments.length>3)_.extend(options, _options);

        var color_scale;
        if(options.color == null) color_scale = d3.scale.category20b();
        else color_scale = d3.scale.ordinal().range(options.color);

        var data;
        if(options.value !== null){
            var column_value = df.columnWithFilters(uuid, options.value);
            var raw = countData(column_value);
            data = processData(raw.x, raw.y, options);
        }else{
            var column_x = df.columnWithFilters(uuid, options.x);
            var column_y = df.columnWithFilters(uuid, options.y);
            data = processData(column_x, column_y, options);
        }

        var rects = context.selectAll("rect").data(data);
        rects.enter().append("rect")
            .attr("height", 0)
            .attr("y", scales.get(0, 0).y);

        updateModels(rects, scales, options, color_scale);

        return ;
    };
});
