define([
    "underscore"
], function(_){
    return [
        "scale",
        ["domain", "range", "type"],
        {},
        function(domain, range, type, options){
            var scale = (d3.scale[type])().domain(domain);
            if(type == "ordinal")scale.rangeBands(range);
            else scale.range(range);
            return scale;
        }
    ];
});
