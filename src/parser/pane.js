/*
 * Pane: 
 */

define([
    'underscore',
    'core'
],function(_, core){
    return [
        "pane",
        ["parent_id", "layout"],
        {
        },
        /*
         layout: 
         e.g.
             layout: {type: "rows", contents: [{sync: "uuid-of-stage"}]}
             or
             layout:{type: "columns", contents: [{type: "rows", contents: []}, {}]}
         */
        function(parent_id, layout, options){
            var parent = d3.select("#" + parent_id);

            var parse_layout = function(parent, model){
                if(!_.has(model, "type")){
                    // svg should be d3.selection
                    var svg = core.get(model.sync);
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
