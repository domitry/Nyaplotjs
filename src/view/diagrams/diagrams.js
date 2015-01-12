/*
 * Diagrams: Diagrams Factory
 *
 * Diagrams manages all diagrams bundled by Nyaplotjs. Extension registers their own diagrams through this module.
 *
 */

define(function(require, exports, module){
    var diagrams = {};

    diagrams.bar = require('view/diagrams/bar');
    diagrams.histogram = require('view/diagrams/histogram');
    diagrams.scatter = require('view/diagrams/scatter');
    diagrams.line = require('view/diagrams/line');
    diagrams.box = require('view/diagrams/box.js');
    diagrams.heatmap = require('view/diagrams/heatmap.js');
    diagrams.vectors = require('view/diagrams/vectors.js');

    // Add diagrams. Called by other extensions
    diagrams.add = function(name, diagram){
        diagrams[name] = diagram;
    };

    return diagrams;
});
