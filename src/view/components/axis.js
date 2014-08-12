/*
 * Axis generates x and y axies for plot. It also controlls grids.
 * Have a look at documents on d3.svg.axis and d3.behavior.zoom to learn more.
 */

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
            zoom:false,
            zoom_range:[0.5, 5],
            rotate_x_label:0,
            rotate_y_label:0,
            pane_uuid: null,
            z_index:0
        };
        if(arguments.length>2)_.extend(options, _options);

        var xAxis = d3.svg.axis()
                .scale(scales.raw.x)
                .orient("bottom");

        var yAxis = d3.svg.axis()
                .scale(scales.raw.y)
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
                .style("z-index", options.z_index)
                .style("fill","none")
                .style("stroke",options.stroke_color)
                .style("stroke-width",options.stroke_width);

            parent.selectAll(".x_axis, .y_axis")
                .selectAll("text")
                .attr("fill", "rgb(50,50,50)");

            parent.selectAll(".x_axis")
                .attr("transform", "translate(0," + (options.height + 4) + ")");

            parent.selectAll(".y_axis")
                .attr("transform", "translate(-4,0)");
            
            if(options.rotate_x_label != 0){
                parent.selectAll(".x_axis")
                    .selectAll("text")
                    .style("text-anchor", "end")
                    .attr("transform", function(d) {
                        return "rotate(" + options.rotate_x_label + ")";
                    });
            }

            if(options.rotate_y_label != 0){
                parent.selectAll(".y_axis")
                    .selectAll("text")
                    .style("text-anchor", "end")
                    .attr("transform", function(d) {
                        return "rotate(" + options.rotate_y_label + ")";
                    });
            }

            Manager.update(options.pane_uuid);
        };

        if(options.grid){
            xAxis.tickSize((-1)*options.height);
            yAxis.tickSize((-1)*options.width);
        }

        if(options.zoom){
            var zoom = d3.behavior.zoom()
                    .x(scales.raw.x)
                    .y(scales.raw.y)
                    .scaleExtent(options.zoom_range)
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
