define([
    'underscore',
    'core/manager',
    'view/pane'
],function(_, Manager, Pane){
    function parse(models, element_name){
	element = d3.select(element_name);

	_.each(models.data, function(value, name){
	    Manager.addData(name, value);
	});

	_.each(models.panes, function(value){
	    var pane = new Pane(element, value.options);
	    _.each(value.diagrams, function(diagram){
	    	pane.add(diagram.type, diagram.data, diagram.options);
	    });
	    Manager.addPane(pane);
	});
    }

    return parse;
});
