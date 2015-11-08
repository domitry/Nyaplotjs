/*
 Simple JavaScript interface for Nyaplotjs
 ex:
 plot = new Nyaplot.LinePlot([1,2,3], [1,2,3]);
 plot.show("vis"); // "vis" is the id of the div element in which the plot will be.
*/
define([
    "simple/line"
], function(line){
    return {
        LinePlot: line
    };
});
