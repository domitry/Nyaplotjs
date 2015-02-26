define([
    'underscore'
], function(_){
    return [
        "rect",
        ["context", "data", "x", "y"],
        {
            width: 100,
            height: 100,
            color: "steelblue",
            stroke_width: 1,
            stroke_color: "black",
            y_base: "top", // or "bottom"
            x_base: "left" // or "center"
        },
        function(context, data, x, y, options){
            return context
                .selectAll("rect")
                .data(data)
                .enter()
                .append("rect")
                .attr({
                    x: x,
                    y: y,
                    width: options.width,
                    height: options.height,
                    fill: options.color,
                    stroke_width: options.stroke_width,
                    stroke: options.stroke_color,
                    transform: (function(str){
                        if(options.x_base == "center")
                            return (_.isFunction(options.width) ?
                                    function(d){
                                        return str + " translate(" + options.width(d)/2 + ",0)";
                                    }
                                    : str + " translate(" + options.width/2 + ",0)");
                        else return str;
                    })(options.y_base == "bottom" ? "scale(1, -1)" : "")
                });
        }
    ];
});