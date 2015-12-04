/**
 Order two child layers as columns:
 +--+--+
 |  |  |
 |c1|c2|
 |  |  |
 +--+--+
*/
define([
    'underscore'
],function(_){
    return [
        "column",
        [],
        {
            width: "auto",
            height: "auto",
            children: [],
            percent: [0.5, 0.5]
        },
        function(g, options){
            var rw = options.children[0].width;
            var lw = options.children[1].width;
            var rh = options.children[0].height;
            var lh = options.children[1].height;
            
            var auto2zero = function(val){
                return _.isNumber(val) ? val : 0;
            };

            //// update w&h of itself
            if(options.width == "auto" && _.any([rw, lw], _.isNumber))
                options.width = auto2zero(rw) + auto2zero(lw);

            if(options.height == "auto" && _.any([rw, lw], _.isNumber))
                options.height = _.max([auto2zero(rh), auto2zero(lh)]);
            
            //// update w&h of children
            if(options.width != "auto"){
                var sorted = _.sortBy(options.children, 'width');
                var num = _.select([rw, lw], function(val){return !_.isNumber(val);}).length;
                switch(num){
                case 1:
                    sorted[1].width = options.width - sorted[0].width;
                    if(sorted[1].width < 0)console.warn("width of " + sorted[1] + " under zero");
                    break;
                case 2:
                    _.each(options.children, function(child, i){
                        child.width = options.width*options.percent[i];
                    });
                }
            }

            /*
            if(options.height != "auto"){
                options.children[0].height = options.height;
                options.children[1].height = options.height;
            }*/

            var trans = [{x: 0, y: 0}, {x: 0, y: 0}];
            
            // Move the right child
            if(_.isNumber(lw = options.children[0].width))
                trans[1].x += lw;

            _.each(options.children, function(child, i){
                if(child.xalign == "center")
                    trans[i].x += child.width/2;
            });

            _.each(options.children, function(child, i){
                if(child.yalign == "center")
                    trans[i].y += (options.height - child.height)/2;
            });

            _.each(g.node().childNodes, function(node, i){
                d3.select(node)
                    .attr("transform", "translate(" + trans[i].x + "," + trans[i].y + ")");
            });
            
            return g;
        }
    ];
});
