define( [
    'underscore',
    'state'
], function(_, State){
    return [
        "data",
        ["data"],
        {},
        function(data, options){
            return new State({
                data: data,
                update: function(new_arr){
                    this.data = new_arr;
                }
            });
        }
    ];
});
