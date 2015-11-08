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
    function parse(model, isDebugMode){
        isDebugMode = isDebugMode===true?true:false;
        
        function validate(task, i){
            _.each(["type", "uuid", "args"], function(argname){
                if(_.isUndefined(task[argname]))
                    throw new Error("Task " + i + ":" + argname  + " is required.");
            });
            var parser = parsers_list[task.type];
            _.each(parser.required_args, function(argname){
                if(_.isUndefined(task.args))
                    throw new Error("Task" + task.uuid + "do not have the required argument : " + argname + ".");
            });

            if(isDebugMode){
                var args = _.clone(task.args);
                var argnames = _.extend(_.clone(parser.required_args), parser.optional_args);
                if(!_.isUndefined(task.sync_args))args.concat(task.sync_args);
                _.each(args, function(val, argname){
                    if(!_.has(argnames, argname))
                        console.warn("warning: the argument: " + argname + " will be ignored.");
                });
            }
        }
        
        _.each(model, function(task, i){
            validate(task, i);
            
            var parser = parsers_list[task.type];
            var func = parser.callback;
            var args = _.clone(task.args);
            
            if(!_.isUndefined(task.sync_args))
                _.extend(args, _.reduce(task.sync_args, function(memo, uuid, argname){
                    memo[argname] = get(uuid);
                    return memo;
                }, {}));

            var args_arr = _.map(parser.required_args, function(argname){return args[argname];});
            
            args_arr.push(_.reduce(args, function(memo, val, argname){
                if(_.has(memo, argname))memo[argname]=args[argname];
                return memo;
            }, _.clone(parser.optional_args)));
            
            history[task.uuid] = func.apply(null, args_arr);
            
            // Call registered callback function after parsing is finished
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
