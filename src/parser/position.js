define([
    "underscore"
], function(_){
    return [
        "position2d",
        ["x", "y"],
        {},
        function(x_scale, y_scale, options){
            return function(x, y){
                return {
                    x: x_scale(x),
                    y: y_scale(y)
                };
            };
        }
    ];
});
