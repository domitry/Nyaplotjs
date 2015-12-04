define([
    'underscore',
    'utils/parser_tools'
], function(_, t){
    return [
        "rect",
        ["data", "x", "y", "position"],
        {
            box_width: 100,
            box_height: 100,
            color: "steelblue",
            stroke_width: 1,
            stroke_color: "black",
            center_x: false,
            center_y: false,
            rotate: 0
        },
        function(g, data, x, y, position, options){
            var pos = position(x, y);
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
                    return "translate(" + pos.x(d) +  "," + pos.y(d) + ")";
                })
                .attr({
                    width: function(d){
                        var next = {};
                        next[x] = d[x] + options.box_width;
                        next[y] = d[y] + options.box_height;
                        return Math.abs(pos.x(d) - pos.x(next));
                    },
                    height: function(d){
                        var next = {};
                        next[x] = d[x] + options.box_width;
                        next[y] = d[y] + options.box_height;
                        return Math.abs(pos.y(d) - pos.y(next));
                    }
                });
        }
    ];
});
