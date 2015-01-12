/*
 * Heatmap: Heatmap or 2D Histogram
 *
 * Heatmap creates rectangles from continuous data. Width and height values should be specified.
 *
 * options:
 *    title        -> String: title of this chart showen on legend
 *    x, y         -> String: column name. Both x and y should be continuous.
 *    width, height-> Float : 0..1, width and height of each rectangle
 *    color        -> Array : color in which bars filled.
 *    stroke_color -> String: stroke color
 *    stroke_width -> Float : stroke width
 *    hover        -> Bool  : set whether pop-up tool-tips when bars are hovered.
 *    tooltip      -> Object: instance of Tooltip. set by pane.
 *
 * example:
 *    http://bl.ocks.org/domitry/eab8723ccb32fd3a6cd8
 */

define([
    'underscore',
    'node-uuid',
    'utils/color'
],function(_, uuid, colorset){
    // pre-process data. convert data coorinates to dom coordinates with Scale.
    var processData = function(df, scales, color_scale, options){
        var column_x = df.columnWithFilters(uuid, options.x);
        var column_y = df.columnWithFilters(uuid, options.y);
        var column_fill = df.columnWithFilters(uuid, options.fill);

        return _.map(_.zip(column_x, column_y, column_fill), function(row){
            var x, y, width, height;
            width = Math.abs(scales.get(options.width, 0).x - scales.get(0, 0).x);
            height = Math.abs(scales.get(0, options.height).y - scales.get(0, 0).y);
            x = scales.get(row[0], 0).x - width/2;
            y = scales.get(0, row[1]).y - height/2;
            return {x: x, y:y, width:width, height:height, fill:color_scale(row[2]), x_raw: row[0], y_raw: row[1]};
        });
    };

    return function(context, scales, df, _options){
        var options = {
            title: 'heatmap',
            x: null,
            y: null,
            fill: null,
            width: 1.0,
            height: 1.0,
            color: colorset("RdBu").reverse(),
            stroke_color: "#fff",
            stroke_width: 1,
            hover: true,
            tooltip: null
        };
        if(arguments.length>3)_.extend(options, _options);

        var color_scale = (function(){
            var column_fill = df.columnWithFilters(options.uuid, options.fill);
            var min_max = d3.extent(column_fill);
            var domain = d3.range(min_max[0], min_max[1], (min_max[1]-min_max[0])/(options.color.length));
            return d3.scale.linear()
                .range(options.color)
                .domain(domain);
        })();

        var data = processData(df, scales, color_scale, options);
        var rects = context.selectAll("rect").data(data);

        rects.each(function(){
            var event = document.createEvent("MouseEvents");
            event.initEvent("mouseout", false, true);
            this.dispatchEvent(event);
        });

        rects.enter().append("rect");

        rects
            .attr("x", function(d){return d.x;})
            .attr("width", function(d){return d.width;})
            .attr("y", function(d){return d.y;})
            .attr("height", function(d){return d.height;})
            .attr("fill", function(d){return d.fill;})
            .attr("stroke", options.stroke_color)
            .attr("stroke-width", options.stroke_width);

        return rects;
    };
});
