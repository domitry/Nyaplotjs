define([
    'underscore',
    'core/manager'
],function(_, Manager){
    function Filter(parent, scales, _options){
	var options = {
	    opacity: 0.125,
	    color: 'gray'
	};
	if(arguments.length>2)_.extend(options, _options);

	var brushed = function(){
	    console.log("brushed!");
	}

	var brush = d3.svg.brush()
	    .x(scales.x)
	    .on("brush", brushed);

	var model = parent.append("g");
	var height = d3.max(scales.y.range()) - d3.min(scales.y.range());
	var y = d3.min(scales.y.range());

	model.call(brush)
	    .selectAll("rect")
	    .attr("y", y)
	    .attr("height", height)
	    .style("fill-opacity", options.opacity)
	    .stype("fill", options.color)
	    .style("shape-rendering", "crispEdges");
	
	return this;
    }

    return Filter;
});
