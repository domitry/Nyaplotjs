define([
    "underscore",
    "core",
    "layers/tool/scale",
    "layers/tool/position",
    "layers/tool/data",
    "layers/tool/accessor",
    "layers/tool/d2c"
], function(_, core){
    var args = [].slice.call(arguments, 2);
    return function(){
        _.each(args, function(arg){
            core.register_layer.apply(core, arg);
        });
    };
});
