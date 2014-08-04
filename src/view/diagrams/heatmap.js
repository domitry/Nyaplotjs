/*
 * Heatmap or 2D Histogram
 * Heatmap creates rectangles from discrete data or continuous data. When creating heatmap from continuous
 * data, width and height values options should be specified.
 */

define([
    'underscore',
    'node-uuid',
    'core/manager',
    'view/components/filter',
    'view/components/legend/color_bar',
    'utils/color'
],function(_, uuid, Manager, Filter, ColorBar, colorset){
    function HeatMap(parent, scales, df_id, _options){
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
            hover: true
        };
        if(arguments.length>3)_.extend(options, _options);

        var df = Manager.getData(df_id);
        var model = parent.append("g");

        this.color_scale = (function(){
            var column_fill = df.columnWithFilters(options.uuid, options.fill);
            var min_max = d3.extent(column_fill);
            var domain = d3.range(min_max[0], min_max[1], (min_max[1]-min_max[0])/(options.color.length));
            return d3.scale.linear()
                .range(options.color)
                .domain(domain);
        })();

        this.scales = scales;
        this.options = options;
        this.model = model;
        this.df = df;
        this.uuid = options.uuid;
        return this;
    };

    HeatMap.prototype.update = function(){
        var data = this.processData();
        var models = this.model.selectAll("rect").data(data);
        models.each(function(){
            var event = document.createEvent("MouseEvents");
            event.initEvent("mouseout", false, true);
            this.dispatchEvent(event);
        });
        models.enter().append("rect");
        this.updateModels(models, this.options);
    };

    HeatMap.prototype.processData = function(){
        var column_x = this.df.columnWithFilters(this.uuid, this.options.x);
        var column_y = this.df.columnWithFilters(this.uuid, this.options.y);
        var column_fill = this.df.columnWithFilters(this.uuid, this.options.fill);
        var scales = this.scales;
        var options = this.options;
        var color_scale = this.color_scale;

        return _.map(_.zip(column_x, column_y, column_fill), function(row){
            var x, y, width, height;
            if(typeof scales.x['invert'] === "undefined" && typeof scales.y['invert'] === "undefined"){
                // ordinal scale
                width = scales.x.rangeBand()*options.width;
                height = scales.y.rangeBand()*options.height;
                x = scales.x(row[0]);
                y = scales.y(row[1]);
            }else{
                // linear scale
                width = Math.abs(scales.x(options.width) - scales.x(0));
                height = Math.abs(scales.y(options.height) - scales.y(0));
                x = scales.x(row[0]) - width/2;
                y = scales.y(row[1]) - height/2;
            }
            return {x: x, y:y, width:width, height:height, fill:color_scale(row[2]), x_raw: row[0], y_raw: row[1]};
        });
    };

    HeatMap.prototype.updateModels = function(selector, options){
        var id = this.uuid;
        var onMouse = function(){
            d3.select(this).transition()
                .duration(200)
                .attr("fill", function(d){return d3.rgb(d.fill).darker(1);});
            options.tooltip.addToXAxis(id, this.__data__.x_raw, 3);
            options.tooltip.addToYAxis(id, this.__data__.y_raw, 3);
            options.tooltip.update();
        };

        var outMouse = function(){
            d3.select(this).transition()
                .duration(200)
                .attr("fill", function(d){return d.fill;});
            options.tooltip.reset();
        };

        selector
            .attr("x", function(d){return d.x;})
            .attr("width", function(d){return d.width;})
            .attr("y", function(d){return d.y;})
            .attr("height", function(d){return d.height;})
            .attr("fill", function(d){return d.fill;})
            .attr("stroke", options.stroke_color)
            .attr("stroke-width", options.stroke_width);

        if(options.hover)selector
            .on("mouseover", onMouse)
            .on("mouseout", outMouse);
    };

    HeatMap.prototype.getLegend = function(){
        return new ColorBar(this.color_scale);
    };    

    HeatMap.prototype.checkSelectedData = function(ranges){
        return;
    };

    return HeatMap;
});
