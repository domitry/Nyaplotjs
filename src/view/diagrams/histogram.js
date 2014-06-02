define([
    'underscore',
    'core/manager',
    'view/components/filter'
],function(_, Manager, Filter){
    function Histogram(parent, scales, df_id, _options){
	var options = {
	    title: 'histogram',
	    value: null,
	    bin_num: 20,
	    width: 0.9,
	    color:'steelblue',
	    stroke_color: 'black',
	    stroke_width: 1
	};
	if(arguments.length>3)_.extend(options, _options);

	this.scales = scales;
	var df = Manager.getData(df_id);
	var data = this.proceedData(df.column(options.value), options);

	var model = parent.append("g");
	var rects = model.selectAll("rect")
	    .data(data)
	    .enter()
	    .append("rect")
	    .attr("height", 0)
	    .attr("y", scales.y(0));

	this.updateModels(rects, scales, options);

	this.legends = [{label: options.title, color:options.color, on:function(){}, off:function(){}}];
	this.options = options;
	this.model = model;
	this.df = df;
	this.df_id = df_id;

	return this;
    }

    Histogram.prototype.proceedData = function(raw_data, options){
	return d3.layout.histogram()
	    .bins(this.scales.x.ticks(options.bin_num))(raw_data);
    }

    Histogram.prototype.updateModels = function(selector, scales, options){
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

	selector
	    .attr("x",function(d){return scales.x(d.x)})
	    .attr("width", function(d){return scales.x(d.dx) - scales.x(0)})
	    .attr("fill", options.color)
	    .attr("stroke", options.stroke_color)
	    .attr("stroke-width", options.stroke_width)
	    .attr("clip-path","url(#clip_context)")
	    .on("mouseover", onMouse)
	    .on("mouseout", outMouse)
	    .transition().duration(200)
	    .attr("y", function(d){return scales.y(d.y);})
	    .attr("height", function(d){return scales.y(0) - scales.y(d.y);});
    }

    Histogram.prototype.selected = function(data, row_nums){
	var selected_cells = this.df.pickUpCells(this.options.value, row_nums)
	var data = this.proceedData(selected_cells, this.options);
	var models = this.model.selectAll("rect").data(data);
	this.updateModels(models, this.scales, this.options);
    }

    Histogram.prototype.updateData = function(){
	this.df = Manager.getData(df_id);
	var data = this.proceedData(df.column(options.value), options);
	var models = this.model.selectAll("rect").data(data);
	this.updateModels(models,  this.scales, this.options);
    }

    Histogram.prototype.checkSelectedData = function(ranges){
	var rows = [];
	var column = this.df.column(this.options.value);
	_.each(column, function(val, i){
	    if(val > ranges.x[0] && val < ranges.x[1])rows.push(i);
	});
	Manager.selected(this.df_id, rows);
    }

    return Histogram;
});
