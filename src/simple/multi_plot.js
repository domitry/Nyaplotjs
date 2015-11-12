define([
    'underscore',
    'simple/pane',
    'core'
], function(_, Pane, core){
    function MultiPlot(plots, layout){
        this.layout = (_.isUndefined(layout) ? {
            type: "columns",
            contents: (function(){
                var arr=[];
                var num = plots.length;
                _.times(num, function(i){
                    arr.push(i);
                });
                return arr;
            })()
        } : layout);
        
        this.stage_uuids = _.map(plots, function(p){
            return p.stage_uuid;
        });

        this.plots = plots;
    }
    
    MultiPlot.prototype.to_json = function(){
        var pane = new Pane(this.stage_uuids, this.layout);
        var plots = _.map(this.plots, function(p){return p.create_models(false);});
        plots.push(pane.to_json());
        return Array.prototype.concat.apply([], plots);
    };

    MultiPlot.prototype.show = function(div_id){
        var models = this.to_json();
        console.log(models);
        core.parse(models);
    };

    return MultiPlot;
});
