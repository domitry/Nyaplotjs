define([
    'underscore',
    'core',
    'layer/axis',
    'layer/background',
    'layer/grid',
    'layer/label',
    'layer/math_label',
    'layer/context',
    'layer/stage2d',
    'layer/column',
    'layer/row',
    'layer/stack',
    'layer/legend',
    'layer/wheel_zoom'
    //'layer/brush_zoom',
    //'layer/pane',
    //'layer/tooltip'
], function(_, core){
    var args = [].slice.call(arguments, 2);

    return function(){
        _.each(args, function(arg){
            core.register_parser.apply(core, arg);
        });
    };
});
