define([
    'underscore',
    'utils/parser_tools'
], function(_, t){
    return [
        "grid",
        ["xscale", "yscale"],
        {
            width: "auto",
            height: "auto",
            color: "#ffffff",
            stroke_width: 1,
            dashed: false
        },
        t.auto_bbox(
            t.auto_append(
                "g.grid",
                function(g, xscale, yscale, options){
                    if(options.width=="auto")
                        options.width = options.children[0].width;

                    if(options.height=="auto")
                        options.height = options.children[0].height;

                    var data = _.map(xscale.ticks(), function(_x){
                        return {val: xscale(_x), orient: "y"};
                    }).concat(_.map(yscale.ticks(), function(_y){
                        return {val: yscale(_y), orient: "x"};
                    }));
                    
                    var axis = g
                            .attr("class", "grid")
                            .selectAll("line")
                            .data(data);

                    updateStyle(axis.enter().append("line"));
                    updateStyle(axis.order());
                    axis.exit().remove();

                    function updateStyle(s){
                        s.attr({
                            x1: function(d){
                                return d.orient == "x" ? 0 : d.val;
                            },
                            y1: function(d){
                                return d.orient == "x" ? d.val : 0;
                            },
                            x2: function(d){
                                return d.orient == "x" ? options.width : d.val;
                            },
                            y2: function(d){
                                return d.orient == "x" ? d.val : options.height;
                            },
                            "stroke": options.color,
                            "stroke-width": options.stroke_width
                        });

                        if(options.dashed==true)
                            s.attr("stroke-dasharray", "5,5");
                    };
                    
                    return g;
                }
            )
        )
    ];
});
