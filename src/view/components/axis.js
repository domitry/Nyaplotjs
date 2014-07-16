define([
    'underscore',
    'core/manager'
],function(_, Manager){
    function Axis(parent, scales, _options){
        var options = {
            width:0,
            height:0,
            margin: {top:0,bottom:0,left:0,right:0},
            stroke_color:"#fff",
            stroke_width: 1.0,
            x_label:'X',
            y_label:'Y',
            grid:true,
            pane_uuid: null
        };
        if(arguments.length>2)_.extend(options, _options);

        var xAxis = d3.svg.axis()
                .scale(scales.x)
                .orient("bottom");

        var yAxis = d3.svg.axis()
                .scale(scales.y)
                .orient("left");

        parent.append("g")
            .attr("class", "x_axis");

        parent.append("g")
            .attr("class", "y_axis");

        parent.append("text")
            .attr("x", options.width/2)
            .attr("y", options.height + options.margin.bottom/1.5)
            .attr("text-anchor", "middle")
            .attr("fill", "rgb(50,50,50)")
            .attr("font-size", 22)
            .style("font-family", "sans-serif")
            .text(options.x_label);

        parent.append("text")
            .attr("x", -options.margin.left/1.5)
            .attr("y", options.height/2)
            .attr("text-anchor", "middle")
            .attr("fill", "rgb(50,50,50)")
            .attr("font-size", 22)
            .attr("transform", "rotate(-90," + -options.margin.left/1.5 + ',' + options.height/2 + ")")
            .text(options.y_label);

        var update = function(){
            parent.select(".x_axis").call(xAxis);
            parent.select(".y_axis").call(yAxis);

            parent.selectAll(".x_axis, .y_axis")
                .selectAll("path, line")
                .style("z-index", 100)
                .style("fill","none")
                .style("stroke",options.stroke_color)
                .style("stroke-width",options.stroke_width);

            parent.selectAll(".x_axis, .y_axis")
                .selectAll("text")
                .style("font-family", "sans-serif")
                .attr("fill", "rgb(50,50,50)");

            parent.selectAll(".x_axis")
                .attr("transform", "translate(0," + (options.height + 4) + ")");

            parent.selectAll(".y_axis")
                .attr("transform", "translate(-4,0)");

            Manager.update();
        };

        if(options.grid){
            xAxis.tickSize((-1)*options.height);
            yAxis.tickSize((-1)*options.width);
        }

        if(options.zoom){
            var zoom = d3.behavior.zoom()
                    .x(scales.x)
                    .y(scales.y)
                    .scaleExtent([1, 5])
                    .on("zoom", update);
            parent.call(zoom);
            parent.on("dblclick.zoom", null);
        }

        update();

        this.model = parent;

        return this;
    }

    return Axis;
});
