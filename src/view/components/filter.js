define([
    'underscore',
    'core/manager'
],function(_, Manager){

    function Filter(parent, scales, callback, _options){
        var options = {
            opacity: 0.125,
            color: 'gray'
        };
        if(arguments.length>2)_.extend(options, _options);

        var brushed = function(){
            var ranges = {
                x: (brush.empty() ? scales.domain().x : brush.extent()),
                y: scales.domain().y
            };
            callback(ranges);
        };

        var brush = d3.svg.brush()
                .x(scales.x)
                .on("brushend", brushed);

        var model = parent.append("g");
        var height = d3.max(scales.range().y) - d3.min(scales.range().y);
        var y = d3.min(scales.range().y);

        model.call(brush)
            .selectAll("rect")
            .attr("y", y)
            .attr("height", height)
            .style("fill-opacity", options.opacity)
            .style("fill", options.color)
            .style("shape-rendering", "crispEdges");
        
        return this;
    }

    return Filter;
});
