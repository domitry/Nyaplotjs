define([
    "underscore",
    "parser/init",
    "glyph/init",
    "sheet/init"
], function(_, p_init, g_init, s_init){
    return function(){
        _.each([p_init, g_init, s_init], function(init){
            init();
        });
    };
});
