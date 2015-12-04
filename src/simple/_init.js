/*
 Simple JavaScript interface for Nyaplotjs
 ex:
 plot = new Nyaplot.LinePlot([1,2,3], [1,2,3]);
 plot.show("vis"); // "vis" is the id of the div element in which the plot will be.
*/
define([
    'underscore',
    'core',
    'simple/base',
    'simple/plot'
], function(_, core, SimpleBase, createPlot){
    return function(){
        function capitalize(str){
            return str.charAt(0).toUpperCase() + str.slice(1);
        }
        
        var auto_generated = _.reduce(core.layers, function(memo, layer, name){
            memo[capitalize(name)] = SimpleBase.inherit(name, layer.required_args, layer.optional_args);
            return memo;
        }, {});

        return _.extend({
            Plot: createPlot(auto_generated)
        }, auto_generated);
    };
});
