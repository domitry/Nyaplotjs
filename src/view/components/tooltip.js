/*
 * Tooltip is an interface for generating small tool-tips and rendering them.
 * Pane generate its instance and keep it. Then each diagrams send requests to it.
 */

define([
    'underscore',
    'utils/ua_info'
],function(_, ua){
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
            font: "Helvetica, Arial, sans-serif",
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
        var str = _.map(contents, function(v, k){
            return String(k) + ":" + String(v);
        });
        this.lists.push({id:id, x:x, y:y, pos:pos, contents:str});
    };

    // add small tool-tip to x-axis
    Tooltip.prototype.addToXAxis = function(id, x, round){
        if(arguments.length > 2){
            var pow10 = Math.pow(10, round);
            x = Math.round(x*pow10)/pow10;
        }
        this.lists.push({id:id, x:x, y:"bottom", pos:'bottom', contents:String(x)});
    };

    // add small tool-tip to y-axis
    Tooltip.prototype.addToYAxis = function(id, y, round){
        if(arguments.length > 2){
            var pow10 = Math.pow(10, round);
            y = Math.round(y*pow10)/pow10;
        }
        this.lists.push({id:id, x:"left", y:y, pos:'right', contents:String(y)});
    };

    // remove all exsistng tool-tips
    Tooltip.prototype.reset = function(){
        this.lists = [];
        this.update();
    };

    // calcurate position, height and width of tool-tip, then update dom objects
    Tooltip.prototype.update = function(){
        var style = this.processData(this.lists);
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

            enters.each(function(){
                var dom;
                if(_.isArray(this.__data__.text)){
                    var texts = this.__data__.text;
                    var x = this.__data__.text_x;
                    var y = this.__data__.text_y;
                    var data = _.map(_.zip(texts, y), function(row){return {text: row[0], y: row[1]};});
                    dom = d3.select(this)
                        .append("g")
                        .selectAll("text")
                        .data(data)
                        .enter()
                        .append("text")
                        .text(function(d){return d.text;})
                        .attr("x", function(d){return x;})
                        .attr("y", function(d){return d.y;});
                }else{
                    dom = d3.select(this).append("text")
                        .text(function(d){return d.text;})
                        .attr("x", function(d){return d.text_x;})
                        .attr("y", function(d){return d.text_y;});
                }
                dom.attr("text-anchor", "middle")
                    .attr("fill", "#ffffff")
                    .attr("font-size",options.font_size)
                    .style("font-family", options.font);

                // Fix for chrome's Issue 143990
                // https://code.google.com/p/chromium/issues/detail?colspec=ID20Pri20Feature20Status20Modified20Mstone%20OS&sort=-modified&id=143990
                switch(ua()){
                    case 'chrome':
                    dom.attr("dominant-baseline","middle").attr("baseline-shift","50%");break;
                    default:
                    dom.attr("dominant-baseline","text-after-edge");break;
                }
            });

            enters.attr("transform",function(d){
                return "translate(" + d.tip_x + "," + d.tip_y + ")";
            });

        })(model.enter().append("g"), this.options);
    };

    // calcurate height and width that are necessary for rendering the tool-tip
    Tooltip.prototype.processData = function(lists){
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

        var calcText = function(text, size){
            var dom = model.append("text").text(text).attr("font-size", size).style("font-family", options.font);
            var text_width = dom[0][0].getBBox().width;
            var text_height = dom[0][0].getBBox().height;
            dom.remove();
            return {w: text_width, h:text_height};
        };

        return _.map(lists, function(list){
            var text_num = (_.isArray(list.contents) ? list.contents.length : 1);
            var str = (_.isArray(list.contents) ? _.max(list.contents, function(d){return d.length;}) : list.contents);

            var text_size = calcText(str, options.font_size);
            var tip_width = text_size.w + margin.left + margin.right;
            var tip_height = (text_size.h + margin.top + margin.bottom)*text_num;

            var tip_x = (list.x == "left" ? 0 : scales.x(list.x));
            var tip_y = (list.y == "bottom" ? context_height : scales.y(list.y));

            var points = calcPoints(list.pos, tip_width, tip_height);

            var text_y;
            if(_.isArray(list.contents)){
                var len = list.contents.length;
                text_y = _.map(list.contents, function(str, i){
                    return (points.text.y - text_size.h/2*(len-2)) + text_size.h*i;
                });
            }else{
                text_y = points.text.y + text_size.h/2;
            }

            return {
                shape: points.shape,
                tip_x: tip_x,
                tip_y: tip_y,
                text_x: points.text.x,
                text_y: text_y,
                text: list.contents
            };
        });
    };

    return Tooltip;
});
