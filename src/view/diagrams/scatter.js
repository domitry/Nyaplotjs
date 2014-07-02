define([
    'underscore',
    'core/manager',
    'view/components/filter',
    'view/components/legend/simple_legend'
],function(_, Manager, Filter, SimpleLegend){
    function Scatter(parent, scales, df_id, _options){
        var options = {
            title: 'scatter',
            x: null,
            y: null,
            r: 5,
            shape:'circle',
            color:'steelblue',
            stroke_color: 'black',
            stroke_width: 1,
            hover: true
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

        this.update();
        
        return this;
    }

    Scatter.prototype.update = function(){
        var data = this.proceedData(this.df.column(this.options.x), this.df.column(this.options.y), this.options);
        if(this.render){
            var circles = this.model.selectAll("circle")
                    .data(data);
            if(circles[0][0]==undefined){
                circles.enter()
                    .append("circle")
                    .attr("r", 0);
            }
            this.updateModels(circles, this.scales, this.options);
        }else{
            this.model.selectAll("circle").remove();
        }
    };

    Scatter.prototype.proceedData = function(x_arr, y_arr, options){
        return _.map(_.zip(x_arr, y_arr), function(d){return {x:d[0], y:d[1]};});
    };

    Scatter.prototype.updateModels = function(selector, scales, options){
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

        selector
            .attr("cx",function(d){return scales.x(d.x);})
            .attr("cy", function(d){return scales.y(d.y);})
            .attr("fill", options.color)
            .attr("stroke", options.stroke_color)
            .attr("stroke-width", options.stroke_width)
            .attr("clip-path","url(#" + this.options.clip_id + ")")
            .transition().duration(200)
            .attr("r", options.r);

        if(options.hover)selector
            .on("mouseover", onMouse)
            .on("mouseout", outMouse);
    };

    Scatter.prototype.getLegend = function(){
        return new SimpleLegend(this.legend_data);
    };

    Scatter.prototype.updateData = function(){
        this.df = Manager.getData(this.df_id);
        var data = this.proceedData(this.df.column(this.options.value), this.options);
        var models = this.model.selectAll("circle").data(data);
        this.updateModels(models,  this.scales, this.options);
    };

    Scatter.prototype.checkSelectedData = function(ranges){
        return;
    };

    return Scatter;
});
