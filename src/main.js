define(function(require, exports, module){
    var _ = require('underscore');
    (require('layer/_init'))();
    (require('glyph/_init'))();
    (require('tool/_init'))();

    return {
        d3: require('d3'),
        core: require('core'),
        Simple: (require('simple/_init'))()
    };
});
