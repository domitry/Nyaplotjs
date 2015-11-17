define([
    'underscore',
    'glyph',
    'glyph/scatter',
    'glyph/line',
    'glyph/histogram',
    'glyph/vectors',
    'glyph/rect',
    'glyph/circle',
    'glyph/text'
], function(_, glyph){
    var args = [].slice.call(arguments, 2);

    return function(){
        _.each(args, function(arg){
            glyph.register_glyph.apply(glyph, arg);
        });
    };
});
