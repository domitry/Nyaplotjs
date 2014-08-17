/*
 * Scales: The wrapper for d3.scales
 *
 * Scales for x-y coordinates system. Other types of scales are implemented by extension system like Bionya and Mapnya.
 * If you are interested in writing extension for Nyaplot, see the code of extensions.
 * This module is implemented using d3.scales.ordinal and d3.scales.linear. See the document of d3.js to learn more about scales: 
 *    - https://github.com/mbostock/d3/wiki/Ordinal-Scales
 *    - https://github.com/mbostock/d3/wiki/Quantitative-Scales
 * 
 * options:
 *     linear -> String: The type of linear scale. 'linear', 'power', and 'log' are allowed.
 */

define(['underscore'], function(_){
    function Scales(domains, ranges, _options){
        var options = {
            linear: 'linear'
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
        this.scales = scales;
        this.raw = scales;
        return this;
    }

    // convert from data points to svg dom coordiantes like: ['nya', 'hoge'] -> {x: 23, y:56}]
    Scales.prototype.get = function(x, y){
        return {
            x: this.scales.x(x),
            y: this.scales.y(y)
        };
    };

    // domain: the word unique to d3.js. See the website of d3.js.
    Scales.prototype.domain = function(){
        return {
            x: this.scales.x.domain(),
            y: this.scales.y.domain()
        };
    };

    // range: the word unique to d3.js. See the website of d3.js.
    Scales.prototype.range = function(){
        return {
            x: this.scales.x.range(),
            y: this.scales.y.range()
        };
    };

    return Scales;
});
