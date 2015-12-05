define([
    'underscore',
    'utils/uuid'
], function(_, uuid){
    return function(S, Glyphs){
        function process_glyph(glyph, options){
            this._glyphs.push(glyph);
            
            // for legend
            if(options.legend != false && !_.isUndefined(options.name)){
                this.props._legend.props.names.push(options.name);
                
                if(!_.isUndefined(options.color))
                    this.props._legend.props.colors.push(options.color);

                this.props._legend.props.updates.push(glyph);
            }

            // for wheel_zoom
            this.props._wheelzoom.props.updates.push(glyph);
        }

        function getClassName(str){
            return str.charAt(0).toUpperCase() + str.slice(1);
        }

        _.each(["scatter", "line", "rect", "circle", "text"], function(str){
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

                var glyph = new S[getClassName(str)](_.extend({
                    x: xlabel,
                    y: ylabel,
                    data: data,
                    position: (
                        _.isUndefined(options.position) ? 
                            this.props._position : options.position
                    )
                }, options));
                

                // for domain
                this.xarrs.push(xarr);
                this.yarrs.push(yarr);

                process_glyph.call(this, glyph, options);
            };
        });

        _.each(["vectors", "rect"], function(str){
            /**
             @examples
             plot.vectors([[x, y], [x, y]], [[1,2], [3,4]]);
             */
            Glyphs[str] = function(src, dst, options){
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

                var glyph = new S[getClassName(str)](_.extend({
                    x1: 'x1',
                    y1: 'y1',
                    x2: 'x2',
                    y2: 'y2',
                    data: data,
                    position: (
                        _.isUndefined(options.position) ? 
                            this.props._position : options.position
                    )
                }, _.isUndefined(options) ? {} : options));

                this._data.push(data);
                this.xarrs.push(_data.x1);
                this.xarrs.push(_data.x2);
                this.yarrs.push(_data.y1);
                this.yarrs.push(_data.y2);
                
                process_glyph.call(this, glyph, options);
            };
        });

        Glyphs.area = function(xarr, yarr1, yarr2, options){
            var _data = (function(){
                var d = {x: [], y1: [], y2: []};
                _.each(xarr, function(x, i){
                    d.x.push(x);
                    d.y1.push(yarr1[i]);
                    d.y2.push(yarr2[i]);
                });
                return d;
            })();

            var data = new S.Data({data: _data});

            var glyph = new S.Area(_.extend({
                x: 'x',
                y0: 'y1',
                y1: 'y2',
                data: data,
                position: (
                    _.isUndefined(options.position) ? 
                        this.props._position : options.position
                )
            }, _.isUndefined(options) ? {} : options));

            this._data.push(data);
            this.xarrs.push(_data.x);
            this.yarrs.push(_data.y1);
            this.yarrs.push(_data.y2);
            
            process_glyph.call(this, glyph, options);
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
    };
});
