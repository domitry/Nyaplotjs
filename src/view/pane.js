define([
    'underscore',
    'view/diagrams/diagrams',
    'view/components/axis',
    'view/components/filter'
],function(_, diagrams, Axis, Filter){
    function Pane(parent, _options){
	var options = {
	    width: 500,
	    height: 500,
	    margin: {top: 30, bottom: 80, left: 80, right: 30},
	    xrange: [0,0],
	    yrange: [0,0],
	    zoom: true,
	    grid: true,
	    scale: 'fixed',
	    x_label:'X',
	    y_label:'Y'
	};
	if(arguments.length>1)_.extend(options, _options);

	var model = parent.append("svg")
	    .attr("width", options.width)
	    .attr("height", options.height)

	var inner_width = options.width - options.margin.left - options.margin.right;
	var inner_height = options.height - options.margin.top - options.margin.bottom;

	var ranges = {x:[0,inner_width], y:[inner_height,0]}
	var scales = {};

	_.each({x:'xrange',y:'yrange'},function(val, key){
	    if(options[val].length > 2)
		scales[key] = d3.scale.ordinal().domain(options[val]).rangeBands(ranges[key]);
	    else
		scales[key] = d3.scale.linear().domain(options[val]).range(ranges[key]);
	});

	model.append("g")
	    .attr("transform", "translate(" + options.margin.left + "," + options.margin.top + ")");

	var axis = new Axis(model.select("g"), scales, {width:inner_width, height:inner_height, grid:options.grid});

	model.select("g")
	    .append("g")
	    .attr("class", "context")
	    .append("clipPath")
	    .attr("id", "clip_context")
	    .append("rect")
	    .attr("x", 0)
	    .attr("y", 0)
	    .attr("width", inner_width)
	    .attr("height", inner_height);

	model.select("g")
	    .append("text")
	    .attr("x", inner_width/2)
	    .attr("y", options.height- options.margin.bottom/1.5)
	    .attr("text-anchor", "middle")
	    .attr("fill", "black")
	    .attr("font-size", 22)
	    .text(options.x_label);

	model.select("g")
	    .append("text")
	    .attr("x", -options.margin.left/1.5)
	    .attr("y", inner_height/2)
	    .attr("text-anchor", "middle")
	    .attr("fill", "black")
	    .attr("font-size", 22)
	    .attr("transform", "rotate(-90," + -options.margin.left/1.5 + ',' + inner_height/2 + ")")
	    .text(options.y_label);

	this.model = model;
	this.diagrams = [];
	this.axis = axis;
	this.scales = scales;
	this.options = options;

	return this;
    }

    Pane.prototype.add = function(type, data, options){
	var parent = this.model.select(".context");
	var diagram = new diagrams[type](parent, this.scales, data, options);
	this.diagrams.push(diagram);
    };

    Pane.prototype.filter = function(target, options){
	var parent = this.model.select(".context");
	var axis = this.axis;
	var scales = this.scales;
	var diagrams = this.diagrams;
	this.filter = new Filter(parent, scales, options);
	this.filter.selected(function(ranges){
	    _.each(diagrams, function(diagram){
		diagram.checkIfSelected(ranges)
	    });
	});
    }

    Pane.prototype.selected = function(data, rows){
	var diagrams = this.diagrams;
	var funcs = {
	    fixed:function(){return;},
	    fluid:function(){
		_.each(diagrams, function(diagram){
		    if(diagram.data == data)
			diagram.selected(data, rows);//dirty
		});
	    }
	};
	funcs[this.options.scale]();
    }

    return Pane;
});
