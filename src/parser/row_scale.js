define([
    "underscore",
    "core",
    "utils/dataframe"
], function(_, core, Df){
    return [
        "row_scale",
        ["data", "column", "range"],
        {
            domain: null
        },
        function(data, column, range, options){
            var df = new Df(data);
            var scale = df.scale(column, range);

            if(options.domain != null)
                scale.domain(options.domain);

            return function(row){
                return scale(row[column]);
            };
        }
    ];
});
