define([
    'underscore',
    'core/manager',
    'view/components/filter',
    'view/components/legend/simple_legend'
],function(_, Manager, Filter, SimpleLegend){
    function Line(parent, scales, df_id, _options){
        var options = {
            x: null,
            y: null,
            title: 'line',
            color:'steelblue',
            stroke_width: 2
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

    Line.prototype.update = function(){
        if(this.render){
            var data = this.proceedData(this.df.column(this.options.x), this.df.column(this.options.y), this.options);
            this.model.selectAll("path").remove();
            var path =this.model
                    .append("path")
                    .attr("clip-path","url(#" + this.options.clip_id + ")")
                    .datum(data);
            
            this.updateModels(path, this.scales, this.options);
        }else{
            this.model.selectAll("path").remove();
        }
    };

    Line.prototype.proceedData = function(x_arr, y_arr, options){
        return _.map(_.zip(x_arr, y_arr), function(d){return {x:d[0], y:d[1]};});
    };

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
                .x(function(d){return scales.x(d.x);})
                .y(function(d){return scales.y(d.y);});

        selector
            .attr("d", line)
            .attr("stroke", options.color)
            .attr("stroke-width", options.stroke_width)
            .attr("fill", "none");
    };

    Line.prototype.getLegend = function(){
        var legend = new SimpleLegend(this.legend_data);
        return legend;
    };

    Line.prototype.checkSelectedData = function(ranges){
        return;
    };

    return Line;
});
