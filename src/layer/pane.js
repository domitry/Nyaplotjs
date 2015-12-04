/*
 * Pane: 
 */

define([
    'underscore',
    'core'
],function(_, core){
    return [
        "pane",
        ["parent_id", "layout", "stages"],
        {
        },
        /*
         parse layout object recursively.
         
         layout: 
         e.g.
             layout: {type: "rows", contents: [0]}
             or
             layout:{type: "columns", contents: [{type: "rows", contents: []}, {}]}
         */
        function(parent_id, layout, stages, options){
            var parent = d3.select("#" + parent_id);

            // initialize node
            (function(){
                var node = parent.node();
                _.each(node.children, function(child){
                    node.removeChild(child);
                });
            })();

            var parse_layout = function(parent, model){
                if(_.isNumber(model)){
                    if(_.isUndefined(stages[model]))
                        throw("The required stage not given:"+model+".");
                    
                    var svg = stages[model];
                    parent.node().appendChild(svg.node());
                    return;
                }else{
                    switch(model.type){
                    case "columns":
                        var columns_root = parent
                            .append("div")
                            .style({
                                "display" : "table"
                            });

                        _.each(model.contents, function(next_model){
                            var child = columns_root.append("div")
                                    .style("display", "table-cell");
                            parse_layout(child, next_model);
                        });
                        break;
                    case "rows":
                        var rows_root = parent.append("div");

                        _.each(model.contents, function(next_model){
                            var child = rows_root.append("div");
                            parse_layout(child, next_model);
                        });
                        break;
                    default:
                        return;
                    }
                }
                return;
            };

            parse_layout(parent, layout);
        }
    ];
});
