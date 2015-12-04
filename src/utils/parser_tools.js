define([
    'underscore',
    'd3',
    'utils/args2arr'
], function(_, d3, args2arr){
    return {
        auto_bbox: function(func){
            return function(){
                var s = func.apply(this, args2arr(arguments));
                var rect = s.node().getBoundingClientRect();

                if(this.width == "auto" || this.width < rect.width){
                    this.width = rect.width;
                }
                
                if(this.height == "auto" || this.height < rect.height){
                    this.height = rect.height;
                }
                
                return s;
            };
        },
        auto_append: function(str, func){
            return function(g){
                var arr = args2arr(arguments);
                var node_name = "", class_name;

                if(str.indexOf(".")!=-1){
                    var m = str.match(/(.+)\.(.+)/);
                    if(m){
                        node_name = m[1];
                        class_name = m[2];
                    }
                }
                else
                    node_name = str;

                var nodes = _.select(g.node().childNodes, function(c){
                    var tf = (c.nodeName == node_name);
                    return _.isUndefined(class_name) ? tf : (tf&(d3.select(c).attr("class")==class_name));
                });

                arr[0]= (function(){
                    if(nodes.length==0){
                        var new_node = document.createElementNS("http://www.w3.org/2000/svg", node_name);
                        
                        g.node().insertBefore(
                            new_node,
                            g.node().children[0]
                        );
                        return d3.select(new_node);
                    }
                    else
                        return d3.select(nodes[0]);
                })();

                return func.apply(this, arr);
            };
        },
        auto2zero: function(val){
            return val == "auto" ? 0 : val;
        },
        add_default_args: function(obj){
            return _.extend({
                width: "auto",
                height: "auto",
                margin: {top: 0, bottom: 0, left: 0, right:0},
                visible: true
            }, obj);
        }
    };
});
