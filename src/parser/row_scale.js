define([
    "underscore",
    "core",
    "utils/dataframe"
], function(_, core, Df){
    return [
        "row_scale",
        ["column", "scale"],
        {},
        function(column, scale, options){
            return function(row){
                return scale(row[column]);
            };
        }
    ];
});
