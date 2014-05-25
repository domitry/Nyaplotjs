define([
    'underscore',
    'core/manager'
],function(_, Manager){
    function Bar(parent, scales, data, _options){
	options = {
	    x: null,
	    y: null,
	    width: 1.0,
	    color:'#ff0000'
	};
	if(arguments.length>3)_.extend(options, _options);

	var df = Manager.getData(data);
	var raw_data = _.map(
	    _.zip(df.column(options.x), df.column(options.y)),
	    function(d, i){return {i:i,x:d[0], y:d[1]};}
	);

	width = scales.x.rangeBand()*options.width;

	model = parent.append("g");
	model.selectAll("rect")
	    .data(raw_data)
	    .enter()
	    .append("rect")
	    .attr("x",function(d){return (scales.x(d.x))})
	    .attr("y", function(d){return (_.max(scales.y.range()) - scales.y(d.y))})
	    .attr("width", width)
	    .attr("height", function(d){return scales.y(d.y);})
	    .attr("fill", options.color);
	
	this.model = model;
	this.df = df;

	return this;
    }

    Bar.prototype.clear = function(){
	this.model.selectAll("rect")
	    .data([])
	    .exit();
    }

    Bar.prototype.update = function(scales){

    }

    return Bar;
});
