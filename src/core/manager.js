/*
 * Manager is the overall frame manager that holds plots and data
 * sources (DataFrame).
 */

define([
    "underscore"
], function(_){
    var Manager = {data_frames: {}, panes: []};

    // add a data source (DataFrame) by name
    Manager.addData = function(name, df){
        var entry = {};
        entry[name] = df;
        _.extend(this.data_frames, entry);
    };

    // Fetch a data source by name
    Manager.getData = function(name){
        return this.data_frames[name];
    };

    // Add a pane to the manager
    Manager.addPane = function(pane){
        this.panes.push(pane);
    };

    // Tell the manager that data has been selected
    Manager.selected = function(data_id, rows){
        _.each(this.panes, function(entry){
            entry.pane.selected(data_id, rows);
        });
    };

    // Update and redraw the panes
    Manager.update = function(){
        _.each(this.panes, function(entry){
            entry.pane.update();
        });
    };

    // Update data (nyi)
    Manager.updateData = function(data_id, column_name, value){

    };

    return Manager;
});
