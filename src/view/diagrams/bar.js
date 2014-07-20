/*
 * Bar chart
 * This diagram has two mode, ordinal-mode and count-mode. The former creates bar from x and y column.
 * The latter counts unique value in 'value' column and generates bar from the result.
 */

define([
    'underscore',
    'node-uuid',
    'core/manager',
    'view/components/legend/simple_legend'
],function(_, uuid, Manager, SimpleLegend){
    function Bar(parent, scales, df_id, _options){
        var options = {
            value: null,
            x: null,
            y: null,
            width: 0.9,
            color: null,
            hover: true,
            tooltip_contents:null,
            tooltip:null
        };
        if(arguments.length>3)_.extend(options, _options);

        var df = Manager.getData(df_id);

        var color_scale;
        if(options.color == null) color_scale = d3.scale.category20b();
        else color_scale = d3.scale.ordinal().range(options.color);
        this.color_scale = color_scale;

        var model = parent.append("g");

        var legend_data = [], labels;

        if(options.value != null){
            var column_value = df.column(options.value);
            labels = _.uniq(column_value);
        }else
            labels = df.column(options.x);
        
        _.each(labels, function(label){
            legend_data.push({label: label, color:color_scale(label)});
        });

        this.model = model;
        this.scales = scales;
        this.options = options;
        this.legend_data = legend_data;
        this.df = df;
        this.df_id = df_id;
        this.uuid = options.uuid;

        return this;
    }

    Bar.prototype.update = function(){
        var data;
        if(this.options.value !== null){
            var column_value = this.df.columnWithFilters(this.uuid, this.options.value);
            var raw = this.countData(column_value);
            data = this.proceedData(raw.x, raw.y, this.options);
        }else{
            var column_x = this.df.columnWithFilters(this.uuid, this.options.x);
            var column_y = this.df.columnWithFilters(this.uuid, this.options.y);
            data = this.proceedData(column_x, column_y, this.options);
        }

        var rects = this.model.selectAll("rect").data(data);
        if(rects[0][0]==undefined){
            rects.enter()
                .append("rect")
                .attr("height", 0)
                .attr("y", this.scales.y(0));
        }

        this.updateModels(rects, this.scales, this.options);
    };
    
    Bar.prototype.proceedData = function(x, y, options){
        return _.map(
            _.zip(x,y),
            function(d, i){return {x:d[0], y:d[1]};}
        );
    };

    Bar.prototype.updateModels = function(selector, scales, options){
        var color_scale = this.color_scale;

        var onMouse = function(){
            d3.select(this).transition()
                .duration(200)
                .attr("fill", function(d){return d3.rgb(color_scale(d.x)).darker(1);});
            var id = d3.select(this).attr("id");
            options.tooltip.addToYAxis(id, this.__data__.y);
            options.tooltip.update();
        };

        var outMouse = function(){
            d3.select(this).transition()
                .duration(200)
                .attr("fill", function(d){return color_scale(d.x);});
            var id = d3.select(this).attr("id");
            options.tooltip.remove(id);
            options.tooltip.update();
        };

        var width = scales.x.rangeBand()*options.width;
        var padding = scales.x.rangeBand()*((1-options.width)/2);

        selector
            .attr("x",function(d){return scales.x(d.x) + padding;})
            .attr("width", width)
            .attr("fill", function(d){return color_scale(d.x);})
            .transition().duration(200)
            .attr("y", function(d){return scales.y(d.y);})
            .attr("height", function(d){return scales.y(0) - scales.y(d.y);})
            .attr("id", uuid.v4());

        if(options.hover)selector
            .on("mouseover", onMouse)
            .on("mouseout", outMouse);
    };

    Bar.prototype.getLegend = function(){
        return new SimpleLegend(this.legend_data);
    };

    Bar.prototype.countData = function(values){
        var hash = {};
        _.each(values, function(val){
            hash[val] = hash[val] || 0;
            hash[val] += 1;
        });
        return {x: _.keys(hash), y: _.values(hash)};
    };

    Bar.prototype.checkSelectedData = function(ranges){
        return;
    };

    return Bar;
});
