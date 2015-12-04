/**
 Order two child layers as rows:
 +------+
 |  c1  |
 +------+
 |  c2  |
 +------+
*/
define([
    'underscore'
],function(_){
    return [
        "row",
        [],
        {
            width: "auto",
            height: "auto",
            children: [],
            percent: [0.5, 0.5]
        },
        function(g, options){
            var bw = options.children[0].width;
            var tw = options.children[1].width;
            var bh = options.children[0].height;
            var th = options.children[1].height;
            
            var auto2zero = function(val){
                return _.isNumber(val) ? val : 0;
            };

            //// update w&h of itself
            if(options.width == "auto" && _.any([bw, tw], _.isNumber))
                options.width = _.max([auto2zero(bw), auto2zero(tw)]);

            if(options.height == "auto" && _.any([bh, th], _.isNumber))
                options.height = auto2zero(bh) + auto2zero(th);
            
            //// update w&h of children
            if(options.height != "auto"){
                var sorted = _.sortBy(options.children, 'height');
                var num = _.select([bh, th], function(val){return !_.isNumber(val);}).length;
                switch(num){
                case 1:
                    sorted[1].height = options.height - sorted[0].height;
                    if(sorted[1].height < 0)console.warn("height of " + sorted[1] + " under zero");
                    break;
                case 2:
                    _.each(options.children, function(child, i){
                        child.height = options.height*options.percent[i];
                    });
                }
            }

            /*
            if(options.width != "auto"){
                options.children[0].width = options.width;
                options.children[1].width = options.width;
            }*/

            var trans = [{x: 0, y: 0}, {x: 0, y: 0}];

            // Move the bottom child
            if(_.isNumber(th = options.children[0].height)){
                trans[1].y = th;
            }

            _.each(options.children, function(child, i){
                if(child.xalign == "center")
                    trans[i].x += (options.width - child.width)/2;
            });

            _.each(options.children, function(child, i){
                if(child.yalign == "center")
                    trans[i].y += child.height/2;
            });

            _.each(g.node().childNodes, function(node, i){
                d3.select(node)
                    .attr("transform", "translate(" + trans[i].x + "," + trans[i].y + ")");
            });
            
            return g;
        }
    ];
});
