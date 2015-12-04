define([
    'underscore',
    'd3'
], function(_, d3){
    return function(svg){
        var origSvgNode = svg.node();
        var rect = svg.node().getBoundingClientRect();
        var width = rect.width;
        var height = rect.height;

        var svgNode = origSvgNode.cloneNode(true);
        d3.select(svgNode).attr({
            version: '1.1',
            xmlns: 'http://www.w3.org/2000/svg',
            'xmlns:xlink': 'http://www.w3.org/1999/xlink',
            width: width,
            height: height
        });
        
        var base64SvgText = window
                .btoa(encodeURIComponent(svgNode.outerHTML)
                      .replace(/%([0-9A-F]{2})/g, function (match, p1) {
                          return String.fromCharCode('0x' + p1);
                      }));
        
        return (function(svgData, width, height){
            var src = 'data:image/svg+xml;charset=utf-8;base64,' + svgData;
            var canvas = document.createElement('canvas');
            var context = canvas.getContext('2d');
            var image = new window.Image();
            
            canvas.width = width;
            canvas.height = height;

            return new Promise(function(resolve, reject){
                image.onload = function () {
                    context.drawImage(image, 0, 0);
                    resolve(canvas.toDataURL('image/png'));
                };
                image.src = src;
            });
        })(
            base64SvgText,
            width,
            height
        );
    };
});
