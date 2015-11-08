define([
    "state"
], function(State){
    return [
        "label",
        ["context", "width", "height", "x", "y"],
        {
            margin: {top:0,bottom:0,left:0,right:0},
            rotate_x: 0,
            rotate_y: 0
        },
        function(context, width, height, x_label, y_label, options){
            var g = context;

            g.append("text")
                .attr("x", width/2)
                .attr("y", height + options.margin.bottom/1.5)
                .attr("text-anchor", "middle")
                .attr("fill", "rgb(50,50,50)")
                .attr("font-size", 22)
                .text(x_label);

            g.append("text")
                .attr("x", -options.margin.left/1.5)
                .attr("y", height/2)
                .attr("text-anchor", "middle")
                .attr("fill", "rgb(50,50,50)")
                .attr("font-size", 22)
                .attr("transform", "rotate(-90," + -options.margin.left/1.5 + ',' + height/2 + ")")
                .text(y_label);

            if(options.rotate_y != 0)
                g.selectAll(".y_axis")
                    .selectAll("text")
                    .style("text-anchor", "end")
                    .attr("transform", function(d) {
                        return "rotate(" + options.rotate_y + ")";
                    });

            if(options.rotate_x != 0)
                g.selectAll(".x_axis")
                    .selectAll("text")
                    .style("text-anchor", "end")
                    .attr("transform", function(d) {
                        return "rotate(" + options.rotate_x + ")";
                    });

            return new State();
        }
    ];
});
