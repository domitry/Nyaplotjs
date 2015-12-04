define([
    "underscore",
    "core",
    "utils/uuid",
    "utils/args2arr"
], function(_, core, uuid, args2arr){
    function SimpleBase(){
        var args = args2arr(arguments);
        if(args.length==0)args.push({});
        
        this.uuid = uuid();
        this.props = {};
        
        if(args.length==1 && _.isObject(args)){
            _.extend(this.props, args[0]);
        }else{
            if(args.length < this.required_args.length)
                console.warn("The number of arguments is less than required.");
            else if(args.length > this.required_args.length + 1)
                console.warn("The number of arguments is more than required.");
            else if(args.length == this.required_args.length + 1){
                var options = args[args.length-1];
                _.extend(this.props, options);
                args = args.slice(0, args.length-1);
            }
            _.extend(this.props, _.reduce(this.required_args, function(memo, name, i){
                memo[name] = args[i];
                return memo;
            }, {}));
        }
    }

    SimpleBase.prototype.to_json = function(){
        this.validate();

        var as = _.reduce(this.props, function(memo, val, key){
            if(val.is_simple == true)memo.sync_args[key] = val.uuid;
            else if(_.isArray(val) && _.all(val, function(s){return s.is_simple==true;}))
                memo.sync_args[key] = _.map(val, function(s){return s.uuid;});
            else if(_.isArray(val) && _.all(val, function(s){
                return _.isArray(s) && _.all(s, function(a){
                    return a.is_simple == true;
                });
            }))memo.sync_args[key] = _.map(val, function(s){
                return _.map(s, function(a){return a.uuid;});
            });
            else memo.args[key] = val;
            return memo;
        }, {args: {}, sync_args: {}});

        return {
            uuid: this.uuid,
            type: this.type,
            args: as.args,
            sync_args: as.sync_args
        };
    };

    SimpleBase.prototype.validate = function(){
        //TODO
    };

    SimpleBase.inherit = function(type, required_args, optional_args){
        function NewSimpleObject(){
            return SimpleBase.apply(this, args2arr(arguments));
        }

        _.extend(NewSimpleObject.prototype, (_.extend(new SimpleBase(), {
            type: type,
            is_simple: true,
            props: undefined,
            required_args: required_args,
            optional_args: optional_args
        })));

        return NewSimpleObject;
    };
    
    return SimpleBase;
});
