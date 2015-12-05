/**
 Discrete to Continuous scale
 */
define([
    'd3'
], function(d3){
    return [
        "d2c",
        ["label", "scale"],
        {
            is_raw: true
        },
        function(label, scale){
            var start = scale(label);
            var band = scale.rangeBand();
            
            return d3.scale.linear()
                .domain([-1, 1])
                .range([start, start+band]);
        }
    ];
});
