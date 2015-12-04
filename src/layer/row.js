/**
Order two child layers as rows:
 +------+
 |  c1  |
 +------+
 |  c2  |
 +------+
*/
define([
    'underscore',
    'd3',
    'utils/parser_tools'
],function(_, d3, t){
    return [
        "row",
        [],
        {
            children: [],
            percent: [0.5, 0.5]
        },
        function(g, options){
            function get_w(c){
                return c.width + c.margin.left + c.margin.right;
            }

            function get_h(c){
                return c.height + c.margin.top + c.margin.bottom;
            }
            
            var tw = get_w(options.children[0]);
            var bw = get_w(options.children[1]);
            var th = get_h(options.children[0]);
            var bh = get_h(options.children[1]);
            
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

            var trans = [{x: 0, y: 0}, {x: 0, y: 0}];

            // Move the bottom child
            if(_.isNumber(th = get_h(options.children[0]))){
                trans[1].y = th;
            }

            _.each(options.children, function(child, i){
                trans[i].x += child.margin.left;
                trans[i].y += child.margin.top;
                
                if(child.xalign == "center")
                    trans[i].x += (options.width - get_w(child))/2;

                if(child.yalign == "center")
                    trans[i].y += get_h(child)/2;
            });

            _.each(g.node().childNodes, function(node, i){
                d3.select(node)
                    .attr("transform", "translate(" + trans[i].x + "," + trans[i].y + ")");
            });
            
            return g;
        }
    ];
});
