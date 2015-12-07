define([
    'underscore',
    'd3'
], function(_, d3){
    return [
        "scale",
        ["domain", "range", "type"],
        {
            scale: null,
            is_raw: true
        },
        function(domain, range, type, options){
            if(_.isNull(this.scale)){
                this.scale = (function(){
                    if(type == "time"){
                        var scale_ = d3.time.scale()
                                .domain(_.map(domain, function(d){
                                    return new Date(d);
                                }))
                                .range(range);
                        
                        return _.extend(function(val){
                            if(_.isString(val))return scale_(new Date(val));
                            else return scale_(val);
                        }, scale_);
                    }else{
                        var scale = (d3.scale[type])().domain(domain);
                        if(type == "ordinal") scale.rangeBands(range);
                        else scale.range(range);
                        return scale;
                    }
                })();
            }
            
            return this.scale;
        }
    ];
});
