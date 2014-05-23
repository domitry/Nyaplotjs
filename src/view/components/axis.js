define([
    'underscore'
],function(_){
    function Axis(parent, scales, options){
	if(arguments.length>2){
	    _.extend(options,{
		width:0,
		height:0,
		stroke_color:"#000000"
	    });
	}

	var xAxis = d3.svg.axis()
	    .scale(scales.x)
	    .orient("bottom")
	    .tickSize((-1)*options.height)

	var yAxis = d3.svg.axis()
	    .scale(scales.y)
	    .orient("left")
	    .tickSize((-1)*options.width)

	parent.append("g")
	    .attr("class", "x_axis")
	    .attr("transform", "translate(0," + options.height + ")")
	    .call(xAxis)

	parent.append("g")
	    .attr("class", "y_axis")
	    .call(yAxis)

	parent.selectAll(".x_axis, .y_axis")
	    .selectAll("path, line")
	    .style("fill","none")
	    .style("stroke",options.stroke_color)

	this.xAxis = xAxis;
	this.yAxis = yAxis;

	return this;
    }

    Axis.prototype.zoom(){
	svg.select(".x_axis").call(this.xAxis);
	svg.select(".y_axis").call(this.yAxis);
    }

    Axis.prototype.update(data){
	// axes do not depend on any data.
    }

    return Axis;
});
