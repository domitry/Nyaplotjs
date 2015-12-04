define([
    'underscore'
], function(_){
    return [
        "rect",
        ["data", "x", "y", "position"],
        {
            width: 100,
            height: 100,
            color: "steelblue",
            stroke_width: 1,
            stroke_color: "black",
            center_x: false,
            center_y: false,
            rotate: 0
        },
        function(context, data, x, y, position, options){
            var pos = position(x, y);
            return context
                .selectAll("rect")
                .data(data.asarray())
                .enter()
                .append("rect")
                .attr({
                    x: pos.x,
                    y: pos.y,
                    width: options.width,
                    height: options.height,
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
        }
    ];
});
