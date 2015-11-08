define([
    "underscore",
    "core",
    "state"
], function(_, core, State){
    /*
     Thin layer between parser_manager and glyph.
     */
    function register_glyph(name, required_args, optional_args, callback){
        required_args.shift();
        optional_args["transform"] = null;

        core.register_parser(
            name,
            required_args,
            optional_args,
            function(){
                var args = [].slice.call(arguments, 0);
                var g = d3.select(document.createElementNS("http://www.w3.org/2000/svg", "g"));

                if(!_.isUndefined(_.last(args)["transform"]))
                    g.attr("transform", _.last(args)["transform"]);

                args.unshift(g);
                return new State({
                    selection: callback.apply(null, args),
                    update: function(){
                        callback.apply(null, args);
                    }
                });
            }
        );
    };

    return {
        register_glyph: register_glyph
    };
});
