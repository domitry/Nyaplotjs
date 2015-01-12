/*
 * Diagrams: Diagrams Factory
 *
 * Diagrams manages all diagrams bundled by Nyaplotjs. Extension registers their own diagrams through this module.
 *
 */

define(function(require, exports, module){
    var diagrams = ["scatter"]; //["bar", "histogram", "scatter", "line", "box", "heatmap", "vectors"];
    var _ = require("underscore");
    var glyph_manager = require("view/");

    _.each(diagrams, function(name){
        var d = require("view/diagrams" + name);
        glyph_manager.register_glyph(
            name,
            d.required_args,
            d.optional_args,
            d.func
        );
    });

    return diagrams;
});
