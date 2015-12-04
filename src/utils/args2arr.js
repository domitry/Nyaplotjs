define([], function(){
    return function args2arr(args){
        return Array.prototype.slice.call(args);
    };
});
