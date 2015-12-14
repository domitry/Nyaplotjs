define([
    'underscore',
    'd3',
    'layer',
    'utils/svg_utils'
],function(_, d3, LayerBase, svg_utils){
    // {func: , stack: , clear: true}
    var layer_list = {};
    var plots = {};
    var parsers = {};

    function parse(root_txt, model){
        var root_node = d3.select(root_txt);

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
                if(!_.isUndefined(def.parser_type)){
                    if(_.isUndefined(parsers[def.parser_type])){
                        throw new Error("No root parser named " + def.parser_type);
                    }else{
                        return parsers[def.parser_type](p, def, plot.layers);
                    }
                }else{
                    var v = plot.layers[def.uuid];
                    var div = p.append("div");
                    v.node = div;
                    v.children = _.map(def.children, function(cdef){
                        return dfs(div, cdef);
                    });
                    return v;
                }
            }
            
            plot.root = dfs(root_node, model.layout);
        })();

        //// Apply given functions to each components
        plot.render();
    }

    function register_parser(name, parser){
        parsers[name]= parser;
    };

    function register_layer(type_name, required_args, optional_args, parser){
        layer_list[type_name] = LayerBase.inherit(required_args, optional_args, parser);
    }

    function to_png(_root, model){
        this.parse(_root, model);
        var root = d3.select(_root);
        var svg = root.select("svg");
        
        return svg_utils.svg2uri(svg).then(function(uri){
            svg.remove();
            return root.append("img")
                .attr("src", uri);
        });
    };

    return {
        layers: layer_list,
        plots: plots,
        register_layer: register_layer,
        register_parser: register_parser,
        parse: parse,
        to_png: to_png
    };
});
