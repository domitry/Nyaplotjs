define([
    "underscore",
    "core",
    "utils/dataframe"
], function(_, core, Df){
    return [
        "df_scale",
        /* args: {data_id: "uuid", column: "hoge", range: []} */
        ["data", "column", "range"],
        {},
        function(data, column_name, range, options){
            var df = new Df(data);
            return df.scale(column_name, range);
        }
    ];
});
