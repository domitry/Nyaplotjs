define([
    "underscore"
], function(_){
    var Manager = {data_frames: {}, panes: []};

    Manager.addData = function(name, data){
	_.extend(this.data_frames, {name:data});
    }

    Manager.addPane = function(pane){
	this.panes.append(pane);
    }

    Manager.selected = function(data_id, rows){
	
    }

    Manager.updateData = function(data_id, column_name, value){

    }

    return Manager;
});
