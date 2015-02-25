define([
    'underscore',
    'glyph',
    'glyph/scatter',
    'glyph/line',
    'glyph/histogram',
    'glyph/vectors'
], function(_, glyph, scatter){
    var args = [].slice.call(arguments, 2);

    return function(){
        _.each(args, function(arg){
            glyph.register_glyph.apply(glyph, arg);
        });
    };
});
