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
    var callback_list = {};
    var history = {};

    /*
     Nyaplot.core.parse

     "model" is given as "stacked task" style:
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
    function parse(model){
        // el: {uuid: "", type: "", args: {}}
        _.each(model, function(task){
            function resolve_sync(arg){
                if(_.isObject(arg) && _.has(arg, "sync")){
                    var uuid = arg.sync;
                    return get(uuid);
                }
                return arg;
            }

            var parser = parsers_list[task.type];
            var func = parser.callback;

            var args = _.map(parser.required_args, function(name){
                return resolve_sync(task.args[name]);
            });

            var optional_args = _.reduce(_.extend(parser.optional_args, _.omit.apply(null, [task.args].concat(parser.required_args))), function(memo, v, k){
                memo[k] = resolve_sync(v);
                return memo;
            }, {});

            args.push(optional_args);
            history[task.uuid] = func.apply(null, args);

	    if(!_.isUndefined(callback_list[task.uuid]))
		_.each(callback_list[task.uuid], function(f){
		    f(history[task.uuid]);
		});
        });
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

    /*
     register callback called when core finished to construct the specified element.
     */
    function on_parsed(uuid, func){
	if(_.isUndefined(callback_list[uuid]))
	    callback_list[uuid]=[];
	callback_list[uuid].push(func);
    }

    return {
        register_parser: register_parser,
        parse: parse,
        get: get,
	on_parsed: on_parsed
    };
});
