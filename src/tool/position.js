define([
    "underscore"
], function(_){
    return [
        "position2d",
        ["x", "y"],
        {
            is_raw: true
        },
        function(x_scale, y_scale, options){
            return function(xlabel, ylabel){
                return {
                    x: function(d){
                        return x_scale(d[xlabel]);
                    },
                    y: function(d){
                        return y_scale(d[ylabel]);
                    }
                };
            };
        }
    ];
});
