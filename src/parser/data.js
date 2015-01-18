define( [
    "underscore",
    "core"
], function(_, core){
    core.register_parser(
        "data",
        ["data"],
        {},
        function(data){
            return data;
        }
    );
});
