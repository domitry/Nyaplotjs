define([
    'underscore',
    'core',
    'utils/parser_tools',
    'layers/svg/glyph/scatter',
    'layers/svg/glyph/line',
    'layers/svg/glyph/histogram',
    'layers/svg/glyph/vectors',
    'layers/svg/glyph/rect',
    'layers/svg/glyph/circle',
    'layers/svg/glyph/text',
    'layers/svg/glyph/area'
], function(_, core, t){
    var args = [].slice.call(arguments, 2);

    return function(){
        _.each(args, function(arg){
            // arg: [name, required_args, optional_args, func]
            // automatically calculate
            var original = arg[3];
            arg[3] = t.auto_bbox(function(){
                original.apply(this, [].slice.call(arguments));
                return this.node;
            });
            core.register_layer.apply(core, arg);
        });
    };
});
