/*
 * parse:
 *
 * parse JSON model and generate plots based on the order.
 *
 */

define([
    'underscore'
],function(_){
    // {func: , stack: , clear: true}
    var parsers_list = {};
    var history = {};

    /*
     model is given as "stacked task" style:
     e.g.

      [
        {type: "Pane", uuid: "245ef3d2-35a0-40d6-846b-9477955dfe1a", args: {
          rows: ["4ced96c4-01f9-4d30-8763-efff798ab57d"],
          width:500,
          height:500,
        }},
        {type: "Stage2D", uuid: "4ced96c4-01f9-4d30-8763-efff798ab57d", args: {
          layer0: ["", "", ""],
          layer1: ["", "", ""],
          zoom:true
        }}
      ]

     Each task is an Object whose properties are "type", "uuid", and "args".
     */
    function parse(model, dom_name){
        var element = d3.select(dom_name);

        // el: {uuid: "", type: "", args: {}}
        _.extend(history, _.reduce(model, function(memo, task){
            var parser = parsers_list[task.type].callback;
            var func = parser.func;

            var args = _.map(parser.required_args, function(name){
                return task.args[name];
            });

            var optional_args = _.extend(parser.optional_args, task);
            args.push(optional_args);
            var ret = func.apply(null, args);

            memo[task.uuid] = ret;
        }, {}));
    }

    function register_parser(type_name, required_args, optional_args, callback){
        parsers_list[type_name] = {
            required_args: required_args,
            optional_args: optional_args,
            callback: callback
        };
    }

    /*
     get parsed results.
     */
    function get(uuid){
        return history[uuid];
    }

    return parse;
});
