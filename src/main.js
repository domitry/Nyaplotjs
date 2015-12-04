define(function(require, exports, module){
    var _ = require('underscore');
    (require('layer/_init'))();
    (require('glyph/_init'))();
    (require('tool/_init'))();

    return {
        core: require('core'),
        Simple: (require('simple/_init'))()
    };
});
