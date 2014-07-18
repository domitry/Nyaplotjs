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
            tooltip_margin:{top:2,left:2,bottom:2,right:2}
        };
        if(arguments.length>1)_.extend(options, _options);

        this.scales = scales;
        this.options = options;
        this.lists = [];

        return this;
    }

    // add small tool-tip to context area
    Tooltip.prototype.add = function(id, x, y, contents){
        var str = _.reduce(contents, function(memo, v, k){
            return memo.concat(String(k) + ":" + String(v) + "/n");
        }, "");
        str = str.slice(0, str.length-1);
        this.lists.append({id:id, x:x, y:y, contents:str});
    };

    // add small tool-tip to x-axis
    Tooltip.prototype.addToXAxis = function(id, x){
        this.lists.append({id:id, x:x, y:"bottom", contents:String(x)});
    };

    // add small tool-tip to y-axis
    Tooltip.prototype.addToYAxis = function(id, y){
        this.lists.append({id:id, x:"left", y:y, contents:String(y)});
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
        this.model.data(style);
        this.updateModels();
    };


    // generate dom objects for new tool-tips, and delete old ones
    Tooltip.prototype.updateModels = function(){
        this.model.exit().remove();

        var calcPoints = function(pos, width, height){
            var arr_w = this.options.arrow_width;
            var arr_h = this.options.arrow_height;
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
            return points['pos'];
        };

        (function(enters, options){
            enters.attr("transform",function(d){
                return "translate(" + d.x + "," + d.y + ")";
            });

            enters.append("path")
                .attr("d", function(d){return calcPoints(d.pos, d.w, d.h);})
                .attr("stroke", options.stroke_color)
                .atrr("stroke-width", options.stroke_width)
                .attr("fill", options.bg_color);

            enters.append("text")
                .text(function(d){return d.txt;})
                .attr("x", function(d){return d.t_x;})
                .attr("y", function(d){return d.t_y;})
                .attr("text-anchor", "middle")
                .attr("fill", options.text_color);

        })(this.model.enter().append("g"), this.options);
    };

    // calcurate height and width that are necessary for rendering the tool-tip
    Tooltip.prototype.proceedData = function(lists){
        var test_dom = d3.select(document.createElement("svg"));
        var margin = this.options.tooltip_margin;
        var context_height = this.options.context_height;
        var scales = this.scales;

        return _.map(lists, function(list){
            var text = test_dom.append("text").text(list.contents);
            var text_width = text[0][0].offsetWidth;
            var text_height = text[0][0].offsetHeight;

            var x=0, y=0;
            if(list.x == "left")x=0;
            else x = scales.x(list.x);
            if(list.y == "bottom")y=context_height;
            else y = scales.y(list.y);

            return {
                x: x,
                y: y,
                w: text_width + margin.left + margin.right,
                h: text_height + margin.top + margin.bottom,
                t_x: margin.left,
                t_y: margin.top
            };
        });
    };

    return Tooltip;
});
