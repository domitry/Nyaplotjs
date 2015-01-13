define([], function(){
    return {
        required_args: ["context"],
        optional_args: {},
        func: function(context, options){
            var g = context.append("g");

            g.append("text")
                .attr("x", options.width/2)
                .attr("y", options.height + options.margin.bottom/1.5)
                .attr("text-anchor", "middle")
                .attr("fill", "rgb(50,50,50)")
                .attr("font-size", 22)
                .text(options.x_label);



            return g;
        }
    };
});
