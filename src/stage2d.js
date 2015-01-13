require([
    "underscore",
    "node-uuid",
    "core"
], function(_, node_uuid, core){
    core.register_parser(
        "stage2D",
        ["parent", "layer0", "layer1"],
        {
            margin_x: 10,
            margin_y: 10,
            with: 500,
            height: 500
        },
        /*
         * Construct DOM tree as follows:
         *
         * svg--g (root_g)
         *      |
         *      +-- g0 (root_layer0)
         *      |
         *      +-- g1
         *           +--clipPath--rect
         *           |
         *           +--root_layer0
         *
         * Glyphs (e.g. scatter, rect, box...) are appended to root_layer1.
         * Other components (e.g. axis, background...) are appended to root_layer0.
         */
        function(layer0, layer1, options){
            var svg = d3.select(document.createElementNS("http://www.w3.org/2000/svg", "svg"));

            var root = svg.append("g")
                    .attr("transform", "translate(" + options.margin_x  + "," + options.margin_y + ")")
                    .attr("class", "root");

            var g0 = root.appned("g").attr("class", "g0");
            var g1 = root.appned("g").attr("class", "g1");
            var unique_id = node_uuid.v4() + "clip_context";

            g1
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

            var root_layer0 = g0,
                root_layer1 = g1.append("g");
            
            // glyph: selection of path, rect, circle... Their parent is always "g" element.
            _.each(layer1, function(uuid){
                var glyph = core.get(uuid);
                var raw_g = glyph.node().parentNode;
                root_layer1.node().appendchild(raw_g);
            });

            // component: selection of "g" element.
            _.each(layer0, function(uuid){
                var component = core.get(uuid);
                var raw_g = component.node();
                root_layer0.node().appendchild(raw_g);
            });

            return svg;
        }
    );
});
