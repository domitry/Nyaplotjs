define([
    'underscore',
    'core/manager',
    'view/components/filter'
],function(_, Manager, Filter){
    function Line(parent, scales, df_id, _options){
	var options = {
	    x: null,
	    y: null,
	    title: 'line',
	    color:'steelblue',
	    stroke_width: 2
	};
	if(arguments.length>3)_.extend(options, _options);

	this.scales = scales;
	var df = Manager.getData(df_id);
	var model = parent.append("g");

	this.legends = [{label: options.title, color:options.color}];
	this.options = options;
	this.model = model;
	this.df = df;
	this.df_id = df_id;

	this.update();

	return this;
    }

    Line.prototype.update = function(){
	var data = this.proceedData(this.df.column(this.options.x), this.df.column(this.options.y), this.options);
	this.model.selectAll("path").remove();
	var path =this.model
		.append("path")
		.attr("clip-path","url(#clip_context)")
		.datum(data);
	
	this.updateModels(path, this.scales, this.options);
    };

    Line.prototype.proceedData = function(x_arr, y_arr, options){
	return _.map(_.zip(x_arr, y_arr), function(d){return {x:d[0], y:d[1]};});
    };

    Line.prototype.updateModels = function(selector, scales, options){
	var onMouse = function(){
	    d3.select(this).transition()
		.duration(200)
		.attr("fill", d3.rgb(options.color).darker(1));
	};

	var outMouse = function(){
	    d3.select(this).transition()
		.duration(200)
		.attr("fill", options.color);
	};

	var line = d3.svg.line()
	    .x(function(d){return scales.x(d.x);})
	    .y(function(d){return scales.y(d.y);});

	selector
	    .attr("d", line)
	    .attr("stroke", options.color)
	    .attr("stroke-width", options.stroke_width)
	    .attr("fill", "none");
    };

    Line.prototype.updateData = function(){
	this.df = Manager.getData(this.df_id);
	var data = this.proceedData(this.df.column(this.options.value), this.options);
	var models = this.model.selectAll("path").datum(data);
	this.updateModels(models,  this.scales, this.options);
    };

    Line.prototype.checkSelectedData = function(ranges){
	return;
    };

    return Line;
});
