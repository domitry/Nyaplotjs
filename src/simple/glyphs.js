define([
    'underscore',
    "utils/uuid"
], function(_, uuid){
    return function(S){
        var Glyphs = {};

        Glyphs.decide_domain = function(){
            _.each([{pname: "xdomain", arrs: this.xarrs},
                    {pname: "ydomain", arrs: this.yarrs}
                   ], function(hash){
                       var p = hash.pname;
                       if(_.isNull(this[p])){
                           var arrs = _.flatten(hash.arrs);
                           this[p] = [_.min(arrs), _.max(arrs)];
                       }else{
                           this["reset_" + p] = false;
                       }
                   }.bind(this));
        };

        _.each(["scatter", "line", "rect", "circle", "text"], function(str){
            var className = str.charAt(0).toUpperCase() + str.slice(1);
            Glyphs[str] = function(xarr, yarr, options){
                var xlabel = _.isUndefined(options.labels) ? "x" + uuid() : options.labels[0];
                var ylabel = _.isUndefined(options.labels) ? "y" + uuid() : options.labels[1];

                var data = (function(){
                    var d = {};
                    d[xlabel] = xarr;
                    d[ylabel] = yarr;
                    return new S.Data({data: d});
                })();
                
                this._data.push(data);

                var glyph = new S[className](_.extend({
                    x: xlabel,
                    y: ylabel,
                    data: data,
                    position: this.props._position
                }, options));
                
                this._glyphs.push(glyph);

                // for domain
                this.xarrs.push(xarr);
                this.yarrs.push(yarr);

                // for legend
                if(options.legend != false){
                    var name = _.isUndefined(options.name) ? str : options.name;
                    this.props._legend.props.names.push(name);
                    
                    if(!_.isUndefined(options.color))
                        this.props._legend.props.colors.push(options.color);

                    this.props._legend.props.updates.push(glyph);
                }

                // for wheel_zoom
                this.props._wheelzoom.props.updates.push(glyph);
            };
        });

        /**
         @examples
         plot.vectors([[0, 0], [1, 2]], [[1,2], [3,4]]);
         */
        Glyphs.vectors = function(src, dst, options){
            var _data = (function(){
                var d = {x1: [], y1: [], x2: [], y2: []};
                _.each(src, function(arr){
                    d.x1.push(arr[0]);
                    d.y1.push(arr[1]);
                });

                _.each(dst, function(arr){
                    d.x2.push(arr[0]);
                    d.y2.push(arr[1]);
                });
                return d;
            })();

            var data = new S.Data({data: _data});

            var glyph = new S.Vectors(_.extend({
                x1: 'x1',
                y1: 'y1',
                x2: 'x2',
                y2: 'y2',
                data: data,
                position: this.props._position
            }, _.isUndefined(options) ? {} : options));

            this._data.push(data);
            this.xarrs.push(_data.x1);
            this.xarrs.push(_data.x2);
            this.yarrs.push(_data.y1);
            this.yarrs.push(_data.y2);
            this._glyphs.push(glyph);
            this.props._wheelzoom.props.updates.push(glyph);
        };

        Glyphs.histogram = function(arr, options){
            var xlabel = "x" + uuid();
            var data = (function(){
                var d = {};
                d[xlabel] = arr;
                return new S.Data({data: d});
            })();

            var glyph = new S.Histogram(_.extend({
                value: xlabel,
                data: data,
                position: this.props._position,
                scalex: this.props._xscale
            }, options));

            this.interactive = false;
            this._data.push(data);
            this.xarrs.push(arr);
            this._glyphs.push(glyph);
            this.props._wheelzoom.props.updates.push(glyph);
        };

        Glyphs.bar = function(xarr, yarr){
        };

        // ** shortcut methods from here ** //
        Glyphs.add_rect = function(x, y, width, height, _options){
            if(_.isUndefined(_options))_options = {};
            
            var ops = _.extend(_options, {
                box_width: width,
                box_height: height
            });
            this.rect([x], [y], ops);
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

        return Glyphs;
    };
});
