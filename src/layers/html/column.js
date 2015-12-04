define([
    'underscore',
    'd3'
], function(_, d3){
    return [
        "html_column",
        [],
        {},
        function(div, options){
            div.style("display", "table");
            
            _.each(div.node().childNodes, function(node){
                d3.select(node).style("display", "table-cell");
            });

            return div;
        }
    ];
});
