define([
    'underscore',
    'd3'
], function(_, d3){
    return [
        "svg",
        function(root, model, layers){
            var svg = d3.select(document.createElementNS("http://www.w3.org/2000/svg", "svg"));
            root.node().appendChild(svg.node());
            
            //// Build components-tree based on layout
            //// Construct DOM tree based on layout
            //// def: {uuid: "u-u-i-d", children: []}
            function dfs(p, def){
                var v = layers[def.uuid];
                v.node = p;
                if(!_.isUndefined(def.children))
                    v.children = _.map(def.children, function(c){
                        return dfs(v.node.append("g"), c);
                    });
                return v;
            }

            return dfs(svg, model);
        }
    ];
});
