define([
    'underscore'
], function(_){
    return function(S, Glyphs){
        Glyphs.add_rect = function(x, y, width, height, _options){
            if(_.isUndefined(_options))_options = {};
            
            var ops = _.extend(_options, {
                box_width: width,
                box_height: height
            });
            this.rect([[x, y]], [[x+width, y+height]], ops);
        };

        Glyphs.add_circle = function(x, y, radius, _options){
            if(_.isUndefined(_options))_options = {};
            
            var ops = _.extend(_options, {
                radius: radius
            });
            this.circle([x], [y], ops);
        };

        Glyphs.add_text = function(x, y, text, _options){
            this.text([x], [y], _.extend(_options, {
                text: text
            }));
        };

        /**
         @example
         plot.annotation([0., 2.0], [1.8, 1.8], "max value")
         */
        Glyphs.annotation = function(src, dst, text){
            this.vectors([src], [dst], {
                with_arrow: true
            });
            this.text([src[0]], [src[1]], {text: text});
        };
    };
});
