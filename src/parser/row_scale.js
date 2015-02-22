define([
    "underscore",
    "core",
    "utils/dataframe"
], function(_, core, Df){
    return [
        "row_scale",
        /* args: {data_id: "uuid", column: "hoge", range: []} */
        ["data", "column", "range"],
        {},
        function(data, column_name, range){
            var df = new Df(data);
            var scale = df.scale(column_name, range);
            return function(row){
                return scale(row[column_name]);
            };
        }
    ];
});
