/**
 Fill the area behid glyphs in a specified color (default is gray).
*/
define([
    'utils/parser_tools'
], function(t){
    return [
        "background",
        [],
        {
            dx: 0,
            dy: 0,
            width: "auto",
            height: "auto",
            color: "#eeeeee",
            stroke_width: 1,
            stroke_color: "#666666"
        },
        t.auto_append(
            "rect",
            function(rect, options){
                if(options.width=="auto")
                    options.width = options.children[0].width;

                if(options.height=="auto")
                    options.height = options.children[0].height;
                
                return rect
                    .attr({
                        "x" : options.dx,
                        "y" : options.dy,
                        "width" : options.width,
                        "height" : options.height,
                        "fill" : options.color,
                        "stroke": options.stroke_color,
                        "stroke-width": options.stroke_width
                    });
            }
        )
    ];
});
