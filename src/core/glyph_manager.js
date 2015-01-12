define([
    "underscore",
    "core/parser_manager"
], function(_, parser_manager){
    /*
     Thin layer between parser_manager and glyph.
     */
    function register_glyph(name, func, required_args, optional_args){
        required_args.shift();

        parser_manager.register_parser(
            name,
            required_args,
            optional_args,
            function(){
                var args = [].slice.call(arguments, 0);
                var g = document.createElementNS("http://www.w3.org/2000/svg", "g");

                // resolve dependency
                var func = function(arg){
                    if(_.isObject(arg) && _.has("async")){
                        var uuid = arg.async;
                        return parser_manager.get(uuid);
                    }
                    return arg;
                };

                var optional_args = _.map(args.pop(), func);
                var required_args = _.map(args, func);

                required_args.push(optional_args);
                required_args.unshift(d3.select(g));
                var ret = func.apply(null, required_args);
                return {parent: g, children: ret};
            }
        );
    };

    return {
        register_glyph: register_glyph
    };
});
