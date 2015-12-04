define([
    'underscore',
    'core',
    'layers/svg/axis',
    'layers/svg/background',
    'layers/svg/grid',
    'layers/svg/label',
    'layers/svg/math_label',
    'layers/svg/context',
    'layers/svg/stage2d',
    'layers/svg/column',
    'layers/svg/row',
    'layers/svg/stack',
    'layers/svg/legend',
    'layers/svg/wheel_zoom'
    //'layers/svg/brush_zoom',
    //'layers/svg/pane',
    //'layers/svg/tooltip'
], function(_, core){
    var args = [].slice.call(arguments, 2);

    return function(){
        _.each(args, function(arg){
            core.register_parser.apply(core, arg);
        });
    };
});
