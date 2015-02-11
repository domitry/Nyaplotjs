define([
    'underscore',
    'glyph',
    'glyph/scatter'
], function(_, glyph, scatter){
    var args = [scatter];

    return function(){
        _.each(args, function(arg){
            glyph.register_glyph.apply(glyph, arg);
        });
    };
});
