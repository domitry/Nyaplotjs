/*
 * Vectors: Vector Field
 *
 * Draw vector field from x, y, dx, dy column. This chart is designed to visualize wind vector data.
 * See Nyaplot's notebook: http://nbviewer.ipython.org/github/domitry/nyaplot/blob/master/examples/notebook/Mapnya2.ipynb
 *
 *
 * options:
 *    x,y,dx,dy    -> String: column name.
 *    fill_by      -> String: column name. Fill vectors according to this column. (both of continuous and descrete data are allowed.)
 *    color        -> Array : color in which vectors are filled.
 *    stroke_color -> String: stroke color.
 *    stroke_width -> Float : stroke width.
 *    hover        -> Bool  : set whether pop-up tool-tips when bars are hovered.
 *    tooltip      -> Object: instance of Tooltip. set by pane.
 *
 * example:
 *    http://bl.ocks.org/domitry/1e1222cbc48ab3880849
 */

define([
    'underscore'
],function(_){
    // pre-process data like: [{x: 1, y: 2, dx: 0.1, dy: 0.2, fill:'#000'}, {},...,{}]
    var processData = function(df, options){
        var labels = ['x', 'y', 'dx', 'dy', 'fill'];
        var columns = _.map(['x', 'y', 'dx', 'dy'], function(label){return df.column(options[label]);});
        var length = columns[0].length;

        _.each([{column: 'fill_by', val: 'color'}], function(info){
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

        return _.map(_.zip.apply(null, columns), function(d){
            return _.reduce(d, function(memo, val, i){memo[labels[i]] = val; return memo;}, {});
        });
    };

    return function(context, scales, df, _options){
        var options = {
            title: 'vectors',
            x: null,
            y: null,
            dx: null,
            dy: null,
            fill_by: null,
            color:['steelblue', '#000000'],
            stroke_color: '#000',
            stroke_width: 2,
            hover: true
        };
        if(arguments.length>3)_.extend(options, _options);

        var data = processData(df, options);
        var shapes = context.selectAll("line").data(data);
        shapes.enter()
            .append("line")
            .attr({
                'x1':function(d){return scales.get(d.x, d.y).x;},
                'x2':function(d){return scales.get(d.x + d.dx, d.y + d.dy).x;},
                'y1':function(d){return scales.get(d.x, d.y).y;},
                'y2':function(d){return scales.get(d.x + d.dx, d.y + d.dy).y;},
                'stroke':function(d){return d.fill;},
                'stroke-width':options.stroke_width
            });

        return shapes;
    };
});
