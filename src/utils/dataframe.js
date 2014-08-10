/*
 * Dataframe loads (JSON) data or through a URI and allows
 * a plot to query that data
 */

define([
    'underscore'  // module
],function(_){
    function Dataframe(name, data){
        // load data from a String containing a URL or
        // use the (raw) data
        if(data instanceof String && /url(.+)/g.test(data)){
            var url = data.match(/url\((.+)\)/)[1];
            var df = this;
            d3.json(url, function(error, json){
                df.raw = JSON.parse(json);
            });
            this.raw = {};
        }
        else this.raw = data;

        // detect the nested column (that should be only one)
        var header = _.keys(data[0]);
        var nested = _.filter(_.zip(_.map(data, function(row, i){return _.toArray(row).push(i);})), function(column){
            _.all(_.isObject(column));
        });
        if(nested.length == 1){
            this.nested = header(nested[0].last);
        }else this.nested = false;

        this.filters = {};
        return this;
    }
    
    // Get a row by index
    Dataframe.prototype.row = function(row_num){
        return this.raw[row_num];
    };

    // Get a column by label
    Dataframe.prototype.column = function(label){
        var arr = [];
        var raw = this.raw;
        _.each(raw, function(row){arr.push(row[label]);});
        return arr;
    };

    // Add a filter function to the list
    Dataframe.prototype.addFilter = function(self_uuid, func, excepts){
        this.filters[self_uuid] = {func:func, excepts:excepts};
    };

    // Iterate a column using filters
    Dataframe.prototype.columnWithFilters = function(self_uuid, label){
        var raw = this.raw.concat();
        _.each(this.filters, function(filter, uuid){
            if(filter.excepts.indexOf('self') != -1 && uuid==self_uuid)return;
            if(!(self_uuid in filter.excepts))
                raw = _.filter(raw, filter.func);
        });
        return _.map(raw, function(row){return row[label];});
    };

    // Fetch a value using column label and row number
    Dataframe.prototype.pickUpCells = function(label, row_nums){
        var column = this.column(label);
        return _.map(row_nums, function(i){
            return column[i];
        });
    };

    // Fetch partical dataframe as the format like [{a:1, b:2, c:3}, ...,{a:1, b:2, c:3}] using column names
    Dataframe.prototype.getPartialDf = function(column_names){
        return _.map(this.raw, function(row){
            return _.reduce(column_names, function(memo, name){
                memo[name] = row[name];
                return memo;
            }, {});
        });
    };

    Dataframe.prototype.nested_column = function(row_num, name){
        if(!this.nested)throw "Recieved dataframe is not nested.";
        var df = new Dataframe('', this.row(row_num)[this.nested]);
        return df.column(name);
    };

    Dataframe.prototype.columnRange = function(label){
        var column = this.column(label);
        return {
            max: d3.max(column, function(val){return val;}),
            min: d3.min(column, function(val){return val;})
        };
    };

    return Dataframe;
});
