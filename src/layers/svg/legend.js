define([
    'underscore',
    'd3',
    'utils/parser_tools'
],function(_, d3, t){
    return [
        "legend",
        ["names"],
        {
            dx: 0,
            dy: 0,
            colors: [],
            default_color: "#000",
            text_color: "#323232",
            font_size: 16,
            radius: 6,
            fill_color: "none",
            stroke_color: "#000",
            stroke_width: 1,
            opacity: 1,
            interactive: true,
            updates: [],
            interval_x: 5,
            interval_y: 3,
            padding: {left: 10, right: 10, top: 20, bottom: 20}
        },
        t.auto_append(
            "g",
            function(g, names, options){
                g.attr({
                    "class": "legend",
                    "transform": "translate("+options.dx+","+options.dy+")"
                });

                var data = (function(){
                    var colors = _.clone(options.colors);
                    if(options.colors.length < names.length){
                        var rest_num = names.length-options.colors.length;
                        var rest = [];
                        _(rest_num).times(function(){rest.push(options.default_color);});
                        colors = colors.concat(rest);
                    }
                    return _.map(_.zip(names, colors), function(arr, i){
                        return {name: arr[0], color: arr[1], index: i, visible: true};
                    });
                })();
                
                var rect = g
                        .selectAll("rect")
                        .data([this.uuid])
                        .enter()
                        .append("rect")
                        .attr({
                            x:0,
                            y:0,
                            fill: options.fill_color,
                            stroke: options.stroke_color,
                            "stroke-width": options.stroke_width
                        });

                var h_per_box = Math.max(options.radius*2, options.font_size);

                var boxes = g
                        .selectAll("g")
                        .data(data)
                        .enter()
                        .append("g")
                        .attr({
                            transform: function(d){
                                return "translate("
                                    + (options.padding.left + options.radius)
                                    + ","
                                    + (options.padding.top + d.index*(h_per_box + options.interval_y))
                                    +  ")"
                                ;
                            }
                        });

                var circles = boxes.append("circle")
                        .attr("cx", 0)
                        .attr("cy", 0)
                        .attr("r", options.radius)
                        .attr("stroke", function(d){return d.color;})
                        .attr("stroke-width","2")
                        .attr("fill",function(d){return d.color;})
                        .attr("fill-opacity", function(d){return (d.visible ? 1 : 0);});

                boxes.append("text")
                    .attr("x", options.radius + options.interval_x)
                    .attr("y", 0)
                    .attr("font-size", options.font_size)
                    .attr("dominant-baseline", "middle")
                    .text(function(d){return d.name;});

                if(options.interactive)
                    circles.on("click", function(d, i){
                        d.visible = !d.visible;
                        d3.select(this).attr("fill-opacity", (d.visible ? 1 : 0));
                        
                        var target = options.updates[i];
                        if(!_.isUndefined(target)){
                            var f = function(l){
                                l.visible = d.visible;
                                l.construct();
                            };
                            if(_.isArray(target))_.each(target, f);
                            else f(target);
                        }
                        d3.event.preventDefault();
                    })
                    .style("cursor", "hand");

                var r = g.node().getBoundingClientRect();
                
                var width = options.width == "auto" ? r.width + options.padding.right + options.padding.left : options.width;
                var height = options.height == "auto" ? r.height + options.padding.bottom : options.height;
                
                rect.attr({
                    width: width,
                    height: height,
                    "fill-opacity": options.opacity
                });

                this.width = width;
                this.height = height;
                
                return g;
            }
        )
    ];
});
