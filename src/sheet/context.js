define([
    "underscore",
    "utils/uuid",
    "core",
    "state"
], function(_, uuid, core, State){
    /*
     *  parent
     *       +--clipPath--rect
     *       |
     *       +--root
     *             +--glyph0
     *             +--glyph1
     */
    return [
        "context2d",
        ["parent", "glyphs"],
        {
            width: 500,
            height: 500
        },
        function(context, glyphs, options){
            var unique_id = uuid() + "clip_context";
            var g = context.attr("class", "context");

            g
                .attr("clip-path","url(#" + unique_id + ")")
                .append("clipPath")
                .attr("id", unique_id)
                .append("rect")
                .attr({
                    "x" : 0,
                    "y" : 0,
                    "width" : options.width,
                    "height" : options.height
                });

            var root = g.append("g");

            _.each(glyphs, function(glyph){
                var raw_g = glyph.selection.node().parentNode;
                root.node().appendChild(raw_g);
            });

            return new State();
        }
    ];
});
