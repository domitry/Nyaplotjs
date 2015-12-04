define([
    "underscore"
], function(_){
    return [
        "accessor",
        ["scale", "label", "type"],
        {
            is_raw: true
        },
        function(scale, label, options){
            return function(d){
                return scale(d[label]);
            };
        }
    ];
});
