define([
    "underscore",
    "utils/uuid"
], function(_, uuid){
    function Histogram(arr, options){
        this.options = _.extend({
            color: "#fbb4ae",
            maxval: arr.length
        }, options);
        
        this.data = {
            type: "data",
            uuid: uuid(),
            args: {
                data: _.map(arr, function(val, i){
                    return {d: val};
                })
            }
        };

        this.xdomain = [_.min(arr), _.max(arr)];
        this.ydomain = [0, this.options.maxval];
        this.xscale_type = "linear";
        this.yscale_type = "linear";
    }

    Histogram.prototype.to_json = function(plot){
        plot.interactive = false;
        
        return {
            type: "histogram",
            uuid: uuid(),
            args: {
	            value: "d",
	            color: this.options.color
            }, sync_args: {
                scalex: plot.xscale_uuid,
                position: plot.position_uuid,
                data: this.data.uuid
            }
        };
    };

    return Histogram;
});
