define([], function(){
    var event_types = {};

    return {
        addLister: function(target, event_type, callback){
            var func = event_types[event_type];
            func(target, callback);
        },
        addEvent: function(name, func){
            event_types[name] = func;
        }
    };
});
