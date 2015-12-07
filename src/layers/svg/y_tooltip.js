define([
    "underscore",
    "d3"
], function(_, d3){
    return [
        "ytooltip",
        ["targets", "target_types", "xlabels", "ylabels", "positions"],
        {
            x: 0
        },
        function(g, targets, target_types, xlabels, ylabels, positions, options){
            _.each(targets, function(target, i){
                var target_type = target_types[i];
                var position = positions[i];
                var xlabel = xlabels[i];
                var ylabel = ylabels[i];
                
                var pos = position(xlabel, ylabel);

                var tooltip = (function(){
                    var tp = g.append("g")
                            .style("visibility", "hidden");
                    
                    tp.append("path")
                        .datum([
                            {x: 0, y: 0},
                            {x: -10, y: -10},
                            {x: -10, y:  10}
                        ])
                        .attr({
                            d: d3.svg.line()
                                .x(function(d){return d.x;})
                                .y(function(d){return d.y;}),
                            stroke: "black",
                            fill: "black"
                        });
                    
                    tp.append("rect")
                        .attr({
                            x: -10,
                            y: -10,
                            stroke :"none",
                            "stroke-width": 0,
                            fill: "black",
                            width: 10,
                            height: 20
                        });

                    tp.append("text")
                        .text("")
                        .attr({
                            x: -10,
                            y: 0,
                            "dominant-baseline": "middle",
                            "text-anchor": "end",
                            "font-size": 13,
                            fill: "white"
                        });
                    
                    return tp;
                })();

                var t = target.node.selectAll(target_type)
                        .on("mouseover", function(d){
                            var y = pos.y(d);
                            var text = d[ylabel];
                            tooltip.attr("transform", "translate(0," + y + ")");
                            tooltip.style("visibility", "visible");
                            var t = tooltip.select("text").text(text);
                            var r = t.node().getBoundingClientRect();
                            tooltip.select("rect")
                                .attr({
                                    x: -10 -r.width - 5,
                                    width: r.width + 5
                                });
                            var c = d3.select(this).attr("fill");
                            d3.select(this).attr("fill", d3.rgb(c).darker(0.5));
                            
                        })
                        .on("mouseout", function(d){
                            tooltip.style("visibility", "hidden");
                            
                            var c = d3.select(this).attr("fill");
                            d3.select(this).attr("fill", d3.rgb(c).brighter(0.5));
                        });

            });
        }
    ];
});
