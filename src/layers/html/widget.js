define([
    'underscore',
    'd3',
    'utils/svg_utils',
    'icons/cat.svg',
    'icons/save.svg'
], function(_, d3, svg_utils, cat_svg, save_svg){
    return [
        "widget",
        [],
        {
            fname: "plot.png",
            svg: {}
        },
        function(div, options){
            div.style({
                height: 30
            });

            var p = div.append("div")
                .style({
                    height: 23,
                    width: "100%"
                });

            _.each([
                {file: save_svg, link: undefined, title: "save as png", id: "save"},
                {file: cat_svg, link: "https://github.com/domitry/nyaplot", title: "created with nyaplot", id: "logo"}
            ], function(info){
                p
                    .append("a")
                    .attr("href", info.link)
                    .attr("title", info.title)
                    .attr("id", info.id)
                    .style({width: 20, height: 20})
                    .append("div")
                    .style({
                        float: "right",
                        margin: "0 0 10 10"
                    })
                    .node().appendChild(svg_utils.loadSVG(info.file));
            });

            (function(){
                function addEffect(a, svg){
                    a.on("mouseover", function(){
                        svg.selectAll("rect, path").style("fill", "#111111");
                    }).on("mouseout", function(){
                        svg.selectAll("rect, path").style("fill", "#cdcdcd");
                    });
                }

                p.selectAll("a").each(function(){
                    var a = d3.select(this);
                    addEffect(a, a.select("svg"));
                });
            })();

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
