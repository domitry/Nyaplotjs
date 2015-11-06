define([
    "underscore",
    "core"
], function(_, core){
    /*
     Thin layer between parser_manager and sheet.
     */
    function register_sheet(name, required_args, optional_args, callback){
        required_args.shift();

        core.register_parser(
            name,
            required_args,
            optional_args,
            function(){
                var args = [].slice.call(arguments, 0);
                var g = d3.select(document.createElementNS("http://www.w3.org/2000/svg", "g"));

                args.unshift(g);
                callback.apply(null, args);
                return {
		    node: g
		};
            }
        );
    };

    return {
        register_sheet: register_sheet
    };
});
