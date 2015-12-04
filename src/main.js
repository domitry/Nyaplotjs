define(function(require, exports, module){
    var _ = require('underscore');
    (require('layer/_init'))();
    (require('glyph/_init'))();
    (require('tool/_init'))();
    
    var core = require('core');
    core.register_root_parser.apply(null, require('parser'));

    return {
        d3: require('d3'),
        core: core,
        Simple: (require('simple/_init'))()
    };
});
