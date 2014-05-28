define([
    'underscore',
    'core/manager'
],function(_, Manager){
    function Histogram(parent, scales, data, _options){
	var options = {
	    value: null,
	    bin_num: 10,
	    width: 0.9,
	    color:'steelblue'
	};
	if(arguments.length>3)_.extend(options, _options);

	var df = Manager.getData(data);
	var raw_data = d3.layout.histogram()
	    .bins(scales.x.ticks(20))(df.column(options.value))

	var onMouse = function(){
	    d3.select(this).transition()
		.duration(200)
		.attr("fill", d3.rgb(options.color).darker(1));
	}

	var outMouse = function(){
	    d3.select(this).transition()
		.duration(200)
		.attr("fill", options.color);
	}

	var model = parent.append("g");

	model.selectAll("rect")
	    .data(raw_data)
	    .enter()
	    .append("rect")
	    .attr("x",function(d){return scales.x(d.x)})
	    .attr("y", function(d){return scales.y(d.y)})
	    .attr("width", function(d){return scales.x(d.dx)})
	    .attr("height", function(d){return scales.y(0) - scales.y(d.y);})
	    .attr("fill", options.color)
	    .on("mouseover", onMouse)
	    .on("mouseout", outMouse);
	
	this.model = model;
	this.df = df;

	return this;
    }

    Histogram.prototype.clear = function(){
	this.model.selectAll("rect")
	    .data([])
	    .exit();
    }

    Histogram.prototype.update = function(scales){

    }

    return Histogram;
});
