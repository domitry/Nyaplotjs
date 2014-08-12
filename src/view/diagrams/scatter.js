/*
 * Scatter
 * Shapes: 'circle', 'cross', 'diamond', 'square', 'triangle-down', 'triangle-up'
 */

define([
    'underscore',
    'node-uuid',
    'core/manager',
    'view/components/filter',
    'view/components/legend/simple_legend'
],function(_, uuid, Manager, Filter, SimpleLegend){
    function Scatter(parent, scales, df_id, _options){
        var options = {
            title: 'scatter',
            x: null,
            y: null,
            size: 100,
            shape:'circle',
            color:'steelblue',
            stroke_color: 'black',
            stroke_width: 1,
            hover: true,
            tooltip_contents:[],
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

    Scatter.prototype.update = function(){
        var data = this.processData(this.options);
        this.options.tooltip.reset();
        if(this.render){
            var shapes = this.model.selectAll("path").data(data);
            if(shapes[0][0]==undefined){
                shapes.enter().append("path")
                    .attr("d", d3.svg.symbol().type(this.options.shape).size(0));
            }
            this.updateModels(shapes, this.scales, this.options);
        }else{
            this.model.selectAll("path").remove();
        }
    };

    Scatter.prototype.processData = function(options){
        var df = this.df;
        var x_arr = df.column(this.options.x);
        var y_arr = df.column(this.options.y);
        if(options.tooltip_contents.length > 0){
            var tt_arr = df.getPartialDf(options.tooltip_contents);
            return _.map(_.zip(x_arr, y_arr, tt_arr), function(d){
                return {x:d[0], y:d[1], tt:d[2]};
            });
        }else{
            return _.map(_.zip(x_arr, y_arr), function(d){return {x:d[0], y:d[1]};});
        }
    };

    Scatter.prototype.updateModels = function(selector, scales, options){
        var df = this.df;
        var id = this.uuid;
        var onMouse = function(){
            d3.select(this).transition()
                .duration(200)
                .attr("fill", d3.rgb(options.color).darker(1));
            options.tooltip.addToXAxis(id, this.__data__.x, 3);
            options.tooltip.addToYAxis(id, this.__data__.y, 3);
            if(options.tooltip_contents.length > 0){
                options.tooltip.add(id, this.__data__.x, this.__data__.y, 'top', this.__data__.tt);
            }
            options.tooltip.update();
        };

        var outMouse = function(){
            d3.select(this).transition()
                .duration(200)
                .attr("fill", options.color);
            options.tooltip.reset();
        };

        selector
            .attr("transform", function(d) {
                return "translate(" + scales.get(d.x, d.y).x + "," + scales.get(d.x, d.y).y + ")"; })
            .attr("fill", options.color)
            .attr("stroke", options.stroke_color)
            .attr("stroke-width", options.stroke_width)
            .transition().duration(200)
            .attr("d", d3.svg.symbol().type(options.shape).size(options.size));

        if(options.hover)selector
            .on("mouseover", onMouse)
            .on("mouseout", outMouse);
    };

    Scatter.prototype.getLegend = function(){
        return new SimpleLegend(this.legend_data);
    };

    Scatter.prototype.checkSelectedData = function(ranges){
        return;
    };

    return Scatter;
});
