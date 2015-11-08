define(function(require, exports, module){
    var _ = require("underscore");
    (require("parser/init"))();
    (require("glyph/init"))();
    (require("sheet/init"))();

    return _.extend({
        core: require('core'),
        glyph_manager: require('glyph'),
        sheet_manager: require('sheet')
    }, require('simple/init'));
});
