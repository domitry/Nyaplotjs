require([
    "underscore",
    "event"
], function(event){
    event.addEvent("dom.hover", function(target, callback){
        target.on("mouseover", callback);
    });

    event.addEvent("", function(target, callback){
    });
});
