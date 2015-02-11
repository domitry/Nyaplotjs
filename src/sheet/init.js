define([
    'underscore',
    'sheet',
    'sheet/axis',
    'sheet/background',
    'sheet/label',
    'sheet/context'
], function(_, sheet){
    var args = [].slice.call(arguments, 2);

    return function(){
        _.each(args, function(arg){
            sheet.register_sheet.apply(sheet, arg);
        });
    };
});
