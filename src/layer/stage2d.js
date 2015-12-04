define([
    "underscore",
    "core"
], function(_, core){
    return [
        "stage",
        [],
        {
            width: "auto",
            height: "auto",
            children: []
        },
        function(svg, options){
            _.each(["width", "height"], function(p){
                if(options[p] == "auto")
                    options[p] = _.max(_.map(options.children, function(c){
                        return c[p];
                    }));
            });
            
            return svg
                .style({
                    width: options.width,
                    height: options.height
                });
        }
    ];
});
