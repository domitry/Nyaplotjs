define([
    'utils/parser_tools'
], function(t){
    return [
        "label",
        ["text"],
        {
            dx: 0,
            dy: 0,
            width: "auto",
            height: "auto",
            x_align: "center",
            y_align: "center",
            text_anchor: "auto",
            dominant_baseline: "central",
            font_size: 22,
            color: "#323232",
            rotate: 0,
            margin: {left: 10, right: 10, top: 10, bottom: 10}
        },
        t.auto_bbox(
            t.auto_append(
                "text",
                function(text, str, options){
                    return text
                        .attr("x", options.dx)
                        .attr("y", options.dy)
                        .attr("text-anchor", options.text_anchor)
                        .attr("dominant-baseline", options.dominant_baseline)
                        .attr("fill", options.color)
                        .attr("font-size", options.font_size)
                        .attr("transform", "rotate(" + options.rotate + ")")
                        .text(str);
                }
            )
        )
    ];
});
