/*global define, describe, it, expect, require*/

define([
    "underscore",
    "parser/stage2d",
    "parser/scale",
    "parser/position",
    "parser/pane",
    "parser/data"
], function(_, stage, scale, position, pane, data){
    /*
     * All parser module should return the array of:
     *  name of parser (string)
     *  required arguments (array)
     *  optional arguments (object)
     *  parser (function)
     */
    var modules = [].slice.call(arguments, 1);
    _.each(modules, function(module){
        describe(module[0] + " module", function(){
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
