/*
 * Box: Implementation of Boxplot for Nyaplot.
 */

define([
    'underscore',
    'core/manager',
    'view/components/filter',
    'view/components/legend/simple_legend'
],function(_, Manager, SimpleLegend){
    function Box(parent, scales, df_id, _options){
        var options = {
            title: '',
            value: [],
            width: 0.9,
            color:null,
            stroke_color: 'black',
            stroke_width: 1,
            outlier_r: 3
        };
        if(arguments.length>3)_.extend(options, _options);

        var model = parent.append("g");
        var df = Manager.getData(df_id);

        var color_scale;
        if(options.color == null){
            color_scale = d3.scale.category20b();
        }else{
            color_scale = d3.scale.ordinal().range(options.color);
        }

        this.model = model;
        this.scales = scales;
        this.options = options;
        this.df = df;
        this.color_scale = color_scale;
        this.uuid = options.uuid;

        return this;
    }

    // proceed data and build SVG dom node
    Box.prototype.update = function(){
        var uuid = this.uuid;
        var proceedData = this.proceedData;
        var df = this.df;
        var data = [];
        _.each(this.options.value, function(column_name){
            var column = df.columnWithFilters(uuid, column_name);
            data.push(_.extend(proceedData(column), {x: column_name}));
        });

        var boxes = this.model.selectAll("g").data(data);
        boxes.enter()
            .append("g");

        this.updateModels(boxes, this.scales, this.options);
    };

    // convert raw data into style information for box
    Box.prototype.proceedData = function(column){
        var getMed = function(arr){
            var n = arr.length;
            return (n%2==1 ? arr[Math.floor(n/2)] : (arr[n/2]+arr[n/2+1])/2);
        };

        var arr = _.sortBy(column);
        var med = getMed(arr);
        var q1 = getMed(arr.slice(0,arr.length/2-1));
        var q3 = getMed(arr.slice((arr.length%2==0?arr.length/2:arr.length/2+1),arr.length-1));
        var h = q3-q1;
        var max = (_.max(arr)-q3 > 1.5*h ? q3+1.5*h : _.max(arr));
        var min = (q1-_.min(arr) > 1.5*h ? q1-1.5*h : _.min(arr));
        var outlier = _.filter(arr, function(d){return (d>max || d<min);});

        return {
            med:med,
            q1:q1,
            q3:q3,
            max:max,
            min:min,
            outlier:outlier
        };
    };

    // update SVG dom nodes based on data
    Box.prototype.updateModels = function(selector, scales, options){
        var width = scales.x.rangeBand()*options.width;
        var padding = scales.x.rangeBand()*((1-options.width)/2);
        var color_scale = this.color_scale;

        selector
            .append("line")
            .attr("x1", function(d){return scales.x(d.x) + width/2 + padding;})
            .attr("y1", function(d){return scales.y(d.max);})
            .attr("x2", function(d){return scales.x(d.x) + width/2 + padding;})
            .attr("y2", function(d){return scales.y(d.min);})
            .attr("stroke", options.stroke_color);

        selector
            .append("rect")
            .attr("x", function(d){return scales.x(d.x) + padding;})
            .attr("y", function(d){return scales.y(d.q3);})
            .attr("height", function(d){return scales.y(d.q1) - scales.y(d.q3);})
            .attr("width", width)
            .attr("fill", function(d){return color_scale(d.x);})
            .attr("stroke", options.stroke_color);

        // median line
        selector
            .append("line")
            .attr("x1", function(d){return scales.x(d.x) + padding;})
            .attr("y1", function(d){return scales.y(d.med);})
            .attr("x2", function(d){return scales.x(d.x)+width + padding;})
            .attr("y2", function(d){return scales.y(d.med);})
            .attr("stroke", options.stroke_color);

        selector
            .append("g")
            .each(function(d,i){
                d3.select(this)
                    .selectAll("circle")
                    .data(d.outlier)
                    .enter()
                    .append("circle")
                    .attr("cx", function(d1){return scales.x(d.x) + width/2 + padding;})
                    .attr("cy", function(d1){return scales.y(d1);})
                    .attr("r", options.outlier_r);
            });
    };

    Box.prototype.getLegend = function(){
        return new SimpleLegend(this.legend_data);
    };

    // answer to callback coming from filter
    Box.prototype.checkSelectedData = function(ranges){
        return;
    };

    return Box;
});
