/*
 * parse JSON model and generate plots based on the order.
 *
 */

define([
    'underscore',
    'core/manager',
    'core/extension',
    'view/pane',
    'utils/dataframe'
],function(_, Manager, Extension, Pane, Dataframe){
    function parse(model, element_name){
        var element = d3.select(element_name);

        if(typeof model['extension'] !== undefined){
            Extension.load(model['extension']);
        }

        parse_model(model, element);
    }

    function parse_model(model, element){
        _.each(model.data, function(value, name){
            Manager.addData(name, new Dataframe(name, value));
            Manager.update();
        });

        _.each(model.panes, function(pane_model){
            var pane;

            // if this pane is depend on extension having its own pane
            if(typeof pane_model['extension'] !== undefined){
                var pane_proto = Extension.pane(pane_model['extension']);
                pane = new pane_proto(element, pane_model.options);
            }
            else{
                pane = new Pane(element, pane_model.options);
            }
            var data_list = [];

            _.each(pane_model.diagrams, function(diagram){
                pane.addDiagram(diagram.type, diagram.data, diagram.options || {});
                data_list.push(diagram.data);
            });

            if(pane_model['filter'] !== undefined){
                var filter = pane_model.filter;
                pane.addFilter(filter.type, filter.options || {});
            }

            Manager.addPane({pane:pane, data: data_list});
        });
    };

    return parse;
});
