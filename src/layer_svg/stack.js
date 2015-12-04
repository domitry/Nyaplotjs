/**
 Order multiple child layers as stack:
+---+
|+---+
+|+---+
 +|c 3|
  +---+
 Each children have the same width and height.
*/
define([
    'underscore'
],function(_){
    return [
        "stack",
        [],
        {
            width: "auto",
            height: "auto",
            children: []
        },
        function(g, options){
            _.each(["width", "height"], function(name){
                //// update w/h of itself
                if(options[name] == "auto"){
                    var max = _.max(_.map(options.children, function(c){return c[name];}));
                    if(_.isNumber(max))options[name] = max;
                }

                /// update w/h of children
                if(options[name] != "auto"){
                    _.each(options.children, function(c){
                        c[name] = options[name];
                    });
                }
            });
            return g;
        }
    ];
});
