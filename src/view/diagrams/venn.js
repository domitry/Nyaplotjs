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
	var data = this.proceedData(df.column(options.category), df.column(options.count));

	scales = (function(){
	    var r_w = _.max(scales.x.range()) - _.min(scales.x.range());
	    var r_h = _.max(scales.y.range()) - _.min(scales.y.range());
	    var d_x = {
		min: (function(){var min_d = _.min(data, function(d){return d.x - d.r}); return min_d.x - min_d.r})(),
		max: (function(){var max_d = _.max(data, function(d){return d.x + d.r}); return max_d.x + max_d.r})()
	    };
	    var d_y = {
		min: (function(){var min_d = _.min(data, function(d){return d.y - d.r}); return min_d.y - min_d.r})(),
		max: (function(){var max_d = _.max(data, function(d){return d.y + d.r}); return max_d.y + max_d.r})()
	    };
	    var d_w = d_x.max-d_x.min;
	    var d_h = d_y.max-d_y.min;

	    var scale = 0;
	    if(r_w/r_h > d_w/d_h){
		scale = d_h/r_h;
		var new_d_w = scale*r_w;
		d_x.min -= (new_d_w - d_w)/2;
		d_x.max += (new_d_w - d_w)/2;
	    }
	    else{
		scale = d_w/r_w;
		var new_d_h = scale*r_h;
		d_h.min -= (new_d_h - d_h)/2;
		d_h.max += (new_d_h - d_h)/2;
	    }
	    var new_scales = {};
	    new_scales.x = d3.scale.linear().range(scales.x.range()).domain([d_x.min, d_x.max]);
	    new_scales.y = d3.scale.linear().range(scales.y.range()).domain([d_y.min, d_y.max]);
	    new_scales.r = d3.scale.linear().range([0,100]).domain([0,100*scale]);
	    return new_scales;
	})();

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

    Venn.prototype.proceedData = function(category_column, count_column){
	// decide overlapping areas
	var table = (function(){
	    var table = [];
	    var counted_items = (function(){
		var hash={};
		_.each(_.zip(category_column, count_column), function(arr){
		    if(hash[arr[1]]==undefined)hash[arr[1]]={};
		    hash[arr[1]][arr[0]] = true;
		});
		return _.values(hash);
	    })();

	    var count_common = function(items){
		var cnt=0;
		_.each(counted_items, function(values, key){
		    if(!_.some(items, function(item){return !(item in values)}))cnt++;
		});
		return cnt;
	    }
	    
	    var categories = _.uniq(category_column);
	    for(var i = 0; i<categories.length; i++){
		table[i] = [];
		table[i][i] = count_common([categories[i]]);
		for(var j=i+1; j<categories.length; j++){
		    var num = count_common([categories[i], categories[j]]);
		    table[i][j] = num;
		}
	    }
	    return table;
	})();

	// calc radius of each circle
	var r = _.map(table, function(row, i){
	    return Math.sqrt(table[i][i]/(2*Math.PI));
	});

	// function for minimizing loss of overlapping (values: x1,y1,x1,y1...)
	var evaluation = function(values){
	    var loss = 0;
	    for(var i=0;i<values.length;i+=2){
		for(var j=i+2;j<values.length;j+=2){
		    var x1=values[i], y1=values[i+1], x2=values[j], y2=values[j+1];
		    var r1=r[i/2], r2=r[j/2];
		    var d = Math.sqrt(Math.pow(x1-x2,2)+Math.pow(y1-y2,2));
		    var S = 0;
		    if(d > r1+r2)S = 0;
		    else{
			_.each([[r1, r2],[r2, r1]], function(r_arr){
			    var theta = Math.acos((r_arr[1]*r_arr[1] - r_arr[0]*r_arr[0] + d*d)/(2*r_arr[1]*d));
			    var s = r_arr[i]*r_arr[i]*theta - (1/2)*r_arr[1]*r_arr[1]*Math.sin(theta*2);
			    S += s;
			});
		    }
		    loss += Math.pow(table[i/2][j/2]-S,2);
		}
	    }
	    return loss;
	}

	// decide initial paramaters
	var init_params = (function(){
	    var params = [];
	    var set_num = table[0].length;
	    var max_area = _.max(table, function(arr, i){
		// calc the sum of overlapping area
		var result=0;
		for(var j=0;j<i;j++)result+=table[j][i];
		for(var j=i+1;j<arr.length;j++)result+=table[i][j];
		return result;
	    });
	    var center_i = set_num - max_area.length;
	    params[center_i*2] = 0; // x
	    params[center_i*2+1] = 0; // y
	    var rad=0, rad_interval=Math.PI*2/(set_num-1);
	    for(var i=0;i<set_num;i++){
		if(i!=center_i){
		    var d = r[center_i] + r[i];
		    params[i*2] = d*Math.sin(rad);
		    params[i*2+1] = d*Math.cos(rad);
		    rad += rad_interval;
		}
	    }
	    return params;
	})();

	// decide coordinates using Simplex method
	var params = simplex(init_params, evaluation);
	var data=[];
	for(var i=0;i<params.length;i+=2)data.push({x:params[i] ,y:params[i+1], r:r[i/2]});

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

	selector
	    .attr("r", function(d){return scales.r(d.r)})
	    .attr("cx", function(d){return scales.x(d.x)})
	    .attr("cy", function(d){return scales.y(d.y)})
	    .attr("stroke", options.stroke_color)
	    .attr("stroke-width", options.stroke_width)
	    .attr("fill", function(d){return color_scale(d)})
	    .attr("fill-opacity", options.opacity)
	    .on("mouseover", onMouse)
	    .on("mouseout", outMouse);

/*	selector
	    .append("text")
	    .attr("x", function(d){return x_scale(d)})
	    .attr("y", function(d){return y_scale(d)})
	    .attr("text-anchor", "middle")
	    .text(function(d){return d})*/
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
