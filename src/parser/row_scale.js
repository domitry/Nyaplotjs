define([
    "underscore",
    "core",
    "utils/dataframe"
], function(_, core, Df){
    return [
        "row_scale",
        ["data", "column", "scale"],
        {},
        function(column, scale){
            return function(row){
                return scale(row[column]);
            };
        }
    ];
});
