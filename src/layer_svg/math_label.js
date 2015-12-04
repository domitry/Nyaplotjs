define([
    'utils/parser_tools',
    'utils/args2arr'
], function(t, args2arr){
    return [
        "mathlabel",
        ["text"],
        {
            dx: 0,
            dy: 0,
            width: 80,
            height: 100,
            x_align: "left",
            y_align: "top",
            color: "#323232",
            rotate: 0,
            margin: {left: 10, right: 10, top: 10, bottom: 10}
        },
        t.auto_append(
            "foreignObject",
            function(fo, str, options){
                fo
                    .attr({
                        "transform": "rotate(" + options.rotate + ")",
                        "position": "absolute"
                    })
                    .text(str);
                
                /*
                var rect = fo.node().getBoundingClientRect();
                this.width = rect.width;
                this.height = rect.height;

                var jax = MathJax.Hub.getAllJax(fo.node())[0];
                MathJax.Hub.queue.Push(["Text"]);
                 */

                return fo.attr({
                    width: options.width,
                    height: options.height
                });
            }
        )
    ];
});
