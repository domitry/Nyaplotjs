define([
    "underscore",
    "core",
    "parser/stage2d",
    "parser/scale",
    "parser/position",
    "parser/pane",
    "parser/data",
    "parser/row_scale",
    "parser/df_scale"
], function(_, core){
    var args = [].slice.call(arguments, 2);
    return function(){
        _.each(args, function(arg){
            core.register_parser.apply(core, arg);
        });
    };
});
