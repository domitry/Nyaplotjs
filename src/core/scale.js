require([
    "underscore",
    "core/parser_manager"
], function(_, parser_manager){
    parser_manager.register_parser(
        "df_scale",
        /*
         args: {df_id: "uuid", column: "hoge", range: []}
         */
        ["df_id", "column", "range"],
        {},
        function(df_id, column_name, range){
            var df = parser_manager.get(df_id);
            return df.scale(column_name, range);
        }
    );
});
