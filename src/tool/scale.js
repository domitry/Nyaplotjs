define([
    "underscore"
], function(_){
    return [
        "scale",
        ["domain", "range", "type"],
        {
            scale: null,
            is_raw: true
        },
        function(domain, range, type, options){
            if(_.isNull(this.scale)){
                var scale = (d3.scale[type])().domain(domain);
                if(type == "ordinal")scale.rangeBands(range);
                else scale.range(range);
                this.scale = scale;
                return scale;
            }else{
                return this.scale;
            }
        }
    ];
});
