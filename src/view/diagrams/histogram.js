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

	var raw_data, width;

	var proceed_data = function(column){
	    var raw_data = [];
	    if(scales.x.domain().length > 2){
		var hash = {}
		_.each(column, function(val){
		    hash[val] = hash[val] || {x:val, y:0};
		    hash[val].y += 1;
		});
		raw_data = _.map(hash, function(val, key){return val;});
		width = scales.x.rangeBand();
	    }else{
		raw_data = d3.layout.histogram()
		    .bins(scales.x.ticks(20))(column);
		width = scales.x(raw_data[0].dx) - scales.x(0);
	    }
	    return raw_data;
	}

	var update_models = function(selector){
	    selector
		.attr("x",function(d){return scales.x(d.x)})
	    	.attr("width", width)
		.attr("fill", options.color)
		.attr("stroke", options.stroke_color)
		.attr("stroke-width", options.stroke_width)
	    	.attr("clip-path","url(#clip_context)")//dirty. should be modified.
		.on("mouseover", function(){
		    d3.select(this).transition()
			.duration(200)
			.attr("fill", d3.rgb(options.color).darker(1));
		})
		.on("mouseout", function(){
		    d3.select(this).transition()
			.duration(200)
			.attr("fill", options.color);
		})
		.transition().duration(200)
	    	.attr("y", function(d){return scales.y(d.y);})
		.attr("height", function(d){return scales.y(0) - scales.y(d.y);});
	}

	var raw_data = proceed_data(df.column(options.value));
	var model = parent.append("g");
	var rects = model.selectAll("rect")
	    .data(raw_data)
	    .enter()
	    .append("rect")
	    .attr("height", 0)
	    .attr("y", scales.y(0));
	update_models(rects);

	this.proceed_data = proceed_data;
	this.update_models = update_models;

	this.options = options;
	this.model = model;
	this.df = df;
	this.data = data; //dirty.

	return this;
    }

    Histogram.prototype.clear = function(){
	this.model.selectAll("rect")
	    .data([])
	    .exit();
    }

    Histogram.prototype.selected = function(data, rows){
	var column = this.df.column(this.options.value);
	var row_data = _.map(rows, function(i){
	    return column[i];
	});
	var data = this.proceed_data(row_data);
	var models = this.model.selectAll("rect")
	    .data(data);
	this.update_models(models);
    }

    Histogram.prototype.update = function(){
	this.update_models(this.model.selectAll("rect"));
    }

    Histogram.prototype.checkIfSelected = function(ranges){
	var rows = [];
	var column = this.df.column(this.options.value);
	_.each(column, function(val, i){
	    if(val > ranges.x[0] && val < ranges.x[1])rows.push(i);
	});
	Manager.selected(this.data, rows);
    }

    return Histogram;
});
