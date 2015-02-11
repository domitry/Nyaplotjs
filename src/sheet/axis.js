/*
 * Axis:
 *
 * Axis generates x and y axies for plot. It also controlls grids.
 * Have a look at documents on d3.svg.axis and d3.behavior.zoom to learn more.
 *
 * options (summary) :
 *    width     -> (Float) : Width of *context area*.
 *    height    -> (Float) : Height of *context area*.
 *    margin    -> (Object): Margin outside of context area. used when adding axis labels.
 *    pane_uuid -> (Float) : Given by pane itself. used to tell update information to Manager.
 *    z_index   -> (Float) : Given by pane. Usually axis are placed below context and over backgroupd.
 */

define([
    'underscore'
],function(_){
    return [
        "axis2d",
        ["context", "xscale", "yscale"],
        {
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
            rotate_y_label:0
        },
        function(context, xscale, yscale, options){
            var xAxis = d3.svg.axis()
                    .scale(xscale)
                    .orient("bottom");

            var yAxis = d3.svg.axis()
                    .scale(yscale)
                    .orient("left");

            var g = context.append("g");

            g.append("g").attr("class", "x_axis");
            g.append("g").attr("class", "y_axis");

            g.select(".x_axis").call(xAxis);
            g.select(".y_axis").call(yAxis);

            g.selectAll(".x_axis, .y_axis")
                .selectAll("path, line")
                .style("z-index", options.z_index)
                .style("fill","none")
                .style("stroke",options.stroke_color)
                .style("stroke-width",options.stroke_width);

            g.selectAll(".x_axis, .y_axis")
                .selectAll("text")
                .attr("fill", "rgb(50,50,50)");

            g.selectAll(".x_axis")
                .attr("transform", "translate(0," + (options.height + 4) + ")");

            g.selectAll(".y_axis")
                .attr("transform", "translate(-4,0)");
            
            if(options.rotate_y_label != 0){
                g.selectAll(".y_axis")
                    .selectAll("text")
                    .style("text-anchor", "end")
                    .attr("transform", function(d) {
                        return "rotate(" + options.rotate_y_label + ")";
                    });
            }

            if(options.rotate_x_label != 0){
                g.selectAll(".x_axis")
                    .selectAll("text")
                    .style("text-anchor", "end")
                    .attr("transform", function(d) {
                        return "rotate(" + options.rotate_x_label + ")";
                    });
            }

            if(options.grid){
                xAxis.tickSize((-1)*options.height);
                yAxis.tickSize((-1)*options.width);
            }

            return g;
        }
    ];
});
