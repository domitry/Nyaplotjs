define([
    'underscore',
    "utils/uuid",
    'utils/statistics'
], function(_, uuid, stats){
    return function(S){
        var Glyphs = {};

        Glyphs.decide_domain = function(){
            _.each([["xdomain", "_xscale", this.xarrs],
                    ["ydomain", "_yscale", this.yarrs]
                   ],
                   function(arr){
                       var dname = arr[0], sname = arr[1];
                       var arrs = arr[2];
                       
                       switch(this.props[sname].props.type){
                       case "linear":
                       case "log":
                       case "power":
                           decide_linear_domain.call(this, dname, arrs);
                           break;
                       case "ordinal":
                           decide_ordinal_domain.call(this, dname, arrs);
                           break;
                       case "time":
                           decide_time_domain.call(this, dname, arrs);
                           break;
                       default:
                           throw new Error("no type named");
                       }
                   }.bind(this));
        };

        function decide_linear_domain(pname, arrs){
            if(_.isNull(this[pname])){
                arrs = _.flatten(arrs);
                this[pname] = [_.min(arrs), _.max(arrs)];
            }else{
                this["reset_" + pname] = false;
            }
        }

        function decide_ordinal_domain(pname, arrs){
            if(_.isNull(this[pname])){
                this[pname] = _.uniq(_.flatten(arrs));
            }else{
                this["reset_" + pname] = false;
            }
        }

        function decide_time_domain(pname, arrs){
            // TODO
        }

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

        // ** shortcut methods from here ** //

        function create_x_descrete_position(label){
            var d2c = new S.D2c({
                scale: this.props._xscale,
                label: label
            });

            var position = new S.Position2d({
                x: d2c,
                y: this.props._yscale
            });

            this._dependencies.push(d2c);
            this._dependencies.push(position);
            return position;
        }
        
        Glyphs.bar = function(xarr, yarr, options){
            options = _.extend({
                width: 0.8
            }, options);

            _.each(xarr, function(label, i){
                this.rect([[-0.8, yarr[i]]],
                          [[ 0.8, 0]], _.extend(options, {
                              position: create_x_descrete_position.call(this, label),
                              color: _.isUndefined(options.colors) ? undefined : options.colors[i]
                          }));
            }.bind(this));
            
            this.xscale("ordinal");
            this.interactive = false;
            this.xarrs = [xarr];
        };

        Glyphs.box = function(xarr, yarrs, options){
            options = _.extend({
                width: 0.8
            }, options);

            console.log(xarr);

            _.each(xarr, function(label, i){
                var start = -options.width/2;
                var end = options.width/2;
                var yarr = yarrs[i];
                var med = stats.med(yarr);
                var q1 = stats.q1(yarr);
                var q3 = stats.q3(yarr);
                var h = q3-q1;
                var max = (_.max(yarr)-q3 > 1.5*h ? q3+1.5*h : _.max(yarr));
                var min = (q1-_.min(yarr) > 1.5*h ? q1-1.5*h : _.min(yarr));
                var outliers = _.select(yarr, function(val){
                    return val > max || val < min;
                });
                var position = create_x_descrete_position.call(this, label);

                this.vectors([[0, max]],
                             [[0, min]], {
                                 color: "#000",
                                 position: position
                             });
                
                this.rect([[start, q3]],
                          [[end,   q1]], _.extend(options, {
                              color: !_.isUndefined(options.colors) ? options.colors[i] : undefined,
                              position: position
                          }));

                this.vectors([[start, med]],
                             [[end, med]], {
                                 color: "#000",
                                 position: position
                             });

                this.scatter(_(outliers.length).times(_.constant(0)),
                             outliers, {
                                 color: "#000",
                                 size: 50,
                                 position: position
                             });
            }.bind(this));
            
            this.xscale("ordinal");
            this.interactive = false;
            this.xarrs = [xarr];
        };

        Glyphs.beans = function(){
        };

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

        return Glyphs;
    };
});
