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
    function Line(parent, scales, df_id, _options){
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
        this.df_id = df_id;

        return this;
    }

    // fetch data and update dom object. called by pane which this chart belongs to.
    Line.prototype.update = function(){
        if(this.render){
            var data = this.processData(this.df.column(this.options.x), this.df.column(this.options.y), this.options);
            this.model.selectAll("path").remove();
            var path =this.model
                    .append("path")
                    .datum(data);
            
            this.updateModels(path, this.scales, this.options);
        }else{
            this.model.selectAll("path").remove();
        }
    };

    // pre-process data like: x: [1,3,..,3], y: [2,3,..,4] -> [{x: 1, y: 2}, ... ,{}]
    Line.prototype.processData = function(x_arr, y_arr, options){
        var df = this.df, length = x_arr.length;
        /*
        var color_arr = (function(column, colors){
            if(options['fill_by']){
                var scale = df.scale(options[column], options[colors]);
                return _.map(df.column(options[column]), function(val){return scale(val);});
            }else{
                return _.map(_.range(1, length+1, 1), function(d){
                    if(_.isArray(options[colors]))return options[colors][0];
                    else return options[colors];
                });
            }
        })('fill_by', 'color');*/
        return _.map(_.zip(x_arr, y_arr), function(d){return {x:d[0], y:d[1]};});
    };

    // update SVG dom nodes based on pre-processed data.
    Line.prototype.updateModels = function(selector, scales, options){
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

    // return legend object.
    Line.prototype.getLegend = function(){
        var legend = new SimpleLegend((this.options.legend ? this.legend_data : []));
        return legend;
    };

    // answer to callback coming from filter.
    Line.prototype.checkSelectedData = function(ranges){
        return;
    };

    return Line;
});
