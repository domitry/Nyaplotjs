/*
 * Bar chart
 *
 * This diagram has two mode, ordinal-mode and count-mode. The former creates bar from x and y column.
 * The latter counts unique value in 'value' column and generates bar from the result.
 * 
 *
 * options:
 *    value   -> String: column name. set when you'd like to build bar chart based on one-dimention data
 *    x, y    -> String: column name. x should be discrete. y should be continuous.
 *    width   -> Float : 0..1, width of each bar.
 *    color   -> Array : color in which bars filled.
 *    hover   -> Bool  : set whether pop-up tool-tips when bars are hovered.
 *    tooltip -> Object: instance of Tooltip. set by pane.
 *
 * example:
 *    specified 'value' option : http://bl.ocks.org/domitry/b8785f02f36deef567ce
 *    specified 'x' and 'y' : http://bl.ocks.org/domitry/2f53781449025f772676
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
            tooltip:null,
            legend: true
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

    // fetch data and update dom object. called by pane which this chart belongs to.
    Bar.prototype.update = function(){
        var data;
        if(this.options.value !== null){
            var column_value = this.df.columnWithFilters(this.uuid, this.options.value);
            var raw = this.countData(column_value);
            data = this.processData(raw.x, raw.y, this.options);
        }else{
            var column_x = this.df.columnWithFilters(this.uuid, this.options.x);
            var column_y = this.df.columnWithFilters(this.uuid, this.options.y);
            data = this.processData(column_x, column_y, this.options);
        }

        var rects = this.model.selectAll("rect").data(data);
        rects.enter().append("rect")
            .attr("height", 0)
            .attr("y", this.scales.get(0, 0).y);

        this.updateModels(rects, this.scales, this.options);
    };
    
    // process data as:
    //     x: [1,2,3,...], y: [4,5,6,...] -> [{x: 1, y: 4},{x: 2, y: 5},...]
    Bar.prototype.processData = function(x, y, options){
        return _.map(_.zip(x,y),function(d, i){return {x:d[0], y:d[1]};});
    };

    // update dom object
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
            options.tooltip.reset();
        };

        var width = scales.raw.x.rangeBand()*options.width;
        var padding = scales.raw.x.rangeBand()*((1-options.width)/2);

        selector
            .attr("x",function(d){return scales.get(d.x, d.y).x + padding;})
            .attr("width", width)
            .attr("fill", function(d){return color_scale(d.x);})
            .transition().duration(200)
            .attr("y", function(d){return scales.get(d.x, d.y).y;})
            .attr("height", function(d){return scales.get(0, 0).y - scales.get(0, d.y).y;})
            .attr("id", uuid.v4());

        if(options.hover)selector
            .on("mouseover", onMouse)
            .on("mouseout", outMouse);
    };

    // return legend object based on data prepared by initializer
    Bar.prototype.getLegend = function(){
        var legend = new SimpleLegend((this.options.legend ? this.legend_data : {}));
        return legend;
    };

    // count unique value. called when 'value' option was specified insead of 'x' and 'y'
    Bar.prototype.countData = function(values){
        var hash = {};
        _.each(values, function(val){
            hash[val] = hash[val] || 0;
            hash[val] += 1;
        });
        return {x: _.keys(hash), y: _.values(hash)};
    };

    // not implemented yet.
    Bar.prototype.checkSelectedData = function(ranges){
        return;
    };

    return Bar;
});
