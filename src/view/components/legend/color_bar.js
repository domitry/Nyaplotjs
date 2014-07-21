/*
 * Colorset provides colorbar filled with gradient for continuous data.
 * Each diagram create an instance of Colorset and Pane append it to itself.
 */

define([
    'underscore'
], function(_){
    function ColorBar(color_scale, _options){
        var options = {
            width: 150,
            height: 200
        };
        if(arguments.length>1)_.extend(options, _options);
        
        this.options = options;
        this.model = d3.select(document.createElementNS("http://www.w3.org/2000/svg", "g"));
        this.color_scale = color_scale;
    }

    ColorBar.prototype.width = function(){
        return this.options.width;
    };

    ColorBar.prototype.height = function(){
        return this.options.height;
    };

    ColorBar.prototype.getDomObject = function(){
        var model = this.model;
	    var color_scale = this.color_scale;
        var colors = color_scale.range();
        var values = color_scale.domain();

        var height_scale = d3.scale.linear()
                .domain(d3.extent(values))
                .range([this.options.height,0]);

	    var gradient = model.append("svg:defs")
	            .append("svg:linearGradient")
	            .attr("id", "gradient")
	            .attr("x1", "0%")
	            .attr("x2", "0%")
	            .attr("y1", "100%")
	            .attr("y2", "0%");

	    for(var i=0; i<colors.length; i++){
	        gradient.append("svg:stop")
		        .attr("offset", (100/(colors.length-1))*i + "%")
		        .attr("stop-color", colors[i]);
	    }

	    var group = model.append("g");

	    group.append("svg:rect")
	        .attr("y",10)
	        .attr("width", "25")
	        .attr("height", this.options.height)
	        .style("fill", "url(#gradient)");

	    model.append("g")
	        .attr("width", "100")
	        .attr("height", this.options.height)
	        .attr("class", "axis")
	        .attr("transform", "translate(25,10)")
	        .call(d3.svg.axis()
		          .scale(height_scale)
		          .orient("right")
		          .ticks(5));

	    model.selectAll(".axis").selectAll("path")
	        .style("fill", "none")
	        .style("stroke", "black")
	        .style("shape-rendering", "crispEdges");

	    model.selectAll(".axis").selectAll("line")
	        .style("fill", "none")
	        .style("stroke", "black")
	        .style("shape-rendering", "crispEdges");

	    model.selectAll(".axis").selectAll("text")
	        .style("font-family", "san-serif")
	        .style("font-size", "11px");

	    return model;
    };

    return ColorBar;
});
