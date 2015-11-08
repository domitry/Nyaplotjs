define([
    "underscore",
    "simple/base",
    "utils/uuid"
], function(_, SimpleBase, uuid){
    _.extend(LinePlot.prototype, SimpleBase.prototype);
    /*
     * A simple charts with one line.
     * ex:
     * (new Nyaplot.LinePlot([1,2,3], [1,2,3])).show("vis");
     */
    function LinePlot(xarr, yarr, color){
        if(xarr.length!=yarr.length)
            throw new Error("Lengths of two given arrays is different.");
        _.extend(this, new SimpleBase());
        
        color = _.isUndefined(color) ? "#fbb4ae" : color;

        this.data = _.map(xarr, function(val, i){
            return {x: xarr[i], y: yarr[i]};
        });
        
        this.plots = [{
            type: "line",
            uuid: uuid(),
            args: {
	            x: "x",
	            y: "y",
	            color: color
            }, sync_args: {
                position: this.position_uuid,
                data: this.data_uuid
            }
        }];

        this.xdomain = [_.min(xarr), _.max(xarr)];
        this.ydomain = [_.min(yarr), _.max(yarr)];
    }
    
    return LinePlot;
});
