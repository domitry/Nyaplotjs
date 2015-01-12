require([
    "underscore",
    "core/parser_manager"
], function(_, parser_manager){
    parser_manager.register_parser(
        "Stage2D",
        ["parent", "layer0", "layer1"],
        {},
        function(parent, layer0, layer1, options){
            var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            var g0 = parent.appned("g");
            var g1 = parent.appned("g");
            
            _.each(layer1, function(uuid){
                var g = parser_manager.get(uuid).parent;
                g1.each(function(){this.appendchild(g);});
            });

            _.each(layer0, function(uuid){
                
            });

            return d3.select(svg);
        }
    );
});
