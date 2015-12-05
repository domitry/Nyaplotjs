define([
    'underscore',
    'd3',
    'utils/statistics'
], function(_, d3, stats){
    return function(S, Glyphs){
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

        /**
         @example
         plot.multi_bar(['A', 'B', 'C'], [[10, 20, 30], [1, 10, 50], [23, 1, 9]])
         */
        Glyphs.multi_bar = function(xarr, yarrs, options){
            options = _.extend({
                width: 0.8,
                interval: 0.01
            }, options);
            
            if(options.stacked == true){
                var start = -options.width/2;
                var end = options.width/2;
                
                _.each(xarr, function(label, i){
                    var position = create_x_descrete_position.call(this, label);
                    var y = 0;
                    _.each(yarrs[i], function(dy, j){
                        this.rect([[start, y+dy]], [[end, y]], _.extend(options, {
                            position: position,
                            color: _.isUndefined(options.colors) ? undefined : options.colors[j]
                        }));
                        y+=dy;
                    }.bind(this));
                }.bind(this));
            }else{
                _.each(xarr, function(label, i){
                    var position = create_x_descrete_position.call(this, label);
                    var x = -1+options.interval;
                    var l = yarrs[i].length;
                    var dx = (2.0 - options.interval*(l+1))/l;
                    _.each(yarrs[i], function(y, j){
                        this.rect([[x, y]], [[x+dx, 0]], _.extend(options, {
                            position: position,
                            color: _.isUndefined(options.colors) ? undefined : options.colors[j]
                        }));
                        x += (dx + options.interval);
                    }.bind(this));
                }.bind(this));
            }
            
            this.xscale("ordinal");
            this.interactive = false;
            this.xarrs = [xarr];
        };

        Glyphs.box = function(xarr, yarrs, options){
            options = _.extend({
                width: 0.8
            }, options);

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

        Glyphs.beans = function(xarr, arrs, options){
            options = _.extend({
                width: 0.9,
                bins: 50
            }, options);

            _.each(xarr, function(label, i){
                var arr = arrs[i];
                var hist = d3.layout.histogram().bins(options.bins)(arr);
                
                var position = create_x_descrete_position.call(this, label);

                var x0 = (function(){
                    var x_ = _.map(hist, function(bin){return bin.length;});
                    var xmax = _.max(x_);
                    return _.map(x_, function(l){return options.width*l/xmax;});
                })();

                var x1 = _.map(x0, function(x){return (-1)*x;});
                var y = _.map(hist, function(bin){return bin.x;});

                console.log(x0, x1, y);
                console.log(x0.length, x1.length, y.length);
                
                this.area(y, x0, x1, {
                    interpolate: 'bundle',
                    transpose: true,
                    position: position
                });

                var src = _.map(arr, function(v){return [-0.1, v];});
                var dst = _.map(arr, function(v){return [0.1, v];});
                this.vectors(src, dst, {
                    position: position,
                    color: _.isUndefined(options.tick_color) ? "#eee" : options.tick_color
                });
            }.bind(this));
            
            this.xscale("ordinal");
            this.interactive = false;
            this.xarrs = [xarr];
        };
    };
});
