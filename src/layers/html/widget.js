define([
    'underscore',
    'd3',
    'utils/icons',
    'utils/svg2uri'
], function(_, d3, icons, svg2uri){
    return [
        "widget",
        [],
        {},
        function(div, options){
            div.style({
                height: 50
            });

            var p = div.append("div")
                .style({
                    height: 32,
                    width: "100%",
                    "border-bottom": "solid 2px #aaa"
                });

            p.append("div")
                .attr("title", "This plot was created with Nyaplot")
                .style({
                    width: 32,
                    height: 32,
                    float: "left",
                    "background-image": "url(" + icons.cat + ")"
                })
                .on("click", function(){
                    window.open("http://www.github.com/domitry/nyaplot");
                });

            p.append("div").style("height", 10);

            var a = p.append("a")
                    .style({
                        width: 20,
                        height: 20
                    });
            
            a.append("div")
                .style({
                    width: 20,
                    height: 20,
                    "background-image": "url(" + icons.save + ")",
                    float: "right"
                });

            // these lines should be fixed
            window.setTimeout(
                function(){
                    svg2uri(d3.select("svg"))
                        .then(function(uri){
                            a.attr({
                                download: "plot.png",
                                href: uri
                            });
                        });
                }, 100);

            return div;
        }
    ];
});
