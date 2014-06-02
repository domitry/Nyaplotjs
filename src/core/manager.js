define([
    "underscore"
], function(_){
    var Manager = {data_frames: {}, panes: []};

    Manager.addData = function(name, df){
	entry = {};
	entry[name] = df;
	_.extend(this.data_frames, entry);
    }

    Manager.getData = function(name){
	return this.data_frames[name];
    }

    Manager.addPane = function(pane){
	this.panes.push(pane);
    }

    Manager.selected = function(data_id, rows){
	_.each(this.panes, function(entry){
	    entry.pane.selected(data_id, rows);
	});
    }

    Manager.update = function(){
	_.each(this.panes, function(entry){
	    entry.update();
	});
    }

    Manager.updateData = function(data_id, column_name, value){

    }

    return Manager;
});
