define([
    'underscore',
    'simple/glyphs/primitive',
    'simple/glyphs/advanced',
    'simple/glyphs/shortcuts'
], function(_, init_primitive, init_advanced, init_shortcuts){
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

        init_primitive(S, Glyphs);
        init_advanced(S, Glyphs);
        init_shortcuts(S, Glyphs);

        return Glyphs;
    };
});
