define([
    "underscore",
    "core",
    "layer_tool/scale",
    "layer_tool/position",
    "layer_tool/data",
    "layer_tool/accessor"
], function(_, core){
    var args = [].slice.call(arguments, 2);
    return function(){
        _.each(args, function(arg){
            core.register_parser.apply(core, arg);
        });
    };
});
