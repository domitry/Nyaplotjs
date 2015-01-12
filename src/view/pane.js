/*
 * Pane: 
 *
 * Pane keeps dom objects which diagrams, filter, and legend will be placed on. Pane will tell each diagram, axis, and scale to update.
 * It also calcurate scales and each diagram and axis will be rendered according to the scales.
 *
 * options (summary) :
 *    rotate_x_label      -> (Float) : rotate labels placed on x-axis (radian)
 *    zoom                -> (Bool)  : Decide whether to allow zooming and pan
 *    grid                -> (Bool)  : Decide whether to draw grid line on pane.
 *    legend_position     -> (Object): String like 'right', 'left', 'top' and 'bottom', or Array like [0, 19] are allowed. The latter is coordinates in the plotting area.
 *    scale:              -> (String): The type of axis. 'linear', 'log' and 'power' are allowed.
 *    scale_extra_options -> (Object): extra options for extension which has different coordinates system except x-y.
 *    axis_extra_options  -> (Object): extra options for extension.
 */

define([
    'underscore',
    'node-uuid',
    'view/diagrams/diagrams',
    'view/components/filter',
    'view/components/legend_area',
    'view/components/tooltip'
],function(_, uuid, diagrams, Filter, LegendArea, Tooltip){
    function Pane(parent, scale, Axis, _options){
        var options = {
            width: 700,
            height: 500,
            margin: {top: 30, bottom: 80, left: 80, right: 30},
            xrange: [0,0],
            yrange: [0,0],
            x_label:'X',
            y_label:'Y',
            rotate_x_label: 0,
            rotate_y_label:0,
            zoom: false,
            grid: true,
            zoom_range: [0.5, 5],
            bg_color: '#eee',
            grid_color: '#fff',
            legend: false,
            legend_position: 'right',
            legend_width: 150,
            legend_height: 300,
            legend_stroke_color: '#000',
            legend_stroke_width: 0,
            font: "Helvetica, Arial, sans-serif",
            scale: 'linear',
            scale_extra_options: {},
            axis_extra_options: {}
        };
        if(arguments.length>1)_.extend(options, _options);

        this.uuid = uuid.v4();

        var model = parent.append("svg")
                .attr("width", options.width)
                .attr("height", options.height);

        var areas = (function(){
            var areas = {};
            areas.plot_x = options.margin.left;
            areas.plot_y = options.margin.top;
            areas.plot_width = options.width - options.margin.left - options.margin.right;
            areas.plot_height = options.height - options.margin.top - options.margin.bottom;
            
            if(options.legend){
                switch(options.legend_position){
                case 'top':
                    areas.plot_width -= options.legend_width;
                    areas.plot_y += options.legend_height;
                    areas.legend_x = (options.width - options.legend_width)/2;
                    areas.legend_y = options.margin.top;
                    break;

                case 'bottom':
                    areas.plot_height -= options.legend_height;
                    areas.legend_x = (options.width - options.legend_width)/2;
                    areas.legend_y = options.margin.top + options.height;
                    break;

                case 'left':
                    areas.plot_x += options.legend_width;
                    areas.plot_width -= options.legend_width;
                    areas.legend_x = options.margin.left;
                    areas.legend_y = options.margin.top;
                    break;

                case 'right':
                    areas.plot_width -= options.legend_width;
                    areas.legend_x = areas.plot_width + options.margin.left;
                    areas.legend_y = options.margin.top;
                    break;

                case _.isArray(options.legend_position):
                    areas.legend_x = options.width * options.legend_position[0];
                    areas.legend_y = options.height * options.legend_position[1];
                    break;
                }
            }
            return areas;
        })();

        var scales = (function(){
            var domains = {x: options.xrange, y:options.yrange};
            var ranges = {x:[0,areas.plot_width], y:[areas.plot_height,0]};
            return new scale(domains, ranges, {
                linear: options.scale,
                extra: options.scale_extra_options
            });
        })();

        // add background
        model.append("g")
            .attr("transform", "translate(" + areas.plot_x + "," + areas.plot_y + ")")
            .append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", areas.plot_width)
            .attr("height", areas.plot_height)
            .attr("fill", options.bg_color)
            .style("z-index",1);

        var axis = new Axis(model.select("g"), scales, {
            width:areas.plot_width,
            height:areas.plot_height,
            margin:options.margin,
            grid:options.grid,
            zoom:options.zoom,
            zoom_range:options.zoom_range,
            x_label:options.x_label,
            y_label:options.y_label,
            rotate_x_label:options.rotate_x_label,
            rotate_y_label:options.rotate_y_label,
            stroke_color: options.grid_color,
            pane_uuid: this.uuid,
            z_index:100,
            extra: options.axis_extra_options
        });

        // add context
        model.select("g")
            .append("g")
            .attr("class", "context")
            .append("clipPath")
            .attr("id", this.uuid + "clip_context")
            .append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", areas.plot_width)
            .attr("height", areas.plot_height);

        model.select(".context")
            .attr("clip-path","url(#" + this.uuid + 'clip_context' + ")");

        model.select("g")
            .append("rect")
            .attr("x", -1)
            .attr("y", -1)
            .attr("width", areas.plot_width+2)
            .attr("height", areas.plot_height+2)
            .attr("fill", "none")
            .attr("stroke", "#666")
            .attr("stroke-width", 1)
            .style("z-index", 200);

        // add tooltip
        var tooltip = new Tooltip(model.select("g"), scales, {
            font: options.font,
            context_width: areas.plot_width,
            context_height: areas.plot_height,
            context_margin: {
                top: areas.plot_x,
                left: areas.plot_y,
                bottom: options.margin.bottom,
                right: options.margin.right
            }
        });

        // add legend
        if(options.legend){
            model.append("g")
                .attr("class", "legend_area")
                .attr("transform", "translate(" + areas.legend_x + "," + areas.legend_y + ")");

            this.legend_area = new LegendArea(model.select(".legend_area"), {
                width: options.legend_width,
                height: options.legend_height,
                stroke_color: options.legend_stroke_color,
                stroke_width: options.legend_stroke_width
            });
        }

        this.diagrams = [];
        this.tooltip = tooltip;
        this.context = model.select(".context").append("g").attr("class","context_child");
        this.model = model;
        this.scales = scales;
        this.options = options;
        return this;
    }

    // Add diagram to pane
    Pane.prototype.addDiagram = function(type, data, options){
        _.extend(options, {
            uuid: uuid.v4(),
            tooltip: this.tooltip
        });

        var diagram = diagrams[type](this.context.append("g"), this.scales, data, options);
	    this.diagrams.push(diagram);
    };

    // Update all diagrams belong to the pane
    Pane.prototype.update = function(){
        var font = this.options.font;
	    _.each(this.diagrams, function(diagram){
	        diagram.update();
	    });

        this.model.selectAll("text")
            .style("font-family", font);
    };

    return Pane;
});
