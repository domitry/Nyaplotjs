define([
    'underscore',
    'core',
    'utils/parser_tools',
    'layer_svg/glyph/scatter',
    'layer_svg/glyph/line',
    'layer_svg/glyph/histogram',
    'layer_svg/glyph/vectors',
    'layer_svg/glyph/rect',
    'layer_svg/glyph/circle',
    'layer_svg/glyph/text'
//  'layer_svg/glyph/box'
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
            core.register_parser.apply(core, arg);
        });
    };
});
