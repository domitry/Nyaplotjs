/*
 * parse JSON model and generate plots based on the order.
 *
 */

define([
    'underscore',
    'core/manager',
    'core/extension',
    'core/stl',
    'utils/dataframe'
],function(_, Manager, Extension, STL, Dataframe){
    function parse(model, element_name){
        var element = d3.select(element_name);

        if(typeof model['extension'] !== "undefined"){
            if(_.isArray(model['extension'])){
                _.each(model['extension'], function(ex){
                    Extension.load(ex);
                });
            }else{
                Extension.load(model['extension']);
            }
        }

        parse_model(model, element);
    }

    function parse_model(model, element){
        _.each(model.data, function(value, name){
            Manager.addData(name, new Dataframe(name, value));
        });

        _.each(model.panes, function(pane_model){
            var pane;

            var pane_proto, axis, scale;
            if(typeof pane_model['extension'] !== "undefined"){
                var ext = Extension.get(pane_model['extension']);
                pane_proto = ext.pane;
                axis = ext.axis;
                scale = ext.scale;
            }else{
                pane_proto = STL.pane;
                axis = STL.axis;
                scale = STL.scale;
            }
            pane = new pane_proto(element, scale, axis, pane_model.options);

            var data_list = [];
            _.each(pane_model.diagrams, function(diagram){
                pane.addDiagram(diagram.type, diagram.data, diagram.options || {});
                data_list.push(diagram.data);
            });

            if(pane_model['filter'] !== undefined){
                var filter = pane_model.filter;
                pane.addFilter(filter.type, filter.options || {});
            }

            Manager.addPane({pane:pane, data: data_list, uuid:pane.uuid});
            Manager.update(pane.uuid);
        });
    };

    return parse;
});
