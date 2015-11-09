/*global define, describe, it, expect*/

define([
    "underscore",
    "parser/data"
], function(_, data){
    describe("data test", function(){
        it("should return name, array, object, function", function(){
            expect(_.isString(data[0])).to.be(true);
            expect(_.isArray(data[1])).to.be(true);
            expect(_.isObject(data[2])).to.be(true);
            expect(_.isFunction(data[3])).to.be(true);
        });
    });
});
