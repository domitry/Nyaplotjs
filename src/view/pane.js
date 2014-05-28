define([
    'underscore',
    'view/diagrams/diagrams',
    'view/components/axis',
    'view/components/filter'
],function(_, diagrams, Axis, Filter){
    function Pane(parent, _options){
	options = {
	    width: 500,
	    height: 500,
	    margin: {top: 30, bottom: 30, left: 30, right: 30},
	    xrange: [0,0],
	    yrange: [0,0],
	    zoom: true,
	    grid: true
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

	this.model = model;
	this.diagrams = [];
	this.options = options;
	this.axis = axis;
	this.scales = scales;

	return this;
    }

    Pane.prototype.add = function(type, data, options){
	var parent = this.model.select(".context");
	var diagram = new diagrams[type](parent, this.scales, data, options);
	diagram.model.selectAll().attr("clip-path","url(#clip_context)");
	this.diagrams.push(diagram);
    };

    Pane.prototype.filter = function(target, options){
	var parent = this.model.select(".context");
	var axis = this.axis;
	var scales = this.scales;
	var diagrams = this.diagrams;
	this.filter = new Filter(parent, scales, options);
	this.filter.selected(function(ranges){
	    scales.x.domain(ranges.x);
	    scales.y.domain(ranges.y);
	    axis.update(scales);
	    _.each(diagrams, function(diagram){diagram.update();});
	});
    }

    return Pane;
});
