define([
    'underscore'
],function(_){
    function Dataframe(name, data){
	this.raw = data;
	return this;
    }
    
    Dataframe.prototype.row = function(num){
	return this.raw[num];
    }

    Dataframe.prototype.column = function(label){
	arr = [];
	_.each(this.raw, function(row){arr.push(row[label]);});
	return arr;
    }

    Dataframe.prototype.columnRange = function(label){
	column = this.column(label);
	return {
	    max: d3.max(column, function(val){return val;}),
	    min: d3.min(column, function(val){return val;})
	}
    }

    return Dataframe;
});
