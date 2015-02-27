define([
    "underscore",
    "core",
    "utils/dataframe"
], function(_, core, Df){
    return [
        "scale",
        /* args: {data_id: "uuid", column: "hoge", range: []} */
        ["domain", "range", "type"],
        {},
        function(domain, range, type){
            var scale = (d3.scale[type])().domain(domain);
            if(type == "ordinal")scale.rangeBands(range);
            else scale.range(range);
            return scale;
        }
    ];
});
