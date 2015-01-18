define(function(require, exports, module){
    return {
        core: require('core'),
        glyph_manager: require('parser/glyph'),
        sheet_manager: require('parser/sheet'),
        dataframe: require('utils/dataframe')
    };
});
