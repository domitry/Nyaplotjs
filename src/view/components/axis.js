define([
    'underscore'
],function(_){
    function Axis(parent, scales, _options){
	var options = {
	    width:0,
	    height:0,
	    margin: {top:0,bottom:0,left:0,right:0},
	    stroke_color:"#fff",
	    stroke_width: 1.0,
	    x_label:'X',
	    y_label:'Y',
	    grid:true
	};
	if(arguments.length>2)_.extend(options, _options);

	var xAxis = d3.svg.axis()
	    .scale(scales.x)
	    .orient("bottom")

	var yAxis = d3.svg.axis()
	    .scale(scales.y)
	    .orient("left")

	if(options.grid){
	    xAxis.tickSize((-1)*options.height);
	    yAxis.tickSize((-1)*options.width);
	}

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
	    .style("stroke-width",options.stroke_width);

	parent.append("text")
	    .attr("x", options.width/2)
	    .attr("y", options.height + options.margin.bottom/1.5)
	    .attr("text-anchor", "middle")
	    .attr("fill", "black")
	    .attr("font-size", 22)
	    .text(options.x_label);

	parent.append("text")
	    .attr("x", -options.margin.left/1.5)
	    .attr("y", options.height/2)
	    .attr("text-anchor", "middle")
	    .attr("fill", "black")
	    .attr("font-size", 22)
	    .attr("transform", "rotate(-90," + -options.margin.left/1.5 + ',' + options.height/2 + ")")
	    .text(options.y_label);

	this.xAxis = xAxis;
	this.yAxis = yAxis;
	this.model = parent;

	return this;
    }

    Axis.prototype.update = function(){
	this.model.selectAll(".x_axis").call(this.xAxis);
	this.model.selectAll(".y_axis").call(this.yAxis);
    }

    return Axis;
});
