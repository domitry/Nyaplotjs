/*
 * the wrapper for d3.scales.ordinal and d3.scales.linear
 */

define(['underscore'], function(_){
    function Scales(domains, ranges, _options){
        var options = {
            linear: 'linear' //linear, power, and log
        };
        if(arguments.length>1)_.extend(options, _options);

        var scales = {};
        _.each(['x', 'y'],function(label){
            if(_.some(domains[label], function(val){
                return _.isString(val);
            })){
                scales[label] = d3.scale.ordinal()
                    .domain(domains[label])
                    .rangeBands(ranges[label]);
            }
            else{
                var scale = (d3.scale[options.linear])();
                scales[label] = scale
                    .domain(domains[label])
                    .range(ranges[label]);
            }
        });
        return scales;
    }

    return Scales;
});
