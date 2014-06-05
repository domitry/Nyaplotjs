define([
    'underscore',
    'core/manager',
    'view/components/filter',
    'utils/simplex'
],function(_, Manager, Filter, simplex){
    function Venn(parent, scales, df_id, _options){
	var options = {
	    category: null,
	    count: null,
	    color:null,
	    stroke_color:'#000',
	    stroke_width: 1,
	    opacity: 0.5
	};
	if(arguments.length>3)_.extend(options, _options);

	this.scales = scales;
	var df = Manager.getData(df_id);
	var data = this.proceedData(df.column(options.category), df.column(options.count), options);

	var model = parent.append("g");
	var circles = model
	    .selectAll("circle")
	    .data(data)
	    .enter()
	    .append("circle");

	if(options.color == null)this.color_scale = d3.scale.category20b();
	else this.color_scale = d3.scale.ordinal().range(options.color);

	this.updateModels(circles, scales, options);

	this.options = options;
	this.model = model;
	this.df = df;
	this.df_id = df_id;

	return this;
    }

    Venn.prototype.proceedData = function(category_column, count_column, options){
	var counted_items = (function(){
	    var hash={};
	    _.each(_.zip(category_column, count_column), function(arr){
		hash[arr[1]] |= {};
		hash[arr[1]][arr[0]] = true;
	    });
	    return _.items(hash);
	})();

	var count_common = function(items){
	    var cnt=0;
	    _.each(hash, function(values, key){
		if(!_.some(items, function(item){return if(!(item in values))}))
		    cnt++;
	    });
	    return cnt;
	}
	
	var category_list = _.uniq(category_column);
	var table = [], r=[];
	for(var i = 0; i<categories; i++){
	    table[i] = [];
	    table[i][i] = count_common([categories[i]]);
	    r[i] = Math.sqrt(table[i][i]/(2*Math.Pi));
	    for(var j=i+1; j<categories; j++){
		var num = count_common([categories[i], categories[j]]);
		table[i][j] = num;
	    }
	}

	// function for minimizing loss of overlapping (values: x1,y1,x1,y1...)
	var evaluation = function(values){
	    var loss = 0;
	    for(var i=0;i<values.length;i+=2){
		
	    }
	}

	// decide default values


	// decide values
	simplex(def_params, evaluation);

	return data;
    }

    Venn.prototype.updateModels = function(selector, scales, options){
	var color_scale = this.color_scale;
	var onMouse = function(){
	    d3.select(this).transition()
		.duration(200)
		.attr("fill", function(d){return d3.rgb(color_scale(d)).darker(1)});
	}

	var outMouse = function(){
	    d3.select(this).transition()
		.duration(200)
		.attr("fill", function(d){return color_scale(d)});
	}

	// This is the *fake implementation*
	var w4 = d3.max(scales.x.range())/4;
	var h1 = (d3.max(scales.y.range()) - w4*Math.sqrt(3))/2;
	var h2 = h1 + w4*Math.sqrt(3);
	var x_scale = d3.scale.ordinal().domain().range([w4*2, w4+40, w4*3-40]);
	var y_scale = d3.scale.ordinal().domain().range([h1,h2-40,h2-40]);

	selector
	    .attr("r", 100)
	    .attr("cx", function(d){return x_scale(d)})
	    .attr("cy", function(d){return y_scale(d)})
	    .attr("stroke", options.stroke_color)
	    .attr("stroke-width", options.stroke_width)
	    .attr("fill", function(d){return color_scale(d)})
	    .attr("fill-opacity", options.opacity)
	    .on("mouseover", onMouse)
	    .on("mouseout", outMouse);

	selector
	    .append("text")
	    .attr("x", function(d){return x_scale(d)})
	    .attr("y", function(d){return y_scale(d)})
	    .attr("text-anchor", "middle")
	    .text(function(d){return d})
    }

    Venn.prototype.selected = function(data, row_nums){
	var selected_cells = this.df.pickUpCells(this.options.value, row_nums)
	var data = this.proceedData(selected_cells, this.options);
	var models = this.model.selectAll("path").datum(data);
	this.updateModels(models, this.scales, this.options);
    }

    Venn.prototype.update = function(){
	var models = this.model.selectAll("path");
	this.updateModels(models,  this.scales, this.options);
    }

    Venn.prototype.checkSelectedData = function(ranges){
	var rows = [];
	var column = this.df.column(this.options.value);
	_.each(column, function(val, i){
	    if(val > ranges.x[0] && val < ranges.x[1])rows.push(i);
	});
	Manager.selected(this.df_id, rows);
    }

    Venn.prototype.legends = function(){
	return [];
    }

    return Venn;
});
