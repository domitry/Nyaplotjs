/*
 * parse:
 *
 * parse JSON model and generate plots based on the order.
 *
 */

define([
    'underscore',
    'd3',
    'layer'
],function(_, d3, LayerBase){
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
                    if(v.type == "html_column" || v.type == "html_row"){
                        var div = p.append("div");
                        v.node = div;
                        _.each(def.children, function(cdef){
                            dfs(div, cdef);
                        });
                        return v;
                    }
                    else {
                        throw new Error("Invalid layout: " + def);
                    }
                }
            }
            
            plot.root = dfs(root_node, model.layout);
        })();

        //// Apply given functions to each components
        plot.render();
    }

    function register_root_parser(name, parser){
        parsers[name]= parser;
    };

    function register_parser(type_name, required_args, optional_args, parser){
        layer_list[type_name] = LayerBase.inherit(required_args, optional_args, parser);
    }

    function to_png(_root, model){
        this.parse(_root, model);
        var root = d3.select(_root);
        var svg = root.select("svg");
        var origSvgNode = svg.node();
        var rect = svg.node().getBoundingClientRect();
        var width = rect.width;
        var height = rect.height;

        var svgNode = origSvgNode.cloneNode(true);
            d3.select(svgNode).attr({
                version: '1.1',
                xmlns: 'http://www.w3.org/2000/svg',
                'xmlns:xlink': 'http://www.w3.org/1999/xlink',
                width: width,
                height: height
            });
        
        var base64SvgText = window
                .btoa(encodeURIComponent(svgNode.outerHTML)
                      .replace(/%([0-9A-F]{2})/g, function (match, p1) {
                          return String.fromCharCode('0x' + p1);
                      }));
        
        (function(svgData, width, height){
            var src = 'data:image/svg+xml;charset=utf-8;base64,' + svgData;
            var canvas = document.createElement('canvas');
            var context = canvas.getContext('2d');
            var image = new window.Image();
            
            canvas.width = width;
            canvas.height = height;

            return new Promise(function(resolve, reject){
                image.onload = function () {
                    context.drawImage(image, 0, 0);
                    resolve(canvas.toDataURL('image/png'));
                };
                image.src = src;
            });
        })(
            base64SvgText,
            width,
            height
        ).then(function(uri){
            svg.remove();
            root.append("img")
                .attr("src", uri);
        });
    };

    return {
        layers: layer_list,
        plots: plots,
        register_parser: register_parser,
        register_root_parser: register_root_parser,
        parse: parse,
        to_png: to_png
    };
});
