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

define([
    'underscore'
],function(_){
    var processData = function(df, options){
        var labels = ['x', 'y', 'fill', 'size', 'shape'];
        var columns = _.map(['x', 'y'], function(label){return df.column(options[label]);});
        var length = columns[0].length;

        _.each([{column: 'fill_by', val: 'color'}, {column: 'size_by', val: 'size'}, {column: 'shape_by', val: 'shape'}], function(info){
            if(options[info.column]){
                var scale = df.scale(options[info.column], options[info.val]);
                columns.push(_.map(df.column(options[info.column]), function(val){return scale(val);}));
            }else{
                columns.push(_.map(_.range(1, length+1, 1), function(d){
                    if(_.isArray(options[info.val]))return options[info.val][0];
                    else return options[info.val];
                }));
            }
        });

        if(options.tooltip_contents.length > 0){
            var tt_arr = df.getPartialDf(options.tooltip_contents);
            labels.push('tt');
            columns.push(tt_arr);
        }

        return _.map(_.zip.apply(null, columns), function(d){
            return _.reduce(d, function(memo, val, i){memo[labels[i]] = val; return memo;}, {});
        });
    };

    // update SVG dom nodes based on pre-processed data.
    var updateModels = function(selector, scales, options){
        selector
            .attr("transform", function(d) {
                return "translate(" + scales.get(d.x, d.y).x + "," + scales.get(d.x, d.y).y + ")"; })
            .attr("fill", function(d){return d.fill;})
            .attr("stroke", options.stroke_color)
            .attr("stroke-width", options.stroke_width)
            .transition().duration(200)
            .attr("d", d3.svg.symbol().type(function(d){return d.shape;}).size(function(d){return d.size;}));
    };

    return function(context, scales, df, _options){
        var options = {
            title: 'scatter',
            x: null,
            y: null,
            fill_by: null,
            shape_by: null,
            size_by: null,
            color:['#4682B4', '#000000'],
            shape:['circle','triangle-up', 'diamond', 'square', 'triangle-down', 'cross'],
            size: [100, 1000],
            stroke_color: 'black',
            stroke_width: 1,
            hover: true,
            tooltip_contents:[],
            tooltip:null,
            legend :true
        };
        if(arguments.length>3)_.extend(options, _options);

        var data = processData(df, options);
        var shapes = context.selectAll("path").data(data);
        shapes.enter().append("path");
        updateModels(shapes, scales, options);

        return shapes;
    };
});
