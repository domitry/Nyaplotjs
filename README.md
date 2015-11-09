Nyaplotjs
=======

[![Documentation Status](https://readthedocs.org/projects/nyaplotjs/badge/?version=latest)](http://nyaplotjs.readthedocs.org/en/latest/?badge=latest)
[![npm version](https://badge.fury.io/js/nyaplot.svg)](https://badge.fury.io/js/nyaplot)

![alt text](https://dl.dropboxusercontent.com/u/47978121/gsoc/nya_top.png)

Nyaplotjs is a back-end library for [Nyaplot](https://github.com/domitry/nyaplot). Its goal is to allow Ruby and other language users to create interactive plots in their favorite styles. Nyaplotjs provides useful interface to generate plots based on JSON object.

This software has been developed as a product in Google Summer of Code 2014 (GSoC2014). Please visit a website of [SciRuby project](http://sciruby.com/blog/) to see the progress of this project.

Nyaplotjs and Nyaplot will be merged into one library before the end of GSoC 2014 term. 

## Demos
* [Interactive 3-pane plot](http://www.domitry.com/gsoc/multi_pane2.html)
* [Bar](http://bl.ocks.org/domitry/2f53781449025f772676)
* [Histogram](http://bl.ocks.org/domitry/f0e3f5c91cb83d8d715e)
* [Scatter](http://bl.ocks.org/domitry/308e27d8d12c1374e61f)
* [Line](http://bl.ocks.org/domitry/e9a914b78f3a576ed3bb)
* [Venn](http://bl.ocks.org/domitry/d70dff56885218c7ad9a)
* [Histogram in another theme](http://bl.ocks.org/domitry/f215d5ff3bd3f5fec2ad)

## How to use
### General use
First, prepare an array as a data source.

```javascript
var data = [{name:'type1',val:48}, {name:'type2',val:20}, {name:'type3',val:4}, {name:'type4',val:12}, {name:'type5',val:22}];
```

Next create plot. 

```javascript
var models = {data:data},panes: [{diagrams:[{type: 'bar', data: 'data1', options: {x:'name', y:'val1'}}],options:{width:500, height:500, xrange: ['type1','type2','type3','type4','type5'], yrange: [0,50]}}]};
```

Then load models into Nyaplotjs and it will begin to parse them and generate plot.

```javascript
Nyaplot.core.parse(models, '#vis');
```

Click [here](http://bl.ocks.org/domitry/2f53781449025f772676) to see the result.

### Interactivity among panes
In order to enable this types of interactivity, you do not have to add any special attributes or lines. Creating multiple diagrams from one data source is enough.

This data includes 2 columns and one is for Histogram and the other is for Bar chart. 

```javascript
var mutation_types = ['c->a', 'g->a', 't->a'];
var values = d3.range(100).map(function(val){return {val1: d3.random.bates(10)(val), mutation_type: (val>50? mutation_types[0] : mutation_types[1])};});
```

Then create 2 diagrams from one data source.

```javascript
var model1 = {data:{data1: values},panes: [{diagrams:[{type: 'histogram', data: 'data1', options: {value:'val1'}}], options:{xrange: [0,1], yrange: [0,30]}}]};
var model2 = {data:{},panes:[{diagrams:[{type:'bar', data: 'data1', options: {value:'mutation_type'}}],options:{xrange:['c->a', 'g->a', 't->a'], yrange: [0,100]}]};
```

If you want to filter data based on values mapped into x axis, add 'filter' attribute to 'options' in a pane.

```javascript
var model1 = {data:{data1: values},panes: [{diagrams:[{type: 'histogram', data: 'data1', options: {value:'val1'}}], filter: {target: 'x'}, options:{xrange: [0,1], yrange: [0,30]}}]};
```

Click [here](http://www.domitry.com/gsoc/multi_pane2.html) to see the result.

## Building
You need to install npm before building Nyaplotjs.

```shell:
cd Nyaplotjs
npm install
grunt release
```

## Dependency
* d3.js version 3.4.4 or up

## License
Copyright (C) 2014 by Naoki Nishida  
This version of Nyaplotjs is licensed under the MIT license.
