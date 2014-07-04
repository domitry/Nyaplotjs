/*
 * LegendArea keep a dom object which legends will be placed on and
 * add legends on the best place in it.
 */

define([
    'underscore',
    'core/manager'
],function(_, Manager){
    function LegendArea(parent, _options){
        var options = {
            width: 200,
            height: 300,
            margin: {top: 10, bottom:10, left:10, right:10},
            fill_color: 'none',
            stroke_color: '#000',
            stroke_width: 0
        };
        if(arguments.length>1)_.extend(options, _options);

        var model = parent.append("g");

        model.append("rect")
            .attr("width", options.width)
            .attr("height", options.height)
            .attr("x", 0)
            .attr("y", 0)
            .attr("fill", options.fill_color)
            .attr("stroke", options.stroke_color)
            .attr("stroke-width", options.stroke_width);

        this.model = model;
        this.options = options;
        this.seek = {x: options.margin.left, y:options.margin.top, width:0};

        return this;
    }
    
    // Add a new legend to this area
    LegendArea.prototype.add = function(legend){
        var legend_area = this.model.append("g")
                .attr("transform", "translate(" + this.seek.x + "," + this.seek.y + ")");
        var dom = legend.getDomObject();
        legend_area[0][0].appendChild(dom[0][0]);

        // calculate coordinates to place the new legend (too simple algorism!)
        if(this.seek.y + legend.height() > this.options.height){
            this.seek.x += this.seek.width;
            this.seek.y=this.options.margin.top;
        }else{
            this.seek.width = _.max([this.seek.width, legend.width()]);
            this.seek.y += legend.height();
        }
    };

    return LegendArea;
});
