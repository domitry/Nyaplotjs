define(function(require, exports, module){
    require("pane");
    require("stage2d");

    require("parser/data");
    require("parser/scale");
    require("glyph/scatter");

    require("sheet/axis");
    require("sheet/background");
    require("sheet/label");
    require("sheet/tooltip");
    require("sheet/context");

    return {
        core: require('core'),
        glyph_manager: require('parser/glyph'),
        sheet_manager: require('parser/sheet'),
        dataframe: require('utils/dataframe')
    };
});
