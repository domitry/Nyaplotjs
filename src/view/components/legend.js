define([
    'underscore',
    'core/manager'
],function(_, Manager){
    function Legend(parent, _options){
        var options = {
            title: '',
            width: 100,
            height: 500,
            fill_color: "none",
            stroke_color: "#000",
            stroke_width: 0,
            title_height: 15,
            margin: {top:18, bottom:8, right:8, left: 18},
            middle: false
        };
        if(arguments.length>1)_.extend(options, _options);

        parent.append("rect")
            .attr("width", options.width)
            .attr("height", options.height)
            .attr("x", 0)
            .attr("y", 0)
            .attr("fill", options.fill_color)
            .attr("stroke", options.stroke_color)
            .attr("stroke-width", options.stroke_width);

        var model = parent.append("g")
                .attr("transform", "translate(" + options.margin.left + "," + options.margin.top + ")");

        model.append("text")
            .attr("x", 0)
            .attr("y", 0)
            .text(options.title);

        this.model = model;
        this.options = options;
        this.data = [];

        return this;
    }

    Legend.prototype.add = function(label, color, callback_on, callback_off, mode){
        this.data.push({label:label, color:color, on:callback_on, off:callback_off});

        var new_entry = this.model.selectAll("g")
                .data(this.data)
                .enter()
                .append("g");

        var padding = this.options.title_height;
        var height = this.options.height;

        if(this.options.width/100>2){
            new_entry.attr("transform",function(d, i){
                return "translate("+ ((Math.floor(i/8))*100) +"," + (padding + 25*(i%8)) + ")";
            });
        }else{
            new_entry.attr("transform",function(d, i){
                return "translate(0," + (padding + 25*i) + ")";
            });
        }

        if(color!==undefined){
            var circle = new_entry
                    .append("circle")
                    .attr("cx","8")
                    .attr("cy","8")
                    .attr("r","6")
                    .attr("stroke", function(d){return d.color;})
                    .attr("stroke-width","2")
                    .attr("fill",function(d){return d.color;});

            if(mode == 'off')circle.attr("fill-opacity",0);
            else circle.attr("fill-opacity",1);

            if(callback_on !== undefined && callback_off !== undefined){
                circle
                    .on("click", function(d){
                        var el = d3.select(this);
                        if(el.attr("fill-opacity")==1){
                            el.attr("fill-opacity", 0);
                            d.off();
                        }else{
                            el.attr("fill-opacity", 1);
                            d.on();
                        };
                    })
                    .style("cursor","pointer");
            }
        }

        new_entry.append("text")
            .attr("x","18")
            .attr("y","12")
            .attr("font-size","12")
            .text(function(d){return d.label;});

        if(this.options.middle){
            var height = padding + this.data.length * 25;
            this.model.attr("transform", "translate(" + this.options.margin.left + "," + (this.options.height - height)/2 + ")");
        }
    };

    return Legend;
});
