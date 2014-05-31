define([
    'underscore'
],function(_){
    function Dataframe(name, data){
	this.raw = data;
	return this;
    }
    
    Dataframe.prototype.row = function(row_num){
	return this.raw[row_num];
    }

    Dataframe.prototype.column = function(label){
	var arr = [];
	var raw = this.raw;
	_.each(raw, function(row){arr.push(row[label]);});
	return arr;
    }

    Dataframe.prototype.pickUpCells = function(label, row_nums){
	var column = this.column(label);
	return _.map(row_nums, function(i){
	    return column[i];
	});
    }

    Dataframe.prototype.columnRange = function(label){
	var column = this.column(label);
	return {
	    max: d3.max(column, function(val){return val;}),
	    min: d3.min(column, function(val){return val;})
	}
    }

    return Dataframe;
});
