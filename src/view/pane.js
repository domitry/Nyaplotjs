/*
 * Pane keeps a dom object which diagrams, filter, and legend will be placed on.
 * It also calcurate scales and each diagram and axis will be rendered base on the scales.
 */

define([
    'underscore',
    'node-uuid',
    'view/diagrams/diagrams',
    'view/components/axis',
    'view/components/filter',
    'view/components/legend_area'
],function(_, uuid, diagrams, Axis, Filter, LegendArea){
    function Pane(parent, _options){
        var options = {
            width: 700,
            height: 500,
            margin: {top: 30, bottom: 80, left: 80, right: 30},
            xrange: [0,0],
            yrange: [0,0],
            x_label:'X',
            y_label:'Y',
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
            legend_stroke_width: 0
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
            var ranges = {x:[0,areas.plot_width], y:[areas.plot_height,0]};
            var scales = {};
            _.each({x:'xrange',y:'yrange'},function(val, key){
                if(options[val].length > 2 || _.any(options[val], function(el){return !isFinite(el);})){
                    scales[key] = d3.scale.ordinal().domain(options[val]).rangeBands(ranges[key]);
                }
                else{
                    scales[key] = d3.scale.linear().domain(options[val]).range(ranges[key]);
                }
            });
            return scales;
        })();

        // add background
        model.append("g")
            .attr("transform", "translate(" + areas.plot_x + "," + areas.plot_y + ")")
            .append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", areas.plot_width)
            .attr("height", areas.plot_height)
            .attr("stroke", "#000000")
            .attr("stroke_width", 2)
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
            stroke_color: options.grid_color,
            pane_uuid: this.uuid
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
        this.context = model.select(".context");
        this.scales = scales;
        this.options = options;
        this.filter = null;
        return this;
    }

    // Add diagram to pane
    Pane.prototype.addDiagram = function(type, data, options){
        _.extend(options, {
            uuid: uuid.v4(),
            clip_id: this.uuid + 'clip_context'
        });

        var diagram = new diagrams[type](this.context, this.scales, data, options);

        if(this.options.legend){
            var legend_area = this.legend_area;
            var legend = diagram.getLegend();
            if(_.isArray(legend))_.each(legend, function(l){
                legend_area.add(l);
            });
            else this.legend_area.add(legend);
	    }

	    this.diagrams.push(diagram);
    };

    // Add filter to pane (usually a gray box on the pane)
    Pane.prototype.addFilter = function(target, options){
	    var diagrams = this.diagrams;
	    var callback = function(ranges){
	        _.each(diagrams, function(diagram){
		        diagram.checkSelectedData(ranges);
	        });
	    };
	    this.filter = new Filter(this.context, this.scales, callback, options);
    };

    // Update all diagrams belong to the pane
    Pane.prototype.update = function(){
	    _.each(this.diagrams, function(diagram){
	        diagram.update();
	    });
    };

    return Pane;
});
