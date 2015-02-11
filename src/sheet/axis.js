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
        ["context", "xscale", "yscale", "width", "height"],
        {
            margin: {top:0,bottom:0,left:0,right:0},
            stroke_color:"#fff",
            stroke_width: 1.0,
            grid:true
        },
        function(context, xscale, yscale, width, height, options){
            var xAxis = d3.svg.axis()
                    .scale(xscale)
                    .orient("bottom");

            var yAxis = d3.svg.axis()
                    .scale(yscale)
                    .orient("left");

            var g = context.append("g");

            g.append("g").attr("class", "x_axis");
            g.append("g").attr("class", "y_axis");

            if(options.grid){
                xAxis.tickSize((-1)*height);
                yAxis.tickSize((-1)*width);
            }

            g.select(".x_axis").call(xAxis);
            g.select(".y_axis").call(yAxis);

            g.selectAll(".x_axis, .y_axis")
                .selectAll("path, line")
                .style("fill","none")
                .style("stroke",options.stroke_color)
                .style("stroke-width",options.stroke_width);

            g.selectAll(".x_axis, .y_axis")
                .selectAll("text")
                .attr("fill", "rgb(50,50,50)");

            g.selectAll(".x_axis")
                .attr("transform", "translate(0," + (height + 4) + ")");

            g.selectAll(".y_axis")
                .attr("transform", "translate(-4,0)");

            return g;
        }
    ];
});
