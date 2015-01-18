define([
    "underscore",
    "core",
    "utils/dataframe"
], function(_, core, Df){
    core.register_parser(
        "df_scale",
        /* args: {data_id: "uuid", column: "hoge", range: []} */
        ["data_id", "column", "range"],
        {},
        function(data_id, column_name, range){
            var data = core.get(data_id);
            var df = new Df(data);
            return df.scale(column_name, range);
        }
    );
});
