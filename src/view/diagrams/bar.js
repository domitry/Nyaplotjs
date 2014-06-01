define([
    'underscore',
    'core/manager'
],function(_, Manager){
    function Bar(parent, scales, df_id, _options){
	var options = {
	    value: null,
	    x: null,
	    y: null,
	    width: 0.9,
	    color: null
	};
	if(arguments.length>3)_.extend(options, _options);

	var df = Manager.getData(df_id);
	var data;
	if(options.value !== null){
	    var raw = this.countData(df.column(options.value));
	    data = this.proceedData(raw.x, raw.y, options);
	}else{
	    data = this.proceedData(df.column(options.x), df.column(options.y), options);
	}

	var color_scale;
	if(options.color == null){
	    color_scale = d3.scale.category20b();
	}else{
	    color_scale = d3.scale.ordinal().range(options.color);
	}
	this.color_scale = color_scale;

	var model = parent.append("g");
	var rects = model.selectAll("rect")
	    .data(data)
	    .enter()
	    .append("rect")
	    .attr("height", 0)
	    .attr("y", scales.y(0));
	
	var legends = [];
	_.each(data, function(d){
	    legends.push({label: d.x, color:color_scale(d.x)})
	});

	this.updateModels(rects, scales, options);

	this.model = model;
	this.scales = scales;
	this.options = options;
	this.legends = legends;
	this.df = df;
	this.df_id = df_id;

	return this;
    }

    Bar.prototype.countData = function(values){
	var hash = {}
	_.each(values, function(val){
	    hash[val] = hash[val] || 0;
	    hash[val] += 1;
	});
	return {x: _.keys(hash), y: _.values(hash)};
    }
    
    Bar.prototype.proceedData = function(x, y, options){
	return _.map(
	    _.zip(x,y),
	    function(d, i){return {x:d[0], y:d[1]};}
	);
    }

    Bar.prototype.updateModels = function(selector, scales, options){
	var color_scale = this.color_scale;

	var onMouse = function(){
	    d3.select(this).transition()
		.duration(200)
		.attr("fill", function(d){return d3.rgb(color_scale(d.x)).darker(1)});
	}

	var outMouse = function(){
	    d3.select(this).transition()
		.duration(200)
		.attr("fill", function(d){return color_scale(d.x)})
	}

	var width = scales.x.rangeBand()*options.width;
	var padding = scales.x.rangeBand()*((1-options.width)/2);

	selector
	    .attr("x",function(d){return scales.x(d.x) + padding})
	    .attr("width", width)
	    .attr("fill", function(d){return color_scale(d.x)})
	    .on("mouseover", onMouse)
	    .on("mouseout", outMouse)
	    .transition().duration(200)
	    .attr("y", function(d){return scales.y(d.y)})
	    .attr("height", function(d){return scales.y(0) - scales.y(d.y);})
	;
    }

    Bar.prototype.selected = function(df_id, row_nums){
	var data, df = this.df;
	if(this.options.value !== null){
	    var selected_values = df.pickUpCells(this.options.value, row_nums);
	    var raw = this.countData(selected_values);
	    data = this.proceedData(raw.x, raw.y, this.options);
	}else{
	    var selected_x = df.pickUpCells(this.options.x, row_nums);
	    var selected_y = df.pickUpCells(this.options.y, row_nums);
	    data = this.proceedData(selected_x, selected_y, this.options);
	}
	var models = this.model.selectAll("rect").data(data);
	this.updateModels(models, this.scales, this.options);
    }

    Bar.prototype.update = function(){
	var models = this.model.selectAll("rect");
	this.updateModels(models,  this.scales, this.options);
    }

    Bar.prototype.checkSelectedData = function(ranges){
	return;
    }

    return Bar;
});
