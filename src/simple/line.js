define([
    "underscore",
    "utils/uuid"
], function(_, uuid){
    function Line(xarr, yarr, options){
        this.options = _.extend({
            color: "#fbb4ae"
        }, options);
        
        this.data = {
            type: "data",
            uuid: uuid(),
            args: {
                data: _.map(xarr, function(val, i){
                    return {x: xarr[i], y: yarr[i]};
                })
            }
        };

        this.xdomain = [_.min(xarr), _.max(xarr)];
        this.ydomain = [_.min(yarr), _.max(yarr)];
        this.xscale_type = "linear";
        this.yscale_type = "linear";
    }

    Line.prototype.to_json = function(plot){
        return {
            type: "line",
            uuid: uuid(),
            args: {
	            x: "x",
	            y: "y",
	            color: this.options.color
            }, sync_args: {
                position: plot.position_uuid,
                data: this.data.uuid
            }
        };
    };

    return Line;
});
