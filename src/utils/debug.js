define([
    "underscore",
    "core"
], function(_){
    var debug = true;

    return {
        log: function(obj){
            if(debug){
                console.log(obj);
            }
        },
        assert: function(){
        },
        disable: function(){
            debug = false;
        }
    };
});
