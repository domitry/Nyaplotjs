define([
    'underscore',
    'utils/args2arr'
], function(_, args2arr){
    function LayerBase(args, sync_args){
        _.extend(this, args);
        this.sync_args = sync_args;
    }

    LayerBase.prototype.construct = function(){
        // process sync_args
        _.extend(this, _.reduce(this.sync_args, function(memo, uuid, key){
            if(_.isArray(uuid))
                memo[key] = _.map(uuid, function(n){return this.sync(n);}.bind(this));
            else memo[key] = this.sync(uuid);
            return memo;
        }.bind(this), {}));
        
        var args = _.map(this.required_args, function(argname){
            return this[argname];
        }.bind(this));
        
        args.push(this); //options
        
        if(!_.isUndefined(this.node))
            args = [this.node].concat(args); // g
        
        return this.parser.apply(this, args);
    };

    LayerBase.inherit = function(required_args, optional_args, parser){
        function NewLayer(){
            _.extend(this, this.optional_args);
            return LayerBase.apply(this, args2arr(arguments));
        }
        
        _.extend(NewLayer.prototype, _.extend(new LayerBase({}), _.extend({
            sync: function(){},
            children: undefined,
            node: undefined,
            parser: parser,
            required_args: required_args,
            optional_args: optional_args
        })));

        return NewLayer;
    };

    return LayerBase;
});
