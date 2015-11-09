/*global define, describe, it, expect, require*/

define([
    'underscore',
    'glyph/scatter',
    'glyph/line',
    'glyph/histogram',
    'glyph/vectors',
    "glyph/rect",
    "glyph/circle",
    "glyph/line_segment"
], function(_){
    /*
     * All glyph module should return the array of:
     *  name of parser (string)
     *  required arguments (array)
     *  optional arguments (object)
     *  parser (function)
     */
    var modules = [].slice.call(arguments, 1);
    _.each(modules, function(module){
        describe(module[0] + " test", function(){
            it("should return name, array, object, function", function(){
                expect(_.isString(module[0])).to.be(true);
                expect(_.isArray(module[1])).to.be(true);
                expect(_.isObject(module[2])).to.be(true);
                expect(_.isFunction(module[3])).to.be(true);
            });

            it("\'s parser should take the correct number of arguments", function(){
                expect(module[3].length).to.be(module[1].length+1);
            });
        });
    });
});
