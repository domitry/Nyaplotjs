/*
 * STL:
 *
 * Standard library for Nyaplot
 */

define(function(require, exports, module){
    var stl = {};
    stl.pane = require('view/pane');
    stl.axis = require('view/components/axis');
    stl.scale = require('view/components/scale');
    return stl;
});
