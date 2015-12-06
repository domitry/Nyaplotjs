define([
    'underscore',
    'd3'
], function(_, d3){
    return [
        "html_row",
        [],
        {},
        function(div, options){
            var width = _.max(
                _.select(options.children, function(c){
                    return c.width != "auto";
                }),function(c){
                    return c.width;
                }
            ).width;

            div.style({
                width: width
            });
            
            return div;
        }
    ];
});
