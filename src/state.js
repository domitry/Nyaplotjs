define([
    'underscore'
],function(_){
    function State(obj){
        this.update = function(){
            console.warn("State#update was called but it has no side-effect.");
        };
        if(_.isUndefined(obj))obj={};
        _.extend(this, obj);
    }
    return State;
});
