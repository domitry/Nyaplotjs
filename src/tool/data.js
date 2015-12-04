define( [
    'underscore'
], function(_){
    return [
        "data",
        ["data"],
        {
            is_raw: true
        },
        function(data, options){
            var processed = (function(src){
                if(_.isArray(src)){
                    if(_.all(src, function(row){
                        return _.isObject(row);
                    }))return src;
                    throw new Error("Invalid data type (array of object)");
                }else if(_.isObject(src)){
                    if(_.all(src, function(arr, key){
                        return (_.isString(key) && _.isArray(arr));
                    }))return (function(obj){
                        var keys = _.keys(obj);
                        return _.map(_.values(obj)[0], function(val, i){
                            return _.reduce(keys, function(memo, key){
                                memo[key] = obj[key][i];
                                return memo;
                            }, {});
                        });
                    })(src);
                    throw new Error("Invalid data type (array of object)");
                }else{
                    throw new Error("Invalid data type.");
                }
            })(data);
            
            return {
                data: processed,
                asarray: function(){
                    return this.data;
                }
            };
        }
    ];
});
