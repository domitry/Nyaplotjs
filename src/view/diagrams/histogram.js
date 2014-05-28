define([
    'underscore',
    'core/manager',
    'view/components/filter'
],function(_, Manager, Filter){
    function Histogram(parent, scales, data, _options){
	var options = {
	    value: null,
	    bin_num: 10,
	    width: 0.9,
	    color:'steelblue',
	    stroke_color: 'black',
	    stroke_width: 1
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

	var update_models = function(selector){
	    selector.attr("x",function(d){return scales.x(d.x)})
		.attr("y", function(d){return scales.y(d.y)})
		.attr("width", function(d){return scales.x(d.dx) - scales.x(0)})
		.attr("height", function(d){return scales.y(0) - scales.y(d.y);})
		.attr("fill", options.color)
		.attr("stroke", options.stroke_color)
		.attr("stroke-width", options.stroke_width)
		.on("mouseover", onMouse)
		.on("mouseout", outMouse)
		.attr("clip-path","url(#clip_context)");//dirty. should be modified.
	}

	var model = parent.append("g");
	var rects = model.selectAll("rect")
	    .data(raw_data)
	    .enter()
	    .append("rect");
	update_models(rects);

	this.scales = scales;
	this.update_models = update_models;
	this.model = model;
	this.df = df;

	return this;
    }

    Histogram.prototype.clear = function(){
	this.model.selectAll("rect")
	    .data([])
	    .exit();
    }

    Histogram.prototype.update = function(){
	this.update_models(this.model.selectAll("rect"));
    }

    return Histogram;
});
