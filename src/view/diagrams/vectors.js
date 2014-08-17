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
    'underscore',
    'node-uuid',
    'core/manager',
    'view/components/filter',
    'view/components/legend/simple_legend'
],function(_, uuid, Manager, Filter, SimpleLegend){
    function Vectors(parent, scales, df_id, _options){
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
            hover: true,
            tooltip:null
        };
        if(arguments.length>3)_.extend(options, _options);

        this.scales = scales;
        var df = Manager.getData(df_id);
        var model = parent.append("g");

        this.legend_data = (function(thisObj){
            var on = function(){
                thisObj.render = true;
                thisObj.update();
            };

            var off = function(){
                thisObj.render = false;
                thisObj.update();
            };
            return [{label: options.title, color:options.color, on:on, off:off}];
        })(this);

        this.render = true;
        this.options = options;
        this.model = model;
        this.df = df;
        this.uuid = options.uuid;

        return this;
    }

    // fetch data and update dom object. called by pane which this chart belongs to.
    Vectors.prototype.update = function(){
        var data = this.processData(this.options);
        this.options.tooltip.reset();
        if(this.render){
            var shapes = this.model.selectAll("line").data(data);
            shapes.enter().append("line");
            this.updateModels(shapes, this.scales, this.options);
        }else{
            this.model.selectAll("line").remove();
        }
    };

    // pre-process data like: [{x: 1, y: 2, dx: 0.1, dy: 0.2, fill:'#000'}, {},...,{}]
    Vectors.prototype.processData = function(options){
        var df = this.df;
        var labels = ['x', 'y', 'dx', 'dy', 'fill'];
        var columns = _.map(['x', 'y', 'dx', 'dy'], function(label){return df.column(options[label]);});
        var length = columns[0].length;

        _.each([{column: 'fill_by', val: 'color'}], function(info){
            if(options[info.column]){
                var scale = df.scale(options[info.column], options[info.val]);
                columns.push(_.map(df.column(options[info.column]), function(val){return scale(val);}));
            }else{
                columns.push(_.map(_.range(1, length, 1), function(d){
                    if(_.isArray(options[info.val]))return options[info.val][0];
                    else return options[info.val];
                }));
            }
        });

        return _.map(_.zip.apply(null, columns), function(d){
            return _.reduce(d, function(memo, val, i){memo[labels[i]] = val; return memo;}, {});
        });
    };

    // update SVG dom nodes based on pre-processed data.
    Vectors.prototype.updateModels = function(selector, scales, options){
        selector
            .attr({
                'x1':function(d){return scales.get(d.x, d.y).x;},
                'x2':function(d){return scales.get(d.x + d.dx, d.y + d.dy).x;},
                'y1':function(d){return scales.get(d.x, d.y).y;},
                'y2':function(d){return scales.get(d.x + d.dx, d.y + d.dy).y;},
                'stroke':function(d){return d.fill;},
                'stroke-width':options.stroke_width
            });
    };

    // return legend object.
    Vectors.prototype.getLegend = function(){
        return new SimpleLegend(this.legend_data);
    };

    // answer to callback coming from filter.
    Vectors.prototype.checkSelectedData = function(ranges){
        return;
    };

    return Vectors;
});
