/*
 * Tooltip is an interface for generating small tool-tips and rendering them.
 * Pane generate its instance and keep it. Then each diagrams send requests to it.
 */

define([
    'underscore'
],function(_){
    function Tooltip(parent, scales, _options){
        var options = {
            bg_color:"#333",
            stroke_color:"#000",
            stroke_width:1,
            text_color:"#fff",
            context_width:0,
            context_height:0,
            context_margin:{top:0,left:0,bottom:0,right:0},
            arrow_width:10,
            arrow_height:10,
            tooltip_margin:{top:2,left:5,bottom:2,right:5},
            font_size: "1em"
        };
        if(arguments.length>1)_.extend(options, _options);
        
        var model=parent.append("g");

        this.scales = scales;
        this.options = options;
        this.lists = [];
        this.model = model;

        return this;
    }

    // add small tool-tip to context area
    Tooltip.prototype.add = function(id, x, y, pos, contents){
        var str = _.reduce(contents, function(memo, v, k){
            return memo.concat(String(k) + ":" + String(v) + "/n");
        }, "");
        str = str.slice(0, str.length-1);
        this.lists.push({id:id, x:x, y:y, pos:pos, contents:str});
    };

    // add small tool-tip to x-axis
    Tooltip.prototype.addToXAxis = function(id, x){
        this.lists.push({id:id, x:x, y:"bottom", pos:'bottom', contents:String(x)});
    };

    // add small tool-tip to y-axis
    Tooltip.prototype.addToYAxis = function(id, y){
        this.lists.push({id:id, x:"left", y:y, pos:'right', contents:String(y)});
    };

    // remove old tool-tips (dom objects are deleted after being called Tooltip.update)
    Tooltip.prototype.remove = function(id){
        this.lists = _.filter(this.lists, function(d){
            if(d.id==id)return false;
            return true;
        });
    };

    // calcurate position, height and width of tool-tip, then update dom objects
    Tooltip.prototype.update = function(){
        var style = this.proceedData(this.lists);
        var model = this.model.selectAll("g").data(style);
        this.updateModels(model);
    };


    // generate dom objects for new tool-tips, and delete old ones
    Tooltip.prototype.updateModels = function(model){
        model.exit().remove();
        var options = this.options;

        (function(enters, options){
            var lineFunc = d3.svg.line()
                    .x(function(d){return d.x;})
                    .y(function(d){return d.y;})
                    .interpolate("linear");

            enters.append("path")
                .attr("d", function(d){return lineFunc(d.shape);})
                .attr("stroke", options.stroke_color)
                .attr("fill", options.bg_color);
            //.atrr("stroke-width", options.stroke_width)

            enters.append("text")
                .text(function(d){return d.text;})
                .attr("x", function(d){return d.text_x;})
                .attr("y", function(d){return d.text_y;})
                .attr("text-anchor", "middle")
                .attr("fill", "#ffffff")
                .attr("font-size",options.font_size);

            enters.attr("transform",function(d){
                return "translate(" + d.tip_x + "," + d.tip_y + ")";
            });

        })(model.enter().append("g"), this.options);
    };

    // calcurate height and width that are necessary for rendering the tool-tip
    Tooltip.prototype.proceedData = function(lists){
        var options = this.options;

        // calcurate shape and center point of tool-tip
        var calcPoints = function(pos, width, height){
            var arr_w = options.arrow_width;
            var arr_h = options.arrow_height;
            var tt_w = width;
            var tt_h = height;
            var points = {
                'top':[
                    {x:0, y:0},{x:arr_w/2, y:-arr_h},
                    {x:tt_w/2, y:-arr_h},{x:tt_w/2, y:-arr_h-tt_h},
                    {x:-tt_w/2, y:-arr_h-tt_h},{x:-tt_w/2, y:-arr_h},
                    {x:-arr_w/2, y:-arr_h},{x:0, y:0}
                ],
                'right':[
                    {x:0, y:0},{x:-arr_w, y:-arr_h/2},
                    {x:-arr_w, y:-tt_h/2},{x:-arr_w-tt_w, y:-tt_h/2},
                    {x:-arr_w-tt_w, y:tt_h/2},{x:-arr_w, y:tt_h/2},
                    {x:-arr_w, y:arr_h/2},{x:0, y:0}
                ]
            };
            points['bottom'] = _.map(points['top'], function(p){return {x:p.x, y:-p.y};});
            points['left'] = _.map(points['right'], function(p){return {x:-p.x, y:p.y};});

            var center = (function(p){
                var result={};
                switch(pos){
                case 'top': case 'bottom':
                    result = {x:0, y:(p[2].y+p[3].y)/2};
                    break;
                case 'right': case 'left':
                    result = {x:(p[2].x+p[3].x)/2, y:0};
                    break;
                }
                return result;
            })(points[pos]);

            return {shape:points[pos], text: center};
        };

        var margin = this.options.tooltip_margin;
        var context_height = this.options.context_height;
        var scales = this.scales;
        var model = this.model;

        return _.map(lists, function(list){
            var text = model.append("text").text(list.contents).attr("font-size", options.font_size);
            var text_width = text[0][0].getBBox().width;
            var text_height = text[0][0].getBBox().height;
            text.remove();

            var tip_width = text_width + margin.left + margin.right;
            var tip_height = text_height + margin.top + margin.bottom;

            var tip_x = (list.x == "left" ? 0 : scales.x(list.x));
            var tip_y = (list.y == "bottom" ? context_height : scales.y(list.y));

            var points = calcPoints(list.pos, tip_width, tip_height);

            return {
                shape: points.shape,
                tip_x: tip_x,
                tip_y: tip_y,
                text_x: points.text.x,
                text_y: points.text.y + text_height/2,
                text: list.contents
            };
        });
    };

    return Tooltip;
});
