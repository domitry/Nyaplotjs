/*
 * parse:
 *
 * parse JSON model and generate plots based on the order.
 *
 */

define([
    'underscore',
    'layer'
],function(_, LayerBase){
    // {func: , stack: , clear: true}
    var layer_list = {};
    var plots = {};

    function parse(root, model){
        var svg = d3.select(document.createElementNS("http://www.w3.org/2000/svg", "svg"));
        d3.select(root).node().appendChild(svg.node());
        
        var plot = {root: null, layers: {}, render: function(){
            function dfs(l){
                _.each(l.children, function(c){dfs(c);});
                l.construct();
            }
            dfs(this.root);
        }};
        
        plots[model.uuid] = plot;
        
        //// Instantiate each components based on defs
        (function(){
            function sync(uuid){
                var layer = plot.layers[uuid];
                if(layer.is_raw)
                    return layer.construct();
                else
                    return layer;
            }
            
            _.each(model.defs, function(task){
                var Layer = layer_list[task.type];
                if(_.isUndefined(Layer))console.warn("No layer type named " + task.type + ".");
                var layer = new Layer(task.args, task.sync_args);
                layer.sync = sync;
                plot.layers[task.uuid]= layer;
            });
        })();
        
        //// Build components-tree based on layout
        //// Construct DOM tree based on layout
        //// def: {uuid: "u-u-i-d", children: []}
        (function(){
            function dfs(p, def){
                var v = plot.layers[def.uuid];
                v.node = p;
                if(!_.isUndefined(def.children))
                    v.children = _.map(def.children, function(c){
                        return dfs(v.node.append("g"), c);
                    });
                return v;
            }
            plot.root = dfs(svg, model.layout);
        })();

        //// Apply given functions to each components
        plot.render();
    }

    function register_parser(type_name, required_args, optional_args, parser){
        layer_list[type_name] = LayerBase.inherit(required_args, optional_args, parser);
    }



    return {
        layers: layer_list,
        plots: plots,
        register_parser: register_parser,
        parse: parse,
    };
});
