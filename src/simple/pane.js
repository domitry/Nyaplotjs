define([
    'underscore',
    'utils/uuid'
], function(_, uuid){
    function Pane(stage_uuids, layout){
        this.layout = layout;
        this.stage_uuids = stage_uuids;
    }
    
    Pane.prototype.to_json = function(){
        return {
            type: "pane", uuid: uuid(), args: {
	            "parent_id":"vis",
	            "layout": this.layout
            }, sync_args: {
                stages: this.stage_uuids
            }
        };
    };

    return Pane;
});
