/*
 * Scatter
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
            var shapes = this.model.selectAll("path").data(data).enter().append("path");
            this.updateModels(shapes, this.scales, this.options);
        }else{
            this.model.selectAll("path").remove();
        }
    };

    Scatter.prototype.processData = function(options){
        var df = this.df;
        var labels = ['x', 'y', 'fill', 'size', 'shape'];
        var columns = _.map(['x', 'y'], function(label){return df.column(options[label]);});
        var length = columns[0].length;

        _.each([{column: 'fill_by', val: 'color'}, {column: 'size_by', val: 'size'}, {column: 'shape_by', val: 'shape'}], function(info){
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

        if(options.tooltip_contents.length > 0){
            var tt_arr = df.getPartialDf(options.tooltip_contents);
            labels.push('tt');
            columns.push(tt_arr);
        }

        return _.map(_.zip.apply(null, columns), function(d){
            return _.reduce(d, function(memo, val, i){memo[labels[i]] = val; return memo;}, {});
        });
    };

    Scatter.prototype.updateModels = function(selector, scales, options){
        var id = this.uuid;

        var onMouse = function(){
            d3.select(this).transition()
                .duration(200)
                .attr("fill", function(d){return d3.rgb(d.fill).darker(1);});
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
                .attr("fill", function(d){return d.fill;});
            options.tooltip.reset();
        };

        selector
            .attr("transform", function(d) {
                return "translate(" + scales.get(d.x, d.y).x + "," + scales.get(d.x, d.y).y + ")"; })
            .attr("fill", function(d){return d.fill;})
            .attr("stroke", options.stroke_color)
            .attr("stroke-width", options.stroke_width)
            .transition().duration(200)
            .attr("d", d3.svg.symbol().type(function(d){return d.shape;}).size(function(d){return d.size;}));

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
