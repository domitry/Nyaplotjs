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
            _.each([["width", "left", "right"], ["height", "top", "bottom"]], function(arr){
                var n=arr[0], p1=arr[1], p2=arr[2];
                if(options[n] == "auto")
                    options[n] = _.max(_.map(options.children, function(c){
                        return c[n] + c.margin[p1] + c.margin[p2];
                    }));
            });

            _.each(options.children, function(c){
                var dx=c.margin.left, dy=c.margin.top;
                c.node.attr("transform("+dx+","+dy+")");
            });
            
            return svg
                .style({
                    width: options.width,
                    height: options.height
                });
        }
    ];
});
