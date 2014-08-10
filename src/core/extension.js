/*
 * Extension keeps information about extensions for Nyaplot.
 *
 */

define([
    'underscore',
    'core/stl',
    'view/diagrams/diagrams'
],function(_, STL, diagrams){
    var Extension = {};
    var buffer={};

    // load extension
    Extension.load = function(extension_name){
        if(typeof window[extension_name] == "undefined")return;
        if(typeof window[extension_name]['Nya'] == "undefined")return;

        var ext_info = window[extension_name].Nya;

        _.each(['pane', 'scale', 'axis'], function(component){
            if(typeof ext_info[component] == "undefined")
                ext_info[component] = STL[component];
        });

        if(typeof ext_info['diagrams'] != "undefined"){
            _.each(ext_info['diagrams'], function(content, name){
                diagrams.add(name, content);
            });
        }

        buffer[extension_name] = ext_info;
    };

    Extension.get = function(name){
        return buffer[name];
    };

    return Extension;
});
