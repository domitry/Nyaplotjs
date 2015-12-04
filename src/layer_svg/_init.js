define([
    'underscore',
    'core',
    'layer_svg/axis',
    'layer_svg/background',
    'layer_svg/grid',
    'layer_svg/label',
    'layer_svg/math_label',
    'layer_svg/context',
    'layer_svg/stage2d',
    'layer_svg/column',
    'layer_svg/row',
    'layer_svg/stack',
    'layer_svg/legend',
    'layer_svg/wheel_zoom'
    //'layer_svg/brush_zoom',
    //'layer_svg/pane',
    //'layer_svg/tooltip'
], function(_, core){
    var args = [].slice.call(arguments, 2);

    return function(){
        _.each(args, function(arg){
            core.register_parser.apply(core, arg);
        });
    };
});
