/*
 * SimpleLegend provides legend consists of simple circle buttons and labels.
 */

define([
    'underscore',
    'core/manager'
],function(_, Manager){
    function SimpleLegend(data, _options){
        var options = {
            title: '',
            width: 150,
            height: 22,
            title_height: 15,
            mode: 'normal' // or 'radio'
        };
        if(arguments.length>1)_.extend(options, _options);

        this.model = d3.select(document.createElementNS("http://www.w3.org/2000/svg", "g"));
        this.options = options;
        this.data = data;

        return this;
    }

    SimpleLegend.prototype.width = function(){
        return this.options.width;
    };

    SimpleLegend.prototype.height = function(){
        return this.options.height * (this.data.length + 1);
    };

    SimpleLegend.prototype.getDomObject = function(){
        var model = this.model;
        var options = this.options;

        model.append("text")
            .attr("x", 12)
            .attr("y", options.height)
            .attr("font-size","14")
            .text(options.title);

        var entries = this.model.selectAll("g")
                .data(this.data)
                .enter()
                .append("g");

        var circle = entries
                .append("circle")
                .attr("cx","8")
                .attr("cy",function(d, i){return options.height*(i+1);})
                .attr("r","6")
                .attr("stroke", function(d){return d.color;})
                .attr("stroke-width","2")
                .attr("fill",function(d){return d.color;})
                .attr("fill-opacity", function(d){return (d.mode=='off' ? 0 : 1);});

        switch(options.mode){
            case 'normal':
            circle
                .on("click", function(d){
                    if(!(!d['on'] && !d['off'])){
                        var el = d3.select(this);
                        if(el.attr("fill-opacity")==1){
                            el.attr("fill-opacity", 0);
                            d.off();
                        }else{
                            el.attr("fill-opacity", 1);
                            d.on();
                        };
                    }
                });
            break;
            case 'radio':
            circle.on("click", function(d){
                var el = d3.select(this);
                if(el.attr("fill-opacity")==0){
                    var thisObj = this;
                    circle.filter(function(d){return (this!=thisObj && !(!d['on'] && !d['off']));})
                        .attr("fill-opacity", 0);
                    el.attr("fill-opacity", 1);
                    d.on();
                }
            });
            break;
        }

        circle.style("cursor", function(d){
            if(d['on'] == undefined && d['off'] == undefined)return "default";
            else return "pointer";
        });
        
        entries.append("text")
            .attr("x","18")
            .attr("y",function(d,i){return options.height*(i+1)+4;})
            .attr("font-size","12")
            .text(function(d){return d.label;});

        return model;
    };

    return SimpleLegend;
});
