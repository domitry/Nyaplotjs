define([
    "underscore"
], function(_){
    return [
        "accessor",
        ["scale", "label", "type"],
        {},
        function(scale, label, options){
            return function(d){
                return scale(d[label]);
            };
        }
    ];
});
