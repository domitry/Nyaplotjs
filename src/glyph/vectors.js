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
        ["context", "data", "x1", "y1", "x2", "y2", "position"],
        {
            color:'steelblue',
            stroke_color: '#000',
            stroke_width: 2
        },
        function(context, data, x1, y1, x2, y2, position, options){
            var shapes = context.selectAll("line").data(data.asarray());
            var p1 = position(x1, y1), p2 = position(x2, y2);
            
            shapes.enter()
                .append("line")
                .attr({
                    'x1': p1.x,
                    'x2': p1.y,
                    'y1': p2.x,
                    'y2': p2.y,
                    'fill': options.color,
                    'stroke': options.stroke_color,
                    'stroke-width':options.stroke_width
                });

            return shapes;
        }
    ];
});
