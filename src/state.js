define([
    'underscore'
],function(_){
    function State(obj){
        if(_.isUndefined(obj))obj={};
        _.extend(this, obj);
    }
    return State;
});
