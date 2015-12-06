define([
    'underscore',
    'core',
    'layers/html/row',
    'layers/html/column',
    'layers/html/widget'
], function(_, core){
    var args = [].slice.call(arguments, 2);

    return function(){
        _.each(args, function(arg){
            core.register_parser.apply(core, arg);
        });
    };
});
