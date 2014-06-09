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
	    opacity: 0.7,
	    hover: false,
	    area_names:['VENN1','VENN2','VENN3']
	};
	if(arguments.length>3)_.extend(options, _options);

	var df = Manager.getData(df_id);
	var column_category = df.column(options.category);
	var column_count = df.column(options.count);

	var model = parent.append("g");

	var categories = _.uniq(column_category);
	var color_scale;

	if(options.color == null)color_scale = d3.scale.category20().domain(options.area_names);
	else color_scale = d3.scale.ordinal().range(options.color).domain(options.area_names);
	this.color_scale = color_scale;

	var legends = [];
	var selected_category = [[categories[0]], [categories[1]], [categories[2]]];

	for(var i=0;i<3;i++){
	    var update = this.update;
	    var thisObj = this;
	    var name = 'VENN' + String(i+1);
	    legends.push({label: name, color:color_scale(options.area_names[i])});
	    _.each(categories, function(category){
		var venn_id = i;
		var on = function(){
		    selected_category[venn_id].push(category);
		    update.call(thisObj);
		};
		var off = function(){
		    var pos = selected_category[venn_id].indexOf(category);
		    selected_category[venn_id].splice(pos, 1);
		    update.call(thisObj);
		};
		var mode = (category == selected_category[i] ? 'on' : 'off');
		legends.push({label: category, color:'black', mode:mode, on:on, off:off});
	    });
	    legends.push({label:''});
	}

	this.selected_category = selected_category;
	this.column_category = column_category;
	this.column_count = column_count;
	this.legends = legends;
	this.options = options;
	this.scales = scales;
	this.model = model;
	this.df = df;

	this.update();

	return this;
    }

    Venn.prototype.getScales = function(data, scales){
	var r_w = _.max(scales.x.range()) - _.min(scales.x.range());
	var r_h = _.max(scales.y.range()) - _.min(scales.y.range());
	var d_x = {
	    min: (function(){var min_d = _.min(data.pos, function(d){return d.x - d.r;}); return min_d.x - min_d.r;})(),
	    max: (function(){var max_d = _.max(data.pos, function(d){return d.x + d.r;}); return max_d.x + max_d.r;})()
	};
	var d_y = {
	    min: (function(){var min_d = _.min(data.pos, function(d){return d.y - d.r;}); return min_d.y - min_d.r;})(),
	    max: (function(){var max_d = _.max(data.pos, function(d){return d.y + d.r;}); return max_d.y + max_d.r;})()
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
    };

    Venn.prototype.proceedData = function(category_column, count_column, selected_category){
	// decide overlapping areas
	var table = (function(){
	    var table = [];
	    var counted_items = (function(){
		var hash={};
		_.each(_.zip(category_column, count_column), function(arr){
		    if(hash[arr[1]]==undefined)hash[arr[1]]={};
		    _.each(selected_category, function(category, i){
			if(category.indexOf(arr[0])!=-1)hash[arr[1]][i] = true;
		    });
		});
		return _.values(hash);
	    })();

	    var count_common = function(items){
		var cnt=0;
		_.each(counted_items, function(values, key){
		    if(!_.some(items, function(item){return !(item in values);}))cnt++;
		});
		return cnt;
	    };
	    
	    for(var i = 0; i<3; i++){
		table[i] = [];
		table[i][i] = count_common([i]);
		for(var j=i+1; j<3; j++){
		    var num = count_common([i, j]);
		    table[i][j] = num;
		}
	    }
	    return table;
	})();

	// decide radius of each circle
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
	};

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
	    var rad=0, rad_interval=Math.PI/(1.5*(set_num-1));
	    for(var i=0;i<set_num;i++){
		if(i!=center_i){
		    var d = r[center_i] + r[i]/2;
		    params[i*2] = d*Math.sin(rad);
		    params[i*2+1] = d*Math.cos(rad);
		    rad += rad_interval;
		}
	    }
	    return params;
	})();

	// decide coordinates using Simplex method
	var params = simplex(init_params, evaluation);
	var pos=[], labels=[];
	for(var i=0;i<params.length;i+=2)
	    pos.push({x:params[i] ,y:params[i+1], r:r[i/2], id:i});

	for(var i=0;i<3;i++){
	    labels.push({x: params[i*2], y: params[i*2+1], val: table[i][i]});
	    for(var j=i+1;j<3;j++){
		var x = (params[i*2] + params[j*2])/2;
		var y = (params[i*2+1] + params[j*2+1])/2;
		labels.push({x: x, y: y, val: table[i][j]});
	    }
	}

	return {pos:pos, labels:labels};
    };

    Venn.prototype.updateModels = function(selector, scales, options){
	var color_scale = this.color_scale;
	var area_names = this.options.area_names;

	selector
	    .attr("cx", function(d){return scales.x(d.x);})
	    .attr("cy", function(d){return scales.y(d.y);})
	    .attr("stroke", options.stroke_color)
	    .attr("stroke-width", options.stroke_width)
	    .attr("fill", function(d){return color_scale(area_names[d.id]);})
	    .attr("fill-opacity", options.opacity)
	    .transition()
	    .duration(500)
	    .attr("r", function(d){return scales.r(d.r);});

	if(options.hover){
	    var onMouse = function(){
		d3.select(this).transition()
		    .duration(200)
		    .attr("fill", function(d){return d3.rgb(color_scale(area_names[d.id])).darker(1);});
	    };

	    var outMouse = function(){
		d3.select(this).transition()
		    .duration(200)
		    .attr("fill", function(d){return color_scale(area_names[d.id]);});
	    };
	    
	    selector
	    .on("mouseover", onMouse)
	    .on("mouseout", outMouse);
	}
    };

    Venn.prototype.updateLabels = function(selector, scales, options){
	selector
	    .attr("x", function(d){return scales.x(d.x);})
	    .attr("y", function(d){return scales.y(d.y);})
	    .attr("text-anchor", "middle")
	    .text(function(d){return String(d.val);});
    };

    Venn.prototype.selected = function(data, row_nums){
	this.column_count = this.df.pickUpCells(this.options.count, row_nums);
	this.column_category = this.df.pickUpCells(this.options.category, row_nums);
	this.update();
    };

    Venn.prototype.update = function(){
	var data = this.proceedData(this.column_category, this.column_count, this.selected_category);
	var scales = this.getScales(data, this.scales);
	var circles = this.model.selectAll("circle").data(data.pos);
	var texts = this.model.selectAll("text").data(data.labels);

	if(circles[0][0]==undefined)circles = circles.enter().append("circle");
	if(texts[0][0]==undefined)texts = texts.enter().append("text");

	this.updateModels(circles, scales, this.options);
	this.updateLabels(texts, scales, this.options);	
    };

    Venn.prototype.checkSelectedData = function(ranges){
    };

    return Venn;
});
