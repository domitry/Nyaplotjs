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
    return [
        "vectors",
        ["context", "data", "x", "y", "dx", "dy", "position"],
        {
            color:'steelblue',
            stroke_color: '#000',
            stroke_width: 2,
            hover: true
        },
        function(context, data, x, y, dx, dy, position, options){
            var shapes = context.selectAll("line").data(data);

            shapes.enter()
                .append("line")
                .attr({
                    'x1':function(d){return position(d[x], d[y]).x;},
                    'x2':function(d){return position(d[x] + d[dx], d[y] + d[dy]).x;},
                    'y1':function(d){return position(d[x], d[y]).y;},
                    'y2':function(d){return position(d[x] + d[dx], d[y] + d[dy]).y;},
                    'fill': options.color,
                    'stroke': options.stroke_color,
                    'stroke-width':options.stroke_width
                });

            return shapes;
        }
    ];
});
