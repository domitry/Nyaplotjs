define(function(require, exports, module){
    var init = require("init");
    init();

    return {
        core: require('core'),
        glyph_manager: require('glyph'),
        sheet_manager: require('sheet')
    };
});
