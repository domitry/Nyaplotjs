define([
    'underscore',
    'core/manager',
    'view/pane',
    'utils/dataframe'
],function(_, Manager, Pane, Dataframe){
    function parse(model, element_name){

	element = d3.select(element_name);

	_.each(model.data, function(value, name){
	    Manager.addData(name, new Dataframe(name, value));
	});

	_.each(model.panes, function(pane_model){
	    var pane = new Pane(element, pane_model.options);
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
    }

    return parse;
});
