define([
    'underscore',
    'view/diagrams/diagrams'
],function(_, diagrams){
    function Pane(parent, options){
	if(arguments.length>2){
	    _.extend(options, {
		width: 500,
		height: 500,
		margin: {top: 20, bottom: 20, left: 20, right: 20},
		zoom: true
	    });
	}

	var model = parent.append("svg")
	    .attr("width", options.width)
	    .attr("height", options.height)

	model.append("g")
	    .attr("transform", "translate(" + options.margin.left + "," + options.margin.top + ")")
	    .append("g")
	    .attr("class", "context")
	    .append("clipPath")
	    .append("rect")
	    .attr("x", 0)
	    .attr("y", 0)
	    .attr("width", options.width - options.margin.left - options.margin.right)
	    .attr("height", options.height - options.margin.top - options.margin.bottom)

	this.model = model;
	this.scales = {
	    x:d3.scale.linear().domain(0,1).range(0,this.options.width),
	    y:d3.scale.linear().domain(0,1).range(0,this.options.height)
	};

	return this;
    }

    Pane.prototype.add = function(type, data, options){

    };

    Pane.prototype.render = function(){
	new diagrams[type](this.model.select(".context"), data, scales, options);
    }

    return Pane;
});
