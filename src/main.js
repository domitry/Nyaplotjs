define(function(require, exports, module){
    var _ = require('underscore');
    (require('layers/svg/_init'))();
    (require('layers/svg/glyph/_init'))();
    (require('layers/tool/_init'))();
    
    var core = require('core');
    core.register_root_parser.apply(null, require('parser'));

    return {
        d3: require('d3'),
        core: core,
        Simple: (require('simple/_init'))()
    };
});
