define([
    "underscore",
    "core"
], function(_, core){
    /*
     Thin layer between parser_manager and glyph.
     */
    function register_glyph(name, required_args, optional_args, func){
        required_args.shift();

        core.register_parser(
            name,
            required_args,
            optional_args,
            function(){
                var args = [].slice.call(arguments, 0);
                var g = document.createElementNS("http://www.w3.org/2000/svg", "g");

                // resolve dependency
                var func = function(arg){
                    if(_.isObject(arg) && _.has(arg, "sync")){
                        var uuid = arg.sync;
                        return core.get(uuid);
                    }
                    return arg;
                };

                var optional_args = _.map(args.pop(), func);
                var required_args = _.map(args, func);

                required_args.push(optional_args);
                required_args.unshift(d3.select(g));
                return func.apply(null, required_args);
            }
        );
    };

    return {
        register_glyph: register_glyph
    };
});
