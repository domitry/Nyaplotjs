define([
    'underscore',
    'colorbrewer'
],function(_, colorbrewer){
    function colorset(name, num){
        if(arguments.length>1)return colorbrewer[name][num];
        var nums = _.map(_.keys(colorbrewer[name]), function(key){
            return (_.isFinite(key) ? Number(key) : 0);
        });
        var max_num = _.max(nums);
        return colorbrewer[name][String(max_num)];
    }

    return colorset;
});
