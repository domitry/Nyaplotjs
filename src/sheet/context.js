require([
    "underscore",
    "node-uuid",
    "core",
    "parser/sheet"
], function(_, node_uuid, core, sheet){
    /*
     *  parent
     *       +--clipPath--rect
     *       |
     *       +--root
     *             +--glyph0
     *             +--glyph1
     */
    sheet.register_sheet(
        "context2d",
        ["parent", "glyphs"],
        {
            width: 500,
            height: 500
        },
        function(parent, glyphs, options){
            var unique_id = node_uuid.v4() + "clip_context";
            var g = parent.append("g").attr("class", "context");

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

            _.each(glyphs, function(uuid){
                var glyph = core.get(uuid);
                var raw_g = glyph.node().parentNode;
                root.node().appendchild(raw_g);
            });
        });
});
