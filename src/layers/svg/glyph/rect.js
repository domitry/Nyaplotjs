define([
    'underscore',
    'd3'
], function(_, d3){
    return [
        "rect",
        ["data", "x1", "y1", "x2", "y2", "position"],
        {
            color: "steelblue",
            stroke_width: 1,
            stroke_color: "black",
            center_x: false,
            center_y: false,
            rotate: 0
        },
        function(g, data, x1, y1, x2, y2, position, options){
            var pos1 = position(x1, y1);
            var pos2 = position(x2, y2);
            
            g
                .selectAll("rect")
                .data(data.asarray())
                .enter()
                .append("rect")
                .attr({
                    x: 0,
                    y: 0,
                    fill: options.color,
                    stroke_width: options.stroke_width,
                    stroke: options.stroke_color,
                    transform: function(){
                        var txt = "translate(";
                        txt += (options.center_x ? d3.select(this).attr("width")/2: 0) + ",";
                        txt += (options.center_y ? d3.select(this).attr("height")/2: 0) + ") ";
                        if(options.rotate != 0)
                            txt += "rotate(" + options.rotate + ")";
                        return txt;
                    }
                });

            return g.selectAll("rect")
                .attr("transform", function(d){
                    return "translate(" + pos1.x(d) +  "," + pos1.y(d) + ")";
                })
                .attr({
                    width: function(d){
                        return Math.abs(pos1.x(d) - pos2.x(d));
                    },
                    height: function(d){
                        return Math.abs(pos1.y(d) - pos2.y(d));
                    }
                })
                .style("visibility", options.visible ? "visible" : "hidden");
        }
    ];
});
