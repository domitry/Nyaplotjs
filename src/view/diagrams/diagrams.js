define(function(require, exports, module){
    diagrams = {};

    diagrams.bar = require('view/diagrams/bar');
    diagrams.histogram = require('view/diagrams/histogram');

    return diagrams;
});
