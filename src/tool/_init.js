define([
    "underscore",
    "core",
    "tool/scale",
    "tool/position",
    "tool/data",
    "tool/accessor"
], function(_, core){
    var args = [].slice.call(arguments, 2);
    return function(){
        _.each(args, function(arg){
            core.register_parser.apply(core, arg);
        });
    };
});
