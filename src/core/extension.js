/*
 * Extension keeps information about extensions for Nyaplot.
 *
 */

define([
    'underscore'
],function(_){
    var Extension = {};
    var buffer={};

    // load extension
    Extension.load = function(extension_name){
        if(typeof window[extension_name] == undefined)return;
        if(typeof window[extension_name]['Nya'] == undefined)return;

        var ext_info = window[extension_name].Nya;

        // not implemented yet
        if(typeof ext_info['pane'] !== undefined);
        if(typeof ext_info['diagrams'] !== undefined);
        if(typeof ext_info['scale'] !== undefined);

        buffer[extension_name] = ext_info;
    };

    Extension.pane = function(extension_name){
        return buffer[extension_name]['pane'];
    };

    return Extension;
});
