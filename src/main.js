define(function(require, exports, module){
    (require("parser/init"))();
    (require("glyph/init"))();
    (require("sheet/init"))();

    return {
        core: require('core'),
        glyph_manager: require('glyph'),
        sheet_manager: require('sheet')
    };
});
