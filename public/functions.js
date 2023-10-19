var acrDefault;
var arcOver;
var lock = 0;
// https://gist.github.com/wrobstory/7612013
var d3tooltip = function (accessor) {
    return function (selection) {
        var d3tooltipDiv;
        var body = d3.select('body').node();
        selection.on("mouseover", function (d, i) {
            d3.select('body').selectAll('div.d3tooltip').remove();
            d3tooltipDiv = d3.select('body').append('div').attr('class', 'd3tooltip');
            var coords = d3.mouse(body);
            d3tooltipDiv.style('left', (coords[0] + 10) + 'px')
                .style('top', (coords[1] - 15) + 'px')
                .style('position', 'absolute')
                .style('z-index', 1001);
            // var d3tooltipText = accessor(d, i) || '';
            // d3tooltipDiv.style('width', function (d, i) { return (d3tooltipText.length > 80) ? '300px' : null; })
            //     .html(d3tooltipText);
        })
            .on('mousemove', function (d, i) {
                var coords = d3.mouse(body);
                d3tooltipDiv.style('left', (coords[0] + 10) + 'px')
                    .style('top', (coords[1] - 15) + 'px');
                var d3tooltipText = accessor(d, i) || '';
                if (d3tooltipText.length) {
                    d3tooltipDiv.html(d3tooltipText);
                }
            })
            .on("mouseout", function (d, i) {
                d3tooltipDiv.remove();
            });
    };
};
// kashesandr : http://stackoverflow.com/questions/10692100/invoke-a-callback-at-the-end-of-a-transition
function endall(transition, callback) {
    if (transition.size() === 0) { callback() }
    var n = 0;
    transition
        .each(function () { ++n; })
        .each("end", function () { if (!--n) callback.apply(this, arguments); });
}
function city_colored_circles_hover(age, rad) {
    //this.prevRadius = d3.select(this).attr("r");
    d3.selectAll('.age' + age)
        //.attr("r", r1)
        .transition()
        .ease('elastic')
        .duration(500)
        .attr("r", rad);
}
function ImageExist(url) {
    var img = new Image();
    img.src = url;
    return img.height != 0;
}
function kmeans() {
    var avgXY, distance, normalPt, randomCenter;

    normalPt = function (normalFun) {
        var val;
        val = normalFun();
        if (val > 0 && val < 100) {
            return val;
        } else {
            return normalPt(normalFun);
        }
    };

    randomCenter = function () {
        return (Math.random() * 90) + 5;
    };

    distance = function (a, b) {
        return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));
    };

    avgXY = function (arr) {
        return [
            d3.sum(arr, function (d) {
                return d[0];
            }) / arr.length, d3.sum(arr, function (d) {
                return d[1];
            }) / arr.length
        ];
    };

    $(document).on('page:load', function () {
        var centroidsGroup, colors, height, pointsGroup, svg, voronoi, voronoiGroup, width, x, y;
        if (!$('#kmeans-vis').length) {
            return;
        }
        colors = d3.scale.category10();
        width = $('.container').width();
        if (width > 600) {
            width = 600;
        }
        height = width;
        svg = d3.select('#nmeans-vis').append('svg').attr('width', width).attr('height', height);
        pointsGroup = svg.append('g').attr('id', 'points');
        centroidsGroup = svg.append('g').attr('id', 'centroids');
        voronoiGroup = svg.append('g').attr('id', 'voronoi');
        x = d3.scale.linear().range([0, width]).domain([0, 100]);
        y = d3.scale.linear().range([height, 0]).domain([0, 100]);
        voronoi = d3.geom.voronoi().x(function (d) {
            return x(d[0]);
        }).y(function (d) {
            return y(d[1]);
        });
        window.initProblem = function () {
            var i, j, kNdx, l, ptNdx, ref, ref1, ref2, xNorm, yNorm;
            window.points = [];
            window.centroids = [];
            window.k = parseInt($('#k-val').val());
            window.n = parseInt($('#n-val').val());
            for (kNdx = i = 1, ref = k; 1 <= ref ? i <= ref : i >= ref; kNdx = 1 <= ref ? ++i : --i) {
                xNorm = d3.random.normal(randomCenter(), 12);
                yNorm = d3.random.normal(randomCenter(), 12);
                for (ptNdx = j = 1, ref1 = n / k; 1 <= ref1 ? j <= ref1 : j >= ref1; ptNdx = 1 <= ref1 ? ++j : --j) {
                    points.push([normalPt(xNorm), normalPt(yNorm)]);
                }
            }
            for (kNdx = l = 1, ref2 = k; 1 <= ref2 ? l <= ref2 : l >= ref2; kNdx = 1 <= ref2 ? ++l : --l) {
                centroids.push([randomCenter(), randomCenter()]);
            }
            voronoiGroup.selectAll('*').remove();
            centroidsGroup.selectAll('*').remove();
            pointsGroup.selectAll('*').remove();
            centroidsGroup.selectAll('circle').data(centroids).enter().append('circle').style('fill', function (d, ndx) {
                return colors(ndx);
            }).attr('cx', function (d) {
                return x(d[0]);
            }).attr('cy', function (d) {
                return y(d[1]);
            }).attr('r', 4.5);
            return pointsGroup.selectAll('circle').data(points).enter().append('circle').attr('cx', function (d) {
                return x(d[0]);
            }).attr('cy', function (d) {
                return y(d[1]);
            }).attr('r', 1.5);
        };
        return window.step = function () {
            var bin, binNdx, centroid, centroidBins, centroidNdx, d, i, j, l, len, len1, len2, m, minDist, minNdx, newCentroid, point, results;
            voronoiGroup.selectAll('*').remove();
            voronoiGroup.selectAll('path').data(voronoi(centroids)).enter().append('path').style('fill', function (d, ndx) {
                return colors(ndx);
            }).attr('d', function (d) {
                return "M" + (d.join('L')) + "Z";
            });
            centroidBins = (function () {
                results = [];
                for (var i = 1; 1 <= k ? i <= k : i >= k; 1 <= k ? i++ : i--) { results.push(i); }
                return results;
            }).apply(this).map(function (d) {
                return [];
            });
            for (j = 0, len = points.length; j < len; j++) {
                point = points[j];
                minDist = 100;
                for (centroidNdx = l = 0, len1 = centroids.length; l < len1; centroidNdx = ++l) {
                    centroid = centroids[centroidNdx];
                    if ((d = distance(point, centroid)) < minDist) {
                        minDist = d;
                        minNdx = centroidNdx;
                    }
                }
                centroidBins[minNdx].push(point);
            }
            for (binNdx = m = 0, len2 = centroidBins.length; m < len2; binNdx = ++m) {
                bin = centroidBins[binNdx];
                newCentroid = avgXY(bin);
                centroids[binNdx] = newCentroid;
            }
            return centroidsGroup.selectAll('circle').data(centroids).transition().attr('cx', function (d) {
                return x(d[0]);
            }).attr('cy', function (d) {
                return y(d[1]);
            });
        };
    });

    initProblem();
}
function osm_layer_put(where, projection_path, jsonfile, svgclass) {
    d3.json(jsonfile, function (data) {
        where
            .selectAll('.' + svgclass)
            .data(data.features)
            .enter().append('path')
            .attr('class', svgclass)
            .attr('d', projection_path)
            .call(d3tooltip(
                function (d, i) {
                    return d.properties["NAME"];
                }
            ))
            ;
    });
}
function tiles_load(where, tilesobject) {

    // var prov =  "tile.opentopomap.org";
    var prov = "c.tile.opentopomap.org";


    where.append("g")
        .attr("clip-path", "url(#clip)")
        .selectAll("image")
        .data(tilesobject)
        .enter().append("image")
        // .attr("xlink:href", function(d) { return "http://" + ["a", "b", "c", "d"][Math.random() * 4 | 0] + "." + prov + "/" + d[2] + "/" + d[0] + "/" + d[1] + ".png"; })
        .attr("xlink:href", function (d) {
            return "http://" + prov + "/" + d[2] + "/" + d[0] + "/" + d[1] + ".png";
            //return "http://" + ["a", "b", "c"][Math.random() * 3 | 0] + "." + prov + "/" + d[2] + "/" + d[0] + "/" + d[1] + ".png"; // for external web tiles

        })
        .attr("width", Math.round(tilesobject.scale))
        .attr("height", Math.round(tilesobject.scale))
        .attr("x", function (d) { return Math.round((d[0] + tilesobject.translate[0]) * tilesobject.scale); })
        .attr("y", function (d) { return Math.round((d[1] + tilesobject.translate[1]) * tilesobject.scale); });


    where.append("use")
        .attr("xlink:href", "#land")
        .attr("class", "stroke");
}
function push2objlist(object_node, name, date, color, delay, num) {

    var par = object_node
        .insert('xhtml:div', ":first-child")
        .classed("row", true)
        .style("opacity", 1.0)
        // .style("background-color",  function () { return num % 2 ? "lightyellow" : "#FFCC11"} )
        .style("background-color", color)
        .html('<div class="left">' + name + '</div><div class="right">' + date + '</div>')
        .style("font-weight", "bold")
        .transition()
        .delay(4000)
        // .duration(3000)
        // .ease('quad')
        .style("font-weight", "normal")
        // ;
        // par
        .transition()
        .delay(delay)
        // .duration(5000)
        .duration(1000)
        // .style("opacity",0.0) // there is some bug in here!!!
        .style("color", color)
        // .style("background-color",color)
        // .transition()
        // .delay(1000)
        // .duration(100)
        .remove();
}
function city_put(svg, projection, city, number, object_node, citydot_radius, mustache_template, quick_mode) {
    var size = 25;
    var begin_size = size * 2.5;

    // var city_put_cur = 0
    // var city_2rem = 0
    // extern vars
    // if (city_put_cur > 9 ){
    // var objcity_city_2rem = d3.select("#objcity"+city_2rem++)
    // if (objcity_city_2rem){
    // objcity_city_2rem
    // .style("opacity",1)
    // .transition()
    // .duration(5000)
    // .ease('exp-in-out')
    // .style("opacity",0)
    // .remove();
    // }
    // }

    var name = city.histname_be || city.name_be;
    // bar_city.text(name);


    var citydgroup = svg.append('g').attr("id", "citydgroup");
    var new_g = citydgroup.append('g');

    var imgpath = server_url + "coat/" + city.place_id + city.ext;

    var hname = city.histname_be ? (city.histname_be + " (" + city.name_be + ")") : city.name_be;

    console.log(ImageExist(imgpath) ? "yes" : imgpath);



    new_g.call(d3tooltip(
        function (d, i) {

            var render = Mustache.render(mustache_template,
                {
                    uri: server_url,
                    img: city.place_id + city.ext,
                    name: L(hname),
                    text_est: l8n('estd'),
                    text_status: l8n('sttus'),
                    text_ppshn: l8n('ppshn'),
                    yrdot: l8n('yrdot'),
                    text_1k: l8n('thsnd'),
                    est_date: city.est_date,
                    magd_date: city.magd_date,
                    pop: city.pop,
                    estflag: old_ages_flags[get_old_age(city.est_date)],
                    magdflag: old_ages_flags[get_old_age(city.magd_date)]
                });
            return render;
        }
    ));
    if (!quick_mode) {
        push2objlist(object_node, name, city.est_date, op_color, 5000, number);
        var city_x1 = projection([city.lon, city.lat])[0] - (begin_size / 2);
        var city_y1 = projection([city.lon, city.lat])[1] - (begin_size / 2);
        var city_x2 = projection([city.lon, city.lat])[0] - (size / 2);
        var city_y2 = projection([city.lon, city.lat])[1] - (size / 2);
        new_g.append('svg:image')
            .attr("class", "tower")
            .attr("xlink:href", "mdbg.svg")
            .attr("x", city_x1)
            .attr("y", city_y1)
            .attr("width", begin_size)
            .attr("height", begin_size)
            .transition()
            .duration(3000)
            .attr("x", city_x2)
            .attr("y", city_y2)
            .attr("width", size)
            .attr("height", size)
            // .each("start", function(d){++status;})
            // .each("end", function(d){--status;})
            ;


        new_g.append('text')
            .attr("class", "citynames unselectable")
            .text(name)
            .attr("x", projection([city.lon, city.lat])[0])
            .attr("y", projection([city.lon, city.lat])[1] + (size))
            ;
    }

    new_g.append("circle")
        .style('opacity', 0)
        .style('fill', function (d) {
            return old_ages_colors[get_old_age(city.est_date)];
        })
        .attr("class", function (d) {
            return "citydot age" + get_old_age(city.est_date);
        })
        .attr("cx", projection([city.lon, city.lat])[0])
        .attr("cy", projection([city.lon, city.lat])[1])
        .attr("r", citydot_radius)
        .on("mouseover", function (d) {
            var cellplate = d3.select('.cellplate' + get_old_age(city.est_date));
            cellplate.attr("stroke-width", 4);
            city_colored_circles_hover(get_old_age(city.est_date), citydot_radius * 2);
        })
        .on("mouseout", function (d) {
            var cellplate = d3.select('.cellplate' + get_old_age(city.est_date));
            cellplate.attr("stroke-width", 1);
            city_colored_circles_hover(get_old_age(city.est_date), citydot_radius);
        })
        ;;

}
function make_treemap(data, placeholder, citydot_radius) {
    var bleed = 10;
    var layout_tree = d3.layout.treemap()
        .size([300, 300 + bleed * 2])
        .padding(20)
        .value(function (d) { return d.values; })
        .sticky(true);


    // console.log(JSON.stringify(data));

    // var color = d3.scale.category20c();

    // var treemap = d3.layout.treemap()
    // .size([500,500])
    // // .sort(function(a,b) { return a.data[dim] - b.data[dim] })
    // // .value(function(d) { return d.data[dim] })
    // .children(function(d) { return d.children })

    // var nodes = treemap.nodes(data)

    // var svg = d3.select("svg");
    // var gs = svg.selectAll("g.cell")
    // .data(nodes)
    // .enter()
    // .append("g").classed("cell",true);
    // gs.append("rect")
    // .attr({
    // x: function(d) { return 70 + d.x },
    // y: function(d) { return 70 + d.y },
    // width: function(d) { return d.dx },
    // height: function(d) { return d.dy},
    // title: "meme" 
    // })
    // .style({
    // opacity: function(d) { return !!d.parent},
    // fill: function(d) { if(d.parent) return color(d.data.id) }
    // })

    // //$('rect').tipsy({gravity: 'sw'})

    // var nested = d3.nest()
    // .key(function(d) { return d.data.id})
    // .rollup(function(d) { return d.data.ups })
    // .map(data)
    // console.log("nested", nested)


    // console.log(treemappack.nodes({children: data}).filter(function(d) { return !d.children; }));
    // console.log(treemappack.nodes(data).filter(function(d) { return !d.children; }));
    // console.log(JSON.stringify(data));

    var root = placeholder.append("g")
        .classed("sq", true)
        .attr("transform", "translate(70,100)");

    var cell = root
        .selectAll(".cell")
        // .data(d3.entries(data))
        // nodes.shift();
        .data(layout_tree.nodes({ children: data }).filter(function (d) { return !d.children; }))
        .enter()
        .append("g")
        .classed("cell", true)
        .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });

    cell.append("svg:rect")
        .attr("class", function (d) { return "cellplate" + d.key; })
        .attr("width", function (d) { return d.dx; })
        .attr("height", function (d) { return d.dy; })

        .on("mouseover", function (d) {
            var that = d3.select(this);
            this.prevStrokeW = that.attr("stroke-width");
            that.attr("stroke-width", 4);
            // this.prevStFill = that.style("fill");
            // that.style('fill', 'lightyellow');
            city_colored_circles_hover(d.key, citydot_radius * 2);
        })
        .on("mouseout", function (d) {
            // d3.select(this).style('fill', this.prevStFill);
            d3.select(this).attr("stroke-width", this.prevStrokeW);
            city_colored_circles_hover(d.key, citydot_radius);
        })
        .style("fill", "white")
        .transition()
        .duration(2000)
        .ease('cubic')
        .style("fill", function (d) {
            return old_ages_colors[d.key]
        })
        ;;;




    var insertLinebreaks = function (d) {
        var el = d3.select(this);
        var words = d.title.split(' ');
        el.text('');


        var bbox = this.getBBox(), cbbox = this.parentNode.getBBox(), scale = Math.min(cbbox.width / bbox.width, cbbox.height / bbox.height);
        // console.log(d.title);
        // //console.log(me.style("font-size"));
        // console.log("this", bbox, "parent", cbbox);
        // console.log("CTL1:" + this.getComputedTextLength());
        // console.log('------------------------------------------------------')

        var dx = '1px';
        var dy = '19px';

        for (var i = 0; i < words.length; i++) {
            var tspan = el.append('tspan').text(words[i]);
            if (i > 0)
                tspan
                    .attr('x', 0)
                    .attr('dy', cbbox.height / (words.length)) // should be related to line height
                    .attr('dx', dx);
            else
                tspan
                    .attr('x', 0)
                    .attr('y', 2)
                    .attr('dy', cbbox.height / (words.length + 1) + 'px') //30
                    .attr('dx', dx);
        }

        var me = d3.select(this);



        // var bbox = this.getBBox(), cbbox = this.parentNode.getBBox(), scale = Math.min(cbbox.width/bbox.width, cbbox.height/bbox.height);
        // // console.log(d.title);
        // //console.log(me.style("font-size"));
        // console.log("this", bbox, "parent", cbbox);
        // console.log(this.getComputedTextLength());
        var ff = 72;
        me.style("font-size", ff + "px");
        // console.log("comptext" + this.getComputedTextLength());
        // console.log("bboxw" + this.parentNode.getBBox().width);
        // console.log("scale" +scale);
        // console.log("parent width" +d3.select(this.parentNode).styl("height"));
        // console.log("this width" +d3.select(this).attr("height"));
        // console.log("CTL2:" + this.getComputedTextLength());
        while ((this.getBBox().width + 2) > cbbox.width) {
            // console.log("while");
            me.style("font-size", --ff + "px");

        }
        // me.style("font-size", ++ff + "px");
        // console.log("CTL + box width +  font:", this.getComputedTextLength(), this.getBBox().width, ff);
        // me.style("font-size", ff*1.4 + "px");
        // me.style("line-height", ff*scale + "px");


    };

    function wrap(text, width) {
        text.each(function () {
            var text = d3.select(this),
                words = text.text().split(/\s+/).reverse(),
                word,
                line = [],
                lineNumber = 0,
                lineHeight = 1.1, // ems
                y = text.attr("y"),
                dy = parseFloat(text.attr("dy")),
                tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(" "));
                if (tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                }
            }
        });
    }


    function fontSize(d, i) {
        var size = d.dx / 5;
        var words = d.title.split(' ');
        var word = words[0];
        var width = d.dx;
        var height = d.dy;
        var length = 0;
        d3.select(this).style("font-size", size + "px").text(word);
        while (((this.getBBox().width >= width) || (this.getBBox().height >= height)) && (size > 12)) {
            size--;
            d3.select(this).style("font-size", size + "px");
            this.firstChild.data = word;
        }
    }



    function getSize(d) {
        var bbox = this.getBBox(),
            cbbox = this.parentNode.getBBox(),
            scale = Math.min(cbbox.width / bbox.width, cbbox.height / bbox.height);
        // console.log(d.title, "this", bbox, "parent", cbbox);
        d.scale = scale;
        d3.select(this).style("font-size", (scale * 10) + "px");

        // (bbox.width, 

    }

    text = cell.append("svg:text")
        // .attr("x",0)
        // .attr("dx", "0.35em")
        //.attr("dy", "0.9em")
        .classed("unselectable wrap", true)
        // .attr("text-anchor", "middle")
        // .text (function(d){ return d.title})
        .each(insertLinebreaks)
        // .style("font-size", "1px")
        //.each(getSize)
        // .style("font-size", function(d) { return (d.scale *10) + "px"; });
        // .each(fontSize)
        // .each(wordWrap)
        ;
    // d3.selectAll('.wrap')
    // .each(insertLinebreaks);

}
function bubble(data, placeholder) {
    // console.log(layout_pack.nodes({children: data}).filter(function(d) { return !d.children; }));
    placeholder.selectAll(".node").remove();

    var bleed = 10,
        bub_width = 360,
        bub_height = 480;

    var layout_pack = d3.layout.pack()
        .sort(function (a, b) { return d3.descending(a.values, b.values); })
        .size([bub_width, bub_height + bleed * 2])
        .padding(20)
        .value(function (d) { return d.values; });

    // var root = placeholder.append("g")
    // .classed("bubble", true);
    // .attr("transform", "translate(70,100)");
    var node = placeholder
        .selectAll(".node")
        .data(layout_pack.nodes({ children: data }).filter(function (d) { return !d.children; }))
        .enter()
        .append("g")
        // .attr("class", "node")
        .attr("class", function (d) { return "node group" + d.group; })
        .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; })
        .call(d3tooltip( //!!
            function (d, i) {
                d3.select('.d3tooltip').style("background-color", d.color);
                // return  '<div style="min-height:100%; height:100%;font-weight:bold;background-color:' + d.color + '">' + d.key + "&nbsp;&nbsp;&nbsp;" + d.values + '</div>';
                return '<div style="font-weight:bold;color:' + d.textcolor + ';">' + d.key + (d.mark ? (" " + l8n('oth')) : "&nbsp;&nbsp;&nbsp;" + d.values) + '</div>';
            }
        ))
        ;




    node.append("circle")
        .style("fill", function (d) { return d.color; })
        .attr("r", function (d) { return d.r; })
        .attr("class", function (d) { return "bubble"; })

        .on("mouseover", function (d) {
            // d3.select(this).transition()
            // .duration(1000)
            // .attr("d", arcOver);
            d3.selectAll('.dots').filter("*:not(.group" + d.group + ")").style('opacity', 0);
            d3.selectAll('.node').filter("*:not(.group" + d.group + ")").style('opacity', 0.2);
        }).on("mouseout", function (d) {
            d3.selectAll('.dots').filter("*:not(.group" + d.group + ")").style('opacity', 1);
            d3.selectAll('.node').filter("*:not(.group" + d.group + ")").style('opacity', 1);
            // d3.select(this).transition()
            // .duration(1000)
            // .attr("d", pied_arc);
            // d3.selectAll('.citydot').style('opacity', 1);
        });

    // console.log(data.length);
    // if(data.length == 1){
    // console.log("here");
    // d3.selectAll('.bubble').attr("r", 50);
    // }

    node.append("text")
        .text(function (d) { return (d.mark ? "+" : "") + d.key; })
        .style("font-size", function (d) { return Math.min(2 * d.r, (2 * d.r - 8) / this.getComputedTextLength() * 24) + "px"; })
        .attr("fill", function (d) { return d.textcolor; })
        .style("opacity", 0.54)
        // .attr("stroke-width", "1px")
        // .attr("stroke", "black")
        .attr("dy", ".35em");

    //d3.select(self.frameElement).style("height", height + "px");
}
function colored_cities(data, placeholder, citydot_radius) {

    var data2 = d3.nest()
        .key(function (d) {
            return get_old_age(d.est_date);
        })
        .rollup(function (d) { return d3.sum(d, function (g) { return 1; }); })
        .entries(data);

    data2.forEach(function (d) {
        d.title = l8n(old_ages_names[d.key]);
        if (d.title === "ВКЛ") d.title = "Вялікае Княства Літоўскае Рускае Жамойцкае";
    });

    // bubble(data2, placeholder);
    make_treemap(data2, placeholder, citydot_radius);
}
function cities_after_timer(data, mapholder, placeholder, citydot_radius) {
    // console.log("there");
    mapholder.selectAll(".citydot").style('opacity', 1);

    mapholder.selectAll(".tower")
        .transition()
        .duration(5000)
        .ease('exp-in-out')
        .style("opacity", 0)
        .remove();

    d3.select("#forobj")
        .transition()
        .duration(5000)
        .ease('exp-in-out')
        .style("opacity", 0)
        .remove();

    d3.selectAll(".citynames")
        .attr("dy", "-1em");

    colored_cities(data, placeholder, citydot_radius);

    // console.log("wow");
}
function do_pie(data, spot) {
    // Store our chart dimensions
    var pie_innerRadius = 10, pie_outerRadius = 120, pie_labelRadius = 130;


    var layer = spot.append("g").attr('id', 'pielayer');


    art = layer.append("g")
        .attr("transform", function (d, i) { return "translate(150,200)"; })
        .attr('class', 'art');

    labels = layer.append("g")
        .attr("transform", function (d, i) { return "translate(150,200)"; })
        .attr('class', 'labels');

    jhw_pie = d3.layout.pie()
        .value(function (d, i) { return d.values; });

    pied_data = jhw_pie(data);

    acrDefault = d3.svg.arc()
        .innerRadius(pie_innerRadius)
        .outerRadius(pie_outerRadius);

    var arcZer = d3.svg.arc()
        .innerRadius(pie_innerRadius)
        .outerRadius(1);

    arcOver = d3.svg.arc()
        .innerRadius(pie_innerRadius)
        .outerRadius(pie_outerRadius + 20);


    // Let's start drawing the arcs.
    art.selectAll(".wedge")
        .data(pied_data)
        .enter()
        .append("path")
        .style("fill", "#E7E7E7")
        .attr("class", "wedge")
        .attr("id", function (d, i) { return "arc" + d.data.key; })
        .attr("d", arcZer)
        .on("mouseover", function (d) {
            if (!lock) {
                d3.select(this).transition()
                    .duration(1000)
                    .attr("d", arcOver);
                d3.selectAll('.citydot').filter("*:not(.age" + d.data.key + ")").style('opacity', 0);
            }
        })
        .on("mouseout", function (d) {
            if (!lock) {
                d3.select(this).transition()
                    .duration(1000)
                    .attr("d", acrDefault);
                d3.selectAll('.citydot').style('opacity', 1);
            }
        })
        .on("click", function (d) {
            if (lock) {
                lock = 0;
                d3.selectAll('.wedge').filter("*:not(#arc" + d.data.key + ")")
                    .classed('pass', false)
                    .style('opacity', 1);
                d3.selectAll('.citydot').filter("*:not(.age" + d.data.key + ")")
                    .classed('pass', false)
                    .style('opacity', 1);
                d3.selectAll('.label').filter("*:not(#lbl" + d.data.key + ")").style('opacity', 1);

            } else {
                lock = 1;
                d3.selectAll('.wedge').filter("*:not(#arc" + d.data.key + ")")
                    .classed('pass', true)
                    .style('opacity', 0.25);
                d3.selectAll('.citydot').filter("*:not(.age" + d.data.key + ")")
                    .classed('pass', true)
                    .style('opacity', 0);
                d3.selectAll('.label').filter("*:not(#lbl" + d.data.key + ")").style('opacity', 0.25);
            }
        })
        .attr("stroke-width", 0)
        .attr("stroke", "lightyellow")

        .transition()
        // .delay(1000)
        .duration(2000)
        .ease('linear')
        .attr("d", acrDefault)
        .style("fill", function (d, i) { return old_ages_colors[d.data.key]; })
        .transition()
        // .delay(2000)
        .duration(2000)
        .ease('cubic')
        .attr("stroke-width", 9)
        .transition()
        // .delay(2000)
        .duration(1000)
        .ease('cubic')
        .attr("stroke-width", 3)
        ;

    // Now we'll draw our label lines, etc.
    enteringLabels = labels.selectAll(".label")
        .data(pied_data)
        .enter();
    labelGroups = enteringLabels.append("g")
        .attr("class", "label")
        .attr("id", function (d, i) { return "lbl" + d.data.key; });

    labelGroups.append("circle").attr({
        x: 0,
        y: 0,
        r: 2,
        fill: "#000",
        transform: function (d, i) {
            centroid = acrDefault.centroid(d);
            return "translate(" + acrDefault.centroid(d) + ")";
        },
        'class': "label-circle"
    })
        .style("opacity", 0)
        .transition()
        .delay(function (d, i) {
            return (i + 1) * 1000;
        })
        .duration(1000)
        .ease('linear')
        .style("opacity", 1)
        ;

    // "When am I ever going to use this?" I said in 
    // 10th grade trig.
    textLines = labelGroups.append("line")
        // .style("stroke", "black")  // colour the line
        .classed("label-line", true)
        .attr("x1", function (d, i) { return acrDefault.centroid(d)[0]; })     // x position of the first end of the line
        .attr("y1", function (d, i) { return acrDefault.centroid(d)[1]; })      // y position of the first end of the line
        .attr("x2", function (d, i) { return acrDefault.centroid(d)[0]; })     // x position of the first end of the line
        .attr("y2", function (d, i) { return acrDefault.centroid(d)[1]; })      // y position of the first end of the line
        .transition()
        .delay(function (d, i) {
            return (i + 1) * 1000;
        })
        .duration(1000)
        .ease('linear')
        .attr("x2", function (d, i) {
            centroid = acrDefault.centroid(d);
            midAngle = Math.atan2(centroid[1], centroid[0]);
            x = Math.cos(midAngle) * pie_labelRadius;
            return x;
        })     // x position of the second end of the line
        .attr("y2", function (d, i) {
            centroid = acrDefault.centroid(d);
            midAngle = Math.atan2(centroid[1], centroid[0]);
            y = Math.sin(midAngle) * pie_labelRadius;
            return y;
        })    // y position of the second end of the line
        ;





    textLabels = labelGroups.append("text")
        .attr({
            x: function (d, i) {
                centroid = acrDefault.centroid(d);
                midAngle = Math.atan2(centroid[1], centroid[0]);
                x = Math.cos(midAngle) * pie_labelRadius;
                sign = (x > 0) ? 1 : -1
                labelX = x + (5 * sign)
                return labelX;
            },
            y: function (d, i) {
                centroid = acrDefault.centroid(d);
                midAngle = Math.atan2(centroid[1], centroid[0]);
                y = Math.sin(midAngle) * pie_labelRadius;
                return y;
            },
            'text-anchor': function (d, i) {
                centroid = acrDefault.centroid(d);
                midAngle = Math.atan2(centroid[1], centroid[0]);
                x = Math.cos(midAngle) * pie_labelRadius;
                return (x > 0) ? "start" : "end";
            },
            'class': 'label-text'
        })
        .style("filter", "url(#drop-shadow)")
        // .text("|")
        .transition()
        .delay(function (d, i) {
            return (i + 1) * 1000;
        })
        .duration(5000)
        .ease('linear')
        .text(function (d) {
            return l8n(old_ages_names[d.data.key]);
        });

    alpha = 0.5;
    spacing = 14;

    function relax() {
        again = false;
        textLabels.each(function (d, i) {
            a = this;
            da = d3.select(a);
            y1 = da.attr("y");
            textLabels.each(function (d, j) {
                b = this;
                // a & b are the same element and don't collide.
                if (a == b) return;
                db = d3.select(b);
                // a & b are on opposite sides of the chart and
                // don't collide
                if (da.attr("text-anchor") != db.attr("text-anchor")) return;
                // Now let's calculate the distance between
                // these elements. 
                y2 = db.attr("y");
                deltaY = y1 - y2;

                // Our spacing is greater than our specified spacing,
                // so they don't collide.
                if (Math.abs(deltaY) > spacing) return;

                // If the labels collide, we'll push each 
                // of the two labels up and down a little bit.
                again = true;
                sign = deltaY > 0 ? 1 : -1;
                adjust = sign * alpha;
                da.attr("y", +y1 + adjust);
                db.attr("y", +y2 - adjust);
            });
        });
        // Adjust our line leaders here
        // so that they follow the labels. 
        if (again) {
            labelElements = textLabels[0];
            textLines.attr("y2", function (d, i) {
                labelForLine = d3.select(labelElements[i]);
                return labelForLine.attr("y");
            });
            // setTimeout(relax,5000)
            relax()
        }
    }

    // relax();
    //setTimeout(relax,5000)
}
function belarus_districts_stat(what2show, color_sceheme_num, path, districts, placeholder, head, board, bar, pattern) {
    clean_canvas(placeholder);
    head.text(l8n(what2show));

    // 

    var color_range = colorschemes[color_sceheme_num];
    // var color = d3.scale.ordinal()
    // .domain(["6TH", "7TH", "5TH", "4TH"])
    // .range(colorbrewer.RdBu[4]);


    ///////////////////////////


    // var quantize = d3.scale.quantize()
    // .domain([0, 203000])
    // .range(d3.range(9).map(function(i) { return "q" + i + "-9"; }));


    // var thres_color = d3.scale.threshold()
    // .domain([30000, 50000, 70000, 100000, 203000])
    // .range(["#f2f0f7", "#dadaeb", "#bcbddc", "#9e9ac8", "#756bb1", "#54278f"]);



    // var xAxis = d3.svg.axis()
    // .scale(x)
    // .orient("bottom")
    // .tickSize(13)
    // .tickValues(color.domain());



    // // define colors so text can also be colored
    // var colors = ["#00ACE4", "#00D8A5", "#9b59b6", "#F1B719", "#e74c3c"];

    // // init Fancychart with Fancychart(width, height, colors, color_deactivated)
    // var chart = new Fancychart(200, 120, colors, '#e5e5e5');		
    d3.json('districts.js', function (districts_db_data) {

        var domainArray = [];
        for (var i in districts_db_data) {
            domainArray.push(Number(districts_db_data[i][what2show]));
        };

        var qcolor = d3.scale.quantile().range(color_range);

        var recolorMap = qcolor.domain(domainArray);

        /////////////////////////////////////////////////




        //Define quantile scale to sort data values into buckets of color
        var color = d3.scale.quantize()
            .range(color_range);

        color.domain([
            d3.min(domainArray),
            d3.max(domainArray)
        ]);



        placeholder.selectAll('.district').remove();
        placeholder.select('#legendgroup').remove();


        if (!pattern) {
            var legendgroup = placeholder.append('g').attr("id", "legendgroup");

            var legend = legendgroup.selectAll('g.legendEntry')
                // .data(color.range()) //
                .data(recolorMap.range()) //
                .enter()
                .append('g')
                .attr('class', 'legendEntry')
                .attr("transform", "translate(60, 50)");

            legend
                .append('rect')
                .attr("x", 0)
                .attr("y", function (d, i) {
                    return i * 20;
                })
                .attr("width", 14)
                .attr("height", 14)
                .style("stroke", "black")
                .style("stroke-width", 1)
                .style("fill", function (d) { return d; });
            //the data objects are the fill colors

            legend
                .append('text')
                .attr("x", 20) //leave 5 pixel space after the <rect>
                .attr("y", function (d, i) {
                    return i * 20;
                })
                .attr("dy", "0.9em") //place text one line *below* the x,y point
                .text(function (d, i) {
                    var extent = color.invertExtent(d);
                    //extent will be a two-element array, format it however you want:
                    // var format = d3.format("0.2f");
                    // return (format(+extent[0]) + "—" + format(+extent[1])).replace(".", ",");
                    var format = d3.format("0f");
                    var str = +format(+extent[0] / (what2show === 'pop' ? 1000 : 1)) + 1 + "…"  /*" – "*/ + format(+extent[1] / (what2show === 'pop' ? 1000 : 1)) + (what2show === 'pop' ? (' ' + l8n('thsnd')) : " %");
                    // return str.replace(/\./g, ",");
                    return str;
                });
        }
        // var width = 960,
        // height = 500,
        // formatPercent = d3.format(".0%"),
        // formatNumber = d3.format(".0f");


        // var threshold = d3.scale.threshold()
        // .domain([.11, .22, .33, .50])
        // .range(color_range); // ["#6e7c5a", "#a0b28f", "#d8b8b3", "#b45554", "#760000"]

        // // A position encoding for the key only.
        // var x = d3.scale.linear()
        // .domain([0, 1])
        // .range([0, 240]);

        // var xAxis = d3.svg.axis()
        // .scale(x)
        // .orient("bottom")
        // .tickSize(13)
        // .tickValues(threshold.domain())
        // .tickFormat(function(d) { return d === .5 ? formatPercent(d) : formatNumber(100 * d); });


        // var g = placeholder.append("g")
        // .attr("class", "key")
        // .attr("transform", "translate(0, 40)");

        // g.selectAll("rect")
        // .data(threshold.range().map(function(color) {
        // var d = threshold.invertExtent(color);
        // if (d[0] == null) d[0] = x.domain()[0];
        // if (d[1] == null) d[1] = x.domain()[1];
        // return d;
        // }))
        // .enter().append("rect")
        // .attr("height", 8)
        // .attr("x", function(d) { return x(d[0]); })
        // .attr("width", function(d) { return x(d[1]) - x(d[0]); })
        // .style("fill", function(d) { return threshold(d[0]); });

        // g.call(xAxis).append("text")
        // .attr("class", "caption")
        // .attr("y", -6)
        // .text("Родная мова – беларуская");

        /////////////////////////////////////////////////



        placeholder.selectAll('.district')
            .data(districts)
            .enter()
            .append('path')
            .attr("stroke-opacity", 1)
            .attr('id', function (d) {
                // console.log(d.properties["NAME"]);
                // return 'district' + Math.abs(d.properties["OSM_ID"]); 
                return 'district' + d.properties.id;
            })
            // .attr('class', 'districts')
            .attr('class', 'district')
            // .style("fill", function(d) { 
            // var osm = Math.abs(d.properties["OSM_ID"]);
            // // return quantize( ); 
            // // return thres_color(districts_db_data[osm].pop); 
            // // return recolorMap(districts_db_data[osm].pop); 
            // // return recolorMap(districts_db_data[osm].nat_lang_pc_be); 
            // return recolorMap(districts_db_data[osm].home_lang_pc_be); 

            // })
            .style("fill", function (d) {
                // var osm = Math.abs(d.properties["OSM_ID"]);
                var osm = d.properties.id;

                if (pattern) {
                    return districts_db_data[osm][what2show] > 50 ? "url(#myPattern)" : "url(#myPattern2)";
                } else {
                    return recolorMap(districts_db_data[osm][what2show]);
                }
            })
            // .attr("class", function(d) { 
            // var osm = Math.abs(d.properties["OSM_ID"]);
            // return quantize( districts_db_data[osm].pop); 
            // })
            .attr('d', path)
            .call(d3tooltip(
                function (d, i) {
                    // console.log(JSON.stringify(d));
                    // return num_inbin + '::' + resultstring;
                    // chart.circles("#circleChart", 75, colors[4]);
                    // return d.properties["NAME"];
                    // 3       Баранавіцкі_раён
                    // 5 Афіцыйныя мовы::Родная мова: беларуская 81,61 %, руская 16,59 % Размаўляюць дома: беларуская 64,79 %, руская 32,77 %
                    // 6 Насельніцтва ( )::41 902 чал, (10-е месца)
                    // 7 Шчыльнасць::19,01 чал./ км² (12-е месца)
                    // 8 Нацыянальны склад::беларусы — 86,91 %, палякі — 5,9 %, рускія — 5,21 %, украінцы — 1,12 %, іншыя — 0,86 %
                    // 9 Плошча::2 202.32 км² (6-е месца)
                    // d3.select('.d3tooltip').style("background-color", "yellow");
                    d3.select('.d3tooltip').style("font", "14px  Consolas, serif");
                    // var osm = Math.abs(d.properties["OSM_ID"]);
                    var osm = d.properties.id;

                    var format = d3.format("02.1f");
                    var cdt = districts_db_data[osm];

                    return "<b>" +
                        // (locale_code ? '': (cdt.name_be + "&nbsp;")) +
                        (locale_code ? transliterate(cdt.capital_be) : cdt.name_be) +
                        "&nbsp;" +
                        l8n('raion') +
                        // (locale_code ? ("&nbsp;" + transliterate(cdt.capital_be)) : '') +
                        "</b>" +
                        '<br/>' +
                        cdt.pop + "&nbsp;" +
                        l8n('persons') +
                        '<br/>' +
                        l8n('ntv') +
                        (locale_code ? "&nbsp;&nbsp;&nbsp;" : "&nbsp;") +
                        '<img src="b91.svg" class="small_flag_inline" />' + "&nbsp;" +
                        format(+cdt.nat_lang_pc_be) +
                        "&nbsp;&nbsp;" +
                        '<img src="rf.svg" class="small_flag_inline" />' + "&nbsp;" +
                        format(+cdt.nat_lang_pc_ru) +
                        '<br/>' +
                        l8n('dmst') +
                        (locale_code ? "&nbsp;" : "&nbsp;&nbsp;&nbsp;") +
                        '<img src="b91.svg" class="small_flag_inline" />' + "&nbsp;" +
                        format(+cdt.home_lang_pc_be) +
                        "&nbsp;&nbsp;" +
                        '<img src="rf.svg" class="small_flag_inline" />' + "&nbsp;" +
                        format(+cdt.home_lang_pc_ru);
                }
            ));

    });
}
function magdeburg(projection, placeholder, titler, side, bar, template, quick_mode) {
    clean_canvas(placeholder);
    titler.text(l8n('city_status'));


    var fo_layer = side.append("g")
        .attr("transform", function (d, i) { return "translate(90,20)"; }) // 90, 20
        .attr("id", "fo_layer");

    fo_layer.append("foreignObject")
        .attr("id", "forobj")
        // .attr("height", "100%")
        .attr("height", "700px")
        .attr("width", "220px") //320
        .append("xhtml:body")
        // .style("font", "18px 'Book Antiqua'")
        // .append("xhtml:div")
        // .classed("folist", true)
        // .attr("id", "objcity")
        .html("<div xmlns='http://www.w3.org/1999/xhtml' id='objcity' class='folist'></div>")
        ;

    var objcity = d3.select("#objcity");

    var op_color = d3.select('body').style("background-color");
    var after_anim = 0;
    d3.json("grd.js", function (error, grd) {
        var size = 30;
        var begin_size = size * 2.5;

        var data = d3.nest()
            .key(function (d) {
                return get_old_age(d.magd_date);
            })
            .rollup(function (d) { return d3.sum(d, function (g) { return 1; }); })
            .entries(grd);

        // do_pie(data);
        // return;


        grd.forEach(function (d) {
            d.radius = d.pop;

            if (d.radius > 150) {
                d.radius = 150;
                d.mega = 1;
            }
            d.radius = d.radius / 4;
            d.color = old_ages_colors[get_old_age(d.magd_date)];
        });


        var citydgroup = placeholder.append('g').attr("id", "citydgroup");


        var categorized = citydgroup.selectAll('.dots')
            .data(grd)
            .sort(function (a, b) { return d3.descending(a.radius, b.radius); })

        var every = categorized
            .enter()
            .append("g")
            .call(d3tooltip(
                function (d, i) {
                    var hname = d.histname_be ? (d.histname_be + " (" + d.name_be + ")") : d.name_be;

                    return Mustache.render(template,
                        {
                            uri: server_url,
                            img: d.place_id + d.ext,
                            name: L(hname),
                            text_est: l8n('estd'),
                            text_status: l8n('sttus'),
                            text_ppshn: l8n('ppshn'),
                            yrdot: l8n('yrdot'),
                            text_1k: l8n('thsnd'),
                            est_date: d.est_date,
                            magd_date: d.magd_date,
                            pop: d.pop,
                            estflag: old_ages_flags[get_old_age(d.est_date)],
                            magdflag: old_ages_flags[get_old_age(d.magd_date)]
                        });

                    // Mustache.render(, {img: d.place_id + d.ext,  name: hname, est_date: d.est_date, magd_date: d.magd_date, pop: d.pop, estflag: old_ages_flags[get_old_age(d.est_date)], magdflag: old_ages_flags[get_old_age(d.magd_date)] });
                }
            ));

        every.append("circle") // d3.select(this.parentNode)
            .style('opacity', 0)
            .style('fill', function (d) { return d.color })
            .attr("class", function (d) { return "citydot age" + get_old_age(d.magd_date); })
            .attr("cx", function (d) { return projection([d.lon, d.lat])[0]; })
            .attr("cy", function (d) { return projection([d.lon, d.lat])[1]; })
            .attr("r", function (d) { return d.radius })
            .attr("stroke-width", function (d) { return d.mega ? 12 : 0 })
            .attr("stroke", function (d) { return d.mega ? d.color : "none" })
            .attr("stroke-dasharray", 4)
            // .attr("stroke-alignment", "outer")
            .on("mouseover", function (d) {
                if (after_anim) {
                    var agenum = get_old_age(d.magd_date);
                    if (!lock) {
                        d3.selectAll('.citydot').filter("*:not(.age" + agenum + ")").style('opacity', 0);
                        d3.select('#arc' + agenum)
                            .transition()
                            .duration(1000)
                            .attr("d", arcOver);
                    }
                }
            })
            .on("mouseout", function (d) {
                if (after_anim) {
                    var agenum = get_old_age(d.magd_date);
                    if (!lock) {
                        d3.selectAll('.citydot')
                            // .transition()
                            // .delay(0)
                            // .duration(500) //
                            // .ease("elastic")
                            .style('opacity', 1);

                        d3.select('#arc' + agenum)
                            .transition()
                            .duration(1000)
                            .attr("d", acrDefault);
                    }
                }
            });


        if (quick_mode) {
            placeholder
                .selectAll(".citydot")
                .transition()
                .delay(function (d, i) { return i * 30; })
                .duration(1000)
                .style('opacity', 1);
            do_pie(data, side);
            after_anim = 1;
        } else {
            every.append('svg:image')
                .attr("class", "dots")
                .transition()
                .delay(function (d, i) { return (d.magd_date - 1390) * 100 })	// 100
                // .delay(function(d,i) { return i * 100})
                //.delay(1000)
                .duration(1000) // 
                .tween("text", function (d) {

                    bar.text(d.magd_date);
                    // bar_city.text(d.name_be);
                    // console.log(d.magd_date);
                    var name = d.histname_be || d.name_be;
                    push2objlist(objcity, name, d.magd_date, op_color, 2000, 1);

                })
                .call(endall, function () {
                    // console.log("all done");
                    bar.text("");
                    // bar_city.text("");	

                    setTimeout(function () {
                        placeholder.selectAll(".citydot").style('opacity', 1);

                        placeholder.selectAll(".dots")
                            .transition()
                            .delay(function (d, i) {
                                return i * 30;
                            })
                            .duration(1000)
                            // .remove();
                            .style('opacity', 0);

                        // select
                        // d3.select("#fo_layer")
                        fo_layer
                            .transition()
                            .duration(5000)
                            .ease('exp-in-out')
                            .style("opacity", 0)
                            .remove();
                        do_pie(data, side);
                        after_anim = 1;
                    }, 3000);
                })
                .style('opacity', 1)
                .attr("xlink:href", function (d, i) {
                    return "/coat/" + d.place_id + d.ext;
                })
                .attr("x", function (d, i) { return projection([d.lon, d.lat])[0] - (begin_size / 2); })
                .attr("y", function (d, i) { return projection([d.lon, d.lat])[1] - (begin_size / 2); })
                .attr("width", begin_size)
                .attr("height", begin_size)
                .transition()
                .duration(2000)
                .attr("x", function (d, i) { return projection([d.lon, d.lat])[0] - (size / 2); })
                .attr("y", function (d, i) { return projection([d.lon, d.lat])[1] - (size / 2); })
                .attr("width", size)
                .attr("height", size);
        }



    });

}
function anno_urbis_conditae(projection, placeholder, titler, board, bar, template, quick_mode) {
    clean_canvas(placeholder);
    titler.text(l8n('city_est'));
    d3.json("grd.js", function (error, grd) {
        /*
        if (d.names_pre_be){
        var prename = d.names_pre_be;
        // console.log(prename);
        var delim = prename.indexOf('|');
        // console.log(delim);
        act_name = (delim !== -1) ? prename.substr(0, delim) : prename; 
        // console.log(act_name);
        // act_name = "ololo";
        }
        //return transliterate(act_name);
        
        */
        // d3.labeling()
        // .select(function() { 
        // return d3.selectAll('.city-names')
        // .sort(function(a,b) { 
        // return d3.geo.area(b.geometry) - d3.geo.area(a.geometry); 
        // })
        // })
        // .custom(function(label){
        // label.attr('stroke', 'red');
        // })
        // .pass()
        // .align();




        board.append("g")
            .attr("transform", function (d, i) { return "translate(90,20)"; }) // 90, 20
            .append("foreignObject")
            .attr("id", "forobj")
            // .attr("height", "100%")
            .attr("height", "700px")
            .attr("width", "220px") //320
            .append("xhtml:body")
            // .style("font", "18px 'Book Antiqua'")
            // .append("xhtml:div")
            // .classed("folist", true)
            // .attr("id", "objcity")
            .html("<div xmlns='http://www.w3.org/1999/xhtml' id='objcity' class='folist'></div>")
            ;

        var objcity = d3.select("#objcity");
        grd = grd.sort(function (a, b) { return d3.ascending(a.est_date, b.est_date); })
        var interval = 100;
        var city_radius = 7;

        // cities_after_timer (grd, placeholder, board, city_radius);
        // return;

        function makeCallback(cur_year, city_num, max) {
            return function () { // note that we're returning a new callback function each time
                var cond = true;
                ++cur_year;
                if (!quick_mode) {
                    bar.text(cur_year);
                }
                cur_gor = grd[city_num];

                while (cur_gor.est_date === cur_year) {
                    city_put(placeholder, projection, cur_gor, city_num, objcity, city_radius, template, quick_mode);

                    ++city_num;
                    if (max === city_num) {
                        cond = false;
                        // bar.text("2015");	
                        //bar_city.text("");
                        // console.log("here");
                        setTimeout(function () { cities_after_timer(grd, placeholder, board, city_radius) }, quick_mode ? 500 : 5000);
                        break;
                    }
                    cur_gor = grd[city_num];
                }
                if (cond === true) {

                    if (quick_mode) {
                        var fu = makeCallback(cur_year, city_num, max);
                        fu();
                    } else {
                        d3.timer(makeCallback(cur_year, city_num, max), interval);
                    }
                }
                return true;
            }
        };


        if (quick_mode) {
            var fu = makeCallback(860, 0, grd.length);
            fu();
            // cities_after_timer (grd, placeholder, board, city_radius);
            // return;
        } else {
            d3.timer(makeCallback(860, 0, grd.length), interval);
        }
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        return;
        var transitions = 0;
        var size = 25;
        var begin_size = size * 2.5;
        // board.text.append('text').text('test');
        var amenities = placeholder.selectAll('.tower')
            .data(grd)
            .sort(function (a, b) { return d3.descending(a.est_date, b.est_date); })
            .enter()
            .append('g')
            .call(d3tooltip(
                function (d, i) {
                    return Mustache.render(template, { img: d.place_id + d.ext, name: d.name_be, est_date: d.est_date, magd_date: d.magd_date, pop: d.pop, estflag: old_ages_flags[get_old_age(d.est_date)], magdflag: old_ages_flags[get_old_age(d.magd_date)] });
                }
            ))
            .append('svg:image')
            .attr("class", "tower")
            .transition()
            .delay(function (d, i) { return (d.est_date - 862) * 100 }) //100
            //.delay(function(d,i) { return i * 100})
            //.delay(1000)
            .duration(100)
            .tween("text", function (d) {
                bar.text(d.est_date);
                act_name = d.histname_be || d.name_be;

                d3.select(this.parentNode)
                    .append('text').attr("class", "citynames").text(act_name)
                    .attr("x", function (d, i) { return projection([d.lon, d.lat])[0] })
                    .attr("y", function (d, i) { return projection([d.lon, d.lat])[1] + (size) });
                // console.log("done");


                d3.select(this.parentNode).append("circle")
                    .style('opacity', 0)
                    .style('fill', function (d) {
                        return old_ages_colors[get_old_age(d.est_date)];
                    })
                    .attr("class", function (d) {
                        return "citydot age" + get_old_age(d.est_date);
                    })
                    .attr("cx", function (d) { return projection([d.lon, d.lat])[0]; })
                    .attr("cy", function (d) { return projection([d.lon, d.lat])[1]; })
                    .attr("r", city_radius)
                    .on("mouseover", function (d) {
                        // console.log(JSON.stringify(this));

                        // d3.select(this).style("stroke", "navy");
                        d3.selectAll('.age' + get_old_age(d.est_date))
                            .attr("r", city_radius * 2)
                        // .style("stroke", "navy")
                        // .style("fill", "white");
                    })
                    .on("mouseout", function (d) {
                        d3.selectAll('.age' + get_old_age(d.est_date))
                            .attr("r", city_radius);
                    })
                    ;


            })

            .style('opacity', 1)
            .attr("xlink:href", "mdbg.svg")
            .attr("x", function (d, i) { return projection([d.lon, d.lat])[0] - (begin_size / 2); })
            .attr("y", function (d, i) { return projection([d.lon, d.lat])[1] - (begin_size / 2); })
            .attr("width", begin_size)
            .attr("height", begin_size)
            .transition()
            .duration(5000)
            .attr("x", function (d, i) { return projection([d.lon, d.lat])[0] - (size / 2); })
            .attr("y", function (d, i) { return projection([d.lon, d.lat])[1] - (size / 2); })
            .attr("width", size)
            .attr("height", size)



            .call(endall, function () {
                console.log("all done");
                bar.text("862–2015");

                setTimeout(function () {
                    // select
                    placeholder.selectAll(".citydot")
                        .style('opacity', 1);

                    placeholder.selectAll(".tower")
                        // .transition()
                        // .duration(1000)
                        .remove();
                    // console.log("wow");
                }, 3000);
            })
            ;



    });
}
function hexbin_renaming(projection, width, height, svg, titler, board, bar, quick) {
    clean_canvas(svg);

    var hexbin = d3.hexbin()
        .size([width, height])
        .radius(8);

    var radius = d3.scale.sqrt()
        .domain([0, 12])
        .range([0, 8]);

    var myScale = d3.scale.linear()
        // .domain([new Date(1962, 0, 1), new Date(2006, 0, 1)])
        .domain([1917, 1991])
        .range(["red", "green"]);

    var colorize = myScale
        .interpolate(d3.interpolateLab);


    titler.text(l8n('ren_hex'));
    var parseDate = d3.time.format("%Y").parse;
    d3.json("ren.js", function (error, ren_hg_data) {
        ren_hg_data.forEach(function (d) {
            var p = projection([d.lon, d.lat]);
            d[0] = p[0], d[1] = p[1];
            // d.ren_date = parseDate(d.ren_date);
            // console.log(JSON.stringify(d));
        });
        // console.log(JSON.stringify(ren_hg_data));

        svg.append("g")
            .attr("class", "hexagons")
            .selectAll("path")
            .data(hexbin(ren_hg_data)
                .sort(function (a, b) { return b.length - a.length; }))
            .enter()
            .append("path")
            .attr('id', function (d) { return 'bincell_' + d[0].id; })
            // .attr("d", function(d) { return hexbin.hexagon(radius(d.length*2.5)); })
            .attr("d", function (d) { return hexbin.hexagon(); })
            .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; })
            .call(d3tooltip(
                function (d, i) {
                    var num_inbin = d.length;
                    var resultstring = '';

                    d.sort(function (a, b) { return d3.ascending(a.ren_date, b.ren_date); })
                        .forEach(function (d) {
                            // console.log(d.ren_date);
                            //replace("|", ", ")
                            resultstring = resultstring + ' <b>' + d.ren_date + '</b> ' + L(d.name_be) + ' ← ' + L(d.names_pre_be.replace(/\|/g, ", ")) + '<br/>';
                        });

                    // for (var i = 0; i < num_inbin; i++) {

                    // }

                    //console.log(d.length + '::' + JSON.stringify(d));
                    // console.log(JSON.stringify(d));
                    // return num_inbin + '::' + resultstring;
                    return resultstring;


                }
            ))
            .style("fill", function (d) { return colorize(d3.median(d, function (d) { return +d.ren_date; })); })
            // .style("fill", function(d) {
            // return colorize(d.length); 
            // })
            // .style("fill", "steelblue")
            .attr('class', function (d) { return 'bincell'; })
            ;


        // var color = d3.scale.linear()     .domain()     .range()     .interpolate(d3.interpolateLab);

        // sampleThreshold=d3.scale.threshold().domain([1917, 1991]).range(["red", "green"]);
        // horizontalLegend = d3.svg.legend().units("Годы").cellWidth(80).cellHeight(25).inputScale(color).cellStepping(1);
        // d3.select("svg").append("g").attr("transform", "translate(50,70)").attr("class", "legend").call(horizontalLegend);


        // svg.append("g")
        // .attr("class", "legendLinear")
        // .attr("transform", "translate(20,20)");

        // console.log(JSON.stringify(myScale));

        // var legendLinear = d3.legend.color()
        // .shapeWidth(30)
        // .orient('horizontal')
        // .scale(myScale);

        // svg.select(".legendLinear")
        // .call(legendLinear);

        // var g = svg.append("g")
        // .attr("class", "key")
        // .attr("transform", "translate(40,40)");

        // A position encoding for the key only.
        // var x = d3.scale.linear()
        // .domain([1917, 1991])
        // .range([0, 2000]);
        // var x= myScale;	
        // var xAxis = d3.svg.axis()
        // .scale(x)
        // .orient("bottom")
        // .tickSize(13)
        // .tickValues(myScale.domain());

        // g.selectAll("rect")
        // .data(myScale.range().map(function(d, i) {
        // return {
        // x0: i ? x(myScale.domain()[i - 1]) : x.range()[0],
        // x1: i < myScale.domain().length ? x(myScale.domain()[i]) : x.range()[1],
        // z: d
        // };
        // }))
        // .enter().append("rect")
        // .attr("height", 8)
        // .attr("x", function(d) { return d.x0; })
        // .attr("width", function(d) { return d.x1 - d.x0; })
        // .style("fill", function(d) { return d.z; });

        // g.call(xAxis).append("text")
        // .attr("class", "caption")
        // .attr("y", -6)
        // .text("Population per square mile");

        // var color = d3.scale.threshold()
        // .domain([5, 6, 7, 8, 9, 10])
        // .range(['#EDF8FB', '#BFD3E6', '#9EBCDA', '#8C96C6', '#8C6BB1', '#88419D', '#6E016B']);


        // var x = d3.scale.linear()
        // .domain([0, 11])
        // .range([0, 400]);

        // var xAxis = d3.svg.axis()
        // .scale(x)
        // .orient("top")
        // .tickSize(1)
        // .tickValues(color.domain())


        var legend = svg.append("g")
            .attr("class", "legend")
            .attr("transform", "translate(0,40)")
            .chart("HorizontalLegend")
            .height(20)
            .width(300)
            .padding(4)
            .boxes(30);

        legend.draw(colorize);


        // var g = svg.append("g")
        // .attr("class", "key")
        // .attr("transform", "translate(25,16)");

        // g.selectAll("rect")
        // .data(color.range().map(function(d, i) {
        // return {
        // x0: i ? x(color.domain()[i - 1]) : x.range()[0],
        // x1: i < color.domain().length ? x(color.domain()[i]) : x.range()[1],
        // z: d
        // };
        // }))
        // .enter().append("rect")
        // .attr("height", 10)
        // .attr("x", function(d) { return d.x0; })
        // .attr("width", function(d) { return d.x1 - d.x0; })
        // .style("fill", function(d) { return d.z; });

        // g.call(xAxis).append("text")
        // .attr("class", "caption")
        // .attr("y", 21)
        // .text('Unemployment Rate (%)');			  



    });
}
function viz_renaming(projection, svg, titler, board, bar, quick) {
    clean_canvas(svg);
    titler.text(l8n('ren_chr'));

    // if (e.ctrlKey) {
    // head.text("popopoooppp");
    // }

    d3.json("ren.js", function (error, grd) {

        board.style('font', "72px 'Soviet Style',  Arial, sans-serif");
        /////////////////////////////////////////////////////////////////////////
        // var margin = {top: 20, right: 20, bottom: 70, left: 40},
        // nwidth = 600 - margin.left - margin.right,
        // nheight = 300 - margin.top - margin.bottom;

        // nwidth = 360;
        // nheight =  360;

        // // Parse the date / time

        // var x = d3.scale.ordinal().rangeRoundBands([0, nwidth], 10);

        // var y = d3.scale.linear().range([nheight, 0]);
        // // var y = d3.scale.linear().range([100, 0]);

        // var xAxis = d3.svg.axis()
        // .scale(x)
        // .orient("bottom")
        // // .tickFormat(d3.time.format("d"))
        // ;

        // var yAxis = d3.svg.axis()
        // .scale(y)
        // .orient("left")
        // .ticks(10);

        // // board.append("g")
        // // .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // var per = d3.scale.threshold()
        // .domain([1923, 1938, 1941, 1946, 1954, 1965, 1986, 1992])
        // .range([1, 2, 3, 4, 5, 6, 7, 8, 9]);


        // var data = d3.nest()
        // .key(function(d) { 
        // // p1 1917-1922
        // // p2 1923-1941
        // // p3 1941-1945
        // // p4 1945—1953
        // // p5 1953—1964
        // // p6 1964—1991
        // // var tt= d.ren_date;
        // // console.log(tt +" = "+per(tt));
        // // switch (tt) {
        // // case (tt < 1923): period = "p1"; break;
        // // case (tt >= 1923  && tt < 1941): period = "p2"; break;
        // // case (tt >= 1941  && tt <= 1945): period = "p3"; break;
        // // case (tt > 1945  && tt <= 1953): period = "p4"; break;
        // // case (tt > 1953  && tt <= 1964): period = "p5"; break;
        // // case (tt > 1964  && tt < 1985): period = "p6"; break;
        // // case (tt >= 1985) : period = "p7"; break;
        // // default:
        // // period = "p0";
        // // break;
        // // }
        // return per(d.ren_date);		
        // })
        // .rollup(function(d) { return d3.sum(d, function(g) {return 1; }); })		
        // .entries(grd); 

        // console.log(JSON.stringify(data));


        // x.domain(data.map(function(d) { return d.key; }));
        // y.domain([0, d3.max(data, function(d) { return d.values; })]);

        // board.append("g")
        // .attr("class", "x axis")
        // .attr("transform", "translate(0," + nheight + ")")
        // .call(xAxis)
        // .selectAll("text")
        // .style("text-anchor", "end")
        // .attr("dx", "-.8em")
        // .attr("dy", "1em")
        // // .attr("transform", "rotate(-90)" )
        // ;

        // board.append("g")
        // .attr("class", "y axis")
        // .call(yAxis)
        // .append("text")
        // .attr("transform", "rotate(-90)")
        // .attr("y", 6)
        // .attr("dy", ".71em")
        // .style("text-anchor", "end")
        // .text("Value ($)");

        // board.selectAll("barchart")
        // .data(data)
        // .enter().append("rect")
        // .style("fill", "steelblue")
        // .attr("x", function(d) { return x(d.key); })
        // .attr("width", x.rangeBand())
        // // .attr("width", '2')
        // .attr("y", function(d) { return y(d.values); })
        // // .attr("y", function(d) { return d.values; })
        // .attr("height", function(d) { return height - y(d.values); });

        var margin = { top: 20, right: 20, bottom: 30, left: 40 },
            width = 300 - margin.left - margin.right,
            height = 300 - margin.top - margin.bottom;

        var x = d3.scale.ordinal()
            .rangeRoundBands([0, width], .1);

        var y = d3.scale.linear()
            .range([height, 0]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .tickFormat(formatCurrency);

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            .ticks(10);

        // var svg = d3.select("body").append("svg")
        // .attr("width", width + margin.left + margin.right)
        // .attr("height", height + margin.top + margin.bottom)
        // .append("g")
        // .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var groot = board.append("g")
            .attr("transform", "translate(30, 150)")
            .attr("id", "sovietlayer");
        /////////////////////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////////////////////
        var ages = [1923, 1938, 1941, 1946, 1954, 1965, 1986, 1991];
        var per = d3.scale.threshold()
            //.domain([1923, 1938, 1941, 1946, 1954, 1965, 1986])
            .domain(ages)
            // .range(ages)
            .range([1, 2, 3, 4, 5, 6, 7, 8, 9])
            ;

        function formatCurrency(d) {
            return l8n('bef') + " " + ages[d - 1];
        }
        var data = d3.nest()
            .key(function (d) {
                // p1 1917-1922
                // p2 1923-1941
                // p3 1941-1945
                // p4 1945—1953
                // p5 1953—1964
                // p6 1964—1991
                return per(d.ren_date);
            })
            .rollup(function (d) { return d3.sum(d, function (g) { return 1; }); })
            .entries(grd);

        // console.log(JSON.stringify(data));
        /////////////////////////////////////////////////////////////////////////////////

        data.forEach(function (d) {
            // console.log(JSON.stringify(d));
            d.values < 5 ? d.values = 5 : null;
        });

        /////////////////////////////////////////////////////////////////////////////////
        // var data = [{"key":"1","values":17},{"key":"2","values":76},{"key":"3","values":51},{"key":"4","values":17},{"key":"5","values":33},{"key":"6","values":320},{"key":"7","values":93},{"key":"8","values":1}];

        x.domain(data.map(function (d) { return d.key; }));
        var sov_max = d3.max(data, function (d) { return d.values; });
        y.domain([0, sov_max]);

        function show_soviet_ages() {
            groot.append("g")
                .attr("class", "x rnbc_axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis)
                .selectAll("text")
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", "-.6em")
                .attr("transform", "rotate(-90)");

            groot.append("g")
                .attr("class", "y rnbc_axis")
                .call(yAxis)
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text(l8n('ren_amount'));

            groot.selectAll(".renamebarchart")
                .data(data)
                .enter().append("rect")
                .attr("class", "renamebarchart")
                .attr("id", function (d) { return "p" + d.key; })
                .on("mouseover", function (d) {
                    d3.selectAll('.stars').filter("*:not(.period" + d.key + ")")
                        // .transition()
                        // .delay(function (d, i) {
                        // return i*10;
                        // })
                        // .duration(500)
                        .style('opacity', 0);
                    d3.select(this).style("fill", "darkred");

                })
                .on("mouseout", function (d) {
                    d3.selectAll('.stars').style('opacity', 1);
                    d3.select(this).style("fill", "black");
                })
                .attr("x", function (d) { return x(d.key); })
                .attr("width", x.rangeBand())
                //.attr("width", 3)
                .attr("height", 0)
                .attr("y", height)
                //.attr("y", function(d) { return y(d.values); })
                //.attr("height", function(d) { return height - y(d.values); })
                .transition()
                //.duration(1)
                .duration(1500)
                .call(function () {

                    var stick = d3.select("#p6");
                    var st_wi = stick.attr("width");
                    var st_x = stick.attr("x");

                    var delta = 100;
                    var h_delta = height - delta;


                    stick.classed("renamebarchart renamebarchart2", true);

                    groot.append("rect")
                        .attr("class", "renamebarchart2")


                        .attr("height", 0)
                        .attr("x", st_x)
                        .attr("y", height)
                        .transition()
                        .duration(1500)
                        .ease("bounce")
                        .attr("x", st_x)
                        .attr("width", st_wi)
                        .attr("y", delta)
                        .attr("height", h_delta)
                        ;

                    tr_size = st_wi * 10;

                    var x_shift = +st_x + st_wi / 2;
                    var tri = groot.append("svg:path")
                        .attr("d", d3.svg.symbol().type("triangle-up").size(tr_size))
                        .attr("transform", "translate(" + parseInt(x_shift) + "," + (delta - st_wi / 3) + ")")
                        .style("fill", "black")
                        .attr("class", "renamebarchart2")
                        .style("opacity", 0)
                        .transition()
                        .delay(0)
                        .duration(4000)
                        .style("opacity", 1)
                        ;

                    var st_wi_new = 3;
                    var st_x_new = x_shift - st_wi_new / 2;
                    stick.attr("x", st_x_new);
                    stick.attr("width", st_wi_new);

                    var flaz_wi = width / 3;


                    groot.append('svg:image')
                        .attr("class", "flag")
                        .attr("xlink:href", "sov-u-flag.svg")
                        .attr("x", +stick.attr("x") + parseInt(stick.attr("width")))
                        .attr("y", 0)
                        .attr("width", 0)
                        .attr("height", flaz_wi / 2)
                        .transition()
                        .delay(0)
                        .duration(4000)
                        //.style("opacity", 1)
                        .attr("width", flaz_wi)
                        ;
                })
                .attr("y", function (d) { return y(d.values); })
                .attr("height", function (d) { return height - y(d.values); })
                ;

            d3.selectAll(".renamebarchart2").
                on('mouseover', function (d, i) {
                    d3.selectAll('.renamebarchart2').style('fill', 'darkred');
                    d3.select('#p6').style('fill', 'darkred');
                    d3.selectAll('.stars').filter("*:not(.period" + '6' + ")").style('opacity', 0);
                })
                .on('mouseout', function (d, i) {
                    d3.selectAll('.renamebarchart2').style('fill', 'black');
                    d3.select('#p6').style('fill', 'black');
                    d3.selectAll('.stars').style('opacity', 1);
                });

        }
        /////////////////////////////////////////////////////////////////////////

        var star_duration = quick ? 0 : 2000;
        var size = 15;
        svg.selectAll('.stars')
            .data(grd)
            .sort(function (a, b) { return d3.descending(a.ren_date, b.ren_date); })
            .enter()
            .append('g')
            .call(d3tooltip(
                function (d, i) {
                    return "<b>" + d.name_be + "</b><br/>" + l8n('earlr') + ": " + d.names_pre_be.replace(/\|/g, ", ") + "<br/>" + l8n('yr') + ": " + d.ren_date;
                }
            ))
            .append('svg:image')
            .attr("class", function (d) { return "stars period" + per(d.ren_date) })
            .on("mouseover", function (d) {
                var timespan = per(d.ren_date);
                d3.selectAll('.stars').filter("*:not(.period" + timespan + ")").style('opacity', 0.25);
                d3.select('#p' + timespan).style('fill', 'darkred');
                if (timespan === 6) {
                    d3.selectAll('.renamebarchart2').style('fill', 'darkred');
                }
            })
            .on("mouseout", function (d) {
                var timespan = per(d.ren_date);
                d3.selectAll('.stars').style('opacity', 1);
                d3.select('#p' + timespan).style('fill', 'black');
                if (timespan === 6) {
                    d3.selectAll('.renamebarchart2').style('fill', 'black');
                }
            })
            .transition()
            .delay(function (d, i) {
                if (quick) {
                    return 0;
                } else {
                    // return i * 100;
                    var dif = d.ren_date - 1917;
                    if (dif > 60) { dif = 61; }
                    return dif * 1000;
                }
            })
            .duration(star_duration)
            .tween("showdate", function (d) { bar.text(d.ren_date); })
            .call(endall, function () {
                // console.log("all done");
                bar.text("");
                show_soviet_ages();
            })
            // .style('opacity', 1)
            // .attr("xlink:href", "magd1.svg")
            .attr("xlink:href", "Communist1.svg")
            .attr("fill", "pink")
            .attr("x", function (d, i) { return projection([d.lon, d.lat])[0] - (size / 2); })
            .attr("y", function (d, i) { return projection([d.lon, d.lat])[1] - (size / 2); })
            .attr("width", size)
            .attr("height", size)

            ;


    });


}
function mapdots(projection, svg, board, loaded_data, pack) {


    svg.selectAll(".dots").remove();
    svg.selectAll(".node").remove();

    /*
    var linksgrid = $('#myTable');
    
    if (linksgrid.html() !== ''){
    linksgrid.empty();
    }
    
    $('<thead id=myTableHead></thead>').appendTo(linksgrid); 
    
    var mth = $('#myTableHead');
    $('<tr id=headrow></tr>').appendTo(mth); 
    var headrow = $('#headrow');
    $('<th>ID</th>').appendTo(headrow); 
    $('<th>На мапе</th>').appendTo(headrow); 
    $('<th>Беларуская назва</th>').appendTo(headrow); 
    $('<th>Руская назва</th>').appendTo(headrow);  // 
    $('<th>Раён</th>').appendTo(headrow); 
    $('<tbody id=tableBody></tbody>').appendTo(linksgrid);  //?
    var tableBody = $('#tableBody');
    jQuery.each(loaded_data, function() {
    var row =$('<tr><td>' + this.id + '</td><td><input type="checkbox" "checked"="checked"/></td><td>' + this.name_be + '</td><td>' + this.name_ru + '</td><td>' + this.county +'</td></tr>');
    row.appendTo(tableBody);
    });
    
    linksgrid.tablesorter({ 
    // widthFixed: true, 
    widthFixed: false,
    widgets: ['zebra'],
    
    headers: { // pass the headers argument and assing a object 
    // assign the secound column (we start counting zero) 
    // 1:{sorter: false},  // disable it by setting the property sorter to false 
    // 2:{sorter: false},
    }
    }); 
    */
    // var mycolor = "hsl(" + Math.random() * 360 + ",100%,50%)";

    // var colors = d3.scale.category20();
    // mycolor = colors(3);

    // console.log(JSON.stringify(loaded_data));


    var datacopy = loaded_data.slice(0);
    var feature = datacopy[0].hasOwnProperty("group") ? 'group' : 'name_be';
    // console.log(feature);
    var newdata = d3.nest()
        .key(function (d) { return d[feature]; })
        .rollup(function (d) { return d3.sum(d, function (g) { return 1; }); })
        // .rollup(function(d) { return {"length": d.length, "total_time": d3.sum(d, function(g) {return 1; })} })
        .entries(datacopy);


    // var newdata2 = d3.nest()
    // .key(function(d) { return d.name_be;})
    // .entries(datacopy);
    // console.log(JSON.stringify(newdata2));

    var places_qty = newdata.length;
    // console.log("Begin size: " + places_qty);

    var data2bub = newdata;
    var outof = 0;

    var uplimit = 20;
    var upcolor = "lightgray";

    if (places_qty > uplimit) {
        for (i = 1; ; i++) {
            data2bub = data2bub.filter(function (d) { if (d.values != i) { return d; } });
            cur_size = data2bub.length;
            // console.log( "•" + i + " → items: " + cur_size);
            if (cur_size < uplimit) {
                outof = newdata.filter(function (d) { if (d.values <= i) { return d; } }).length;
                data2bub.push({ "key": outof, "values": i, "mark": 1 }); // add array of links to names
                break;
            }
            if (places_qty === cur_size) {
                // console.log("no progress on: " + cur_size);
                // newdata.sort(function(a, b){ return d3.descending(a.values, b.values); })
                // data2bub = newdata.splice(0,19)
                // break;
            }
            places_qty = cur_size;
        }
    }



    var colorscheme_hash = {};

    data2bub.forEach(function (d, i) {
        // d.color = colors(i);
        d.color = d.mark ? upcolor : colores_google(i);
        var frgb = d3.rgb(d.color); // The channels are available as the r, g and b attributes of the returned object.
        d.textcolor = ((frgb.r * 0.299 + frgb.g * 0.587 + frgb.b * 0.114) > 128 ? '#000000' : '#ffffff'); //186
        colorscheme_hash[d.key] = d.color;
        d.group = d.mark ? uplimit : i + 1;

    });
    var outof_color = colorscheme_hash[outof];

    // console.log(JSON.stringify(data2bub));
    // console.log(JSON.stringify(colorscheme_hash));
    // {"lat":53.04019,"id":10651,"lon":29.75312,"county":"Рагачоўскі","name_ru":"Яскиня","name_be":"Яскіня"}



    var m = d3.map(data2bub, function (d) { return d.key; });

    loaded_data.forEach(function (d, i) {
        // d.color = colors(i);
        if (m.has(d[feature])) {
            var item = m.get(d[feature]);
            d.color = item.color;
            d.qty = item.values;
            d.group = item.group;
            d.textcolor = item.textcolor;
        } else {
            d.color = upcolor;
            d.qty = 0;
            d.group = uplimit;
            d.textcolor = "black";
        }
    });



    loaded_data.sort(function (a, b) { return d3.ascending(a.qty, b.qty); });

    // console.log(JSON.stringify(loaded_data));
    if (true) {
        var radius = 5;
        var dots = svg.selectAll("dots")
            .data(loaded_data)
            .enter()
            .append("g")
            .call(d3tooltip(
                function (d, i) {
                    // d3.select('.d3tooltip').style("background-color", colorscheme_hash[d.name_be] || outof_color );


                    d3.select('.d3tooltip').style("background-color", d.color);
                    return '<div style="color:' + d.textcolor + ';"><b>' + L(d.name_be) + "</b><br/>" + (locale_code ? transliterate(d.capital_be) : d.district_be) + " " + l8n('raion') + '</div>';
                }
            ))
            .append("circle")
            .style('opacity', 0)
            .attr("cx", function (d) { return projection([d.lon, d.lat])[0]; })
            .attr("cy", function (d) { return projection([d.lon, d.lat])[1]; })
            .attr("r", radius)
            .attr("class", function (d) { return "dots group" + d.group; })
            .on("mouseover", function (d) {
                // d3.select(this).transition()
                // .duration(1000)
                // .attr("d", arcOver);
                d3.selectAll('.dots').filter("*:not(.group" + d.group + ")").style('opacity', 0);
                d3.selectAll('.node').filter("*:not(.group" + d.group + ")").style('opacity', 0.2);
            }).on("mouseout", function (d) {
                d3.selectAll('.dots').filter("*:not(.group" + d.group + ")").style('opacity', 1);
                d3.selectAll('.node').filter("*:not(.group" + d.group + ")").style('opacity', 1);
                // d3.select(this).transition()
                // .duration(1000)
                // .attr("d", acrDefault);
                // d3.selectAll('.citydot').style('opacity', 1);
            })
            // .style("fill", function(d) {  return colorscheme_hash[d.name_be] || outof_color } )
            .style("fill", function (d) { return d.color })


            // .on("click", function(d) {
            // // alert(d.name_be);
            // var all = svg.selectAll(".dots")
            // // .attr('r', 25)
            // // .style("fill","lightcoral")
            // // .style("stroke","red");
            // .transition()
            // .duration(500)
            // .style("fill","white")
            // .attr("stroke-width", 7)
            // .attr("stroke", mycolor)

            // .attr("r", radius)
            // .transition()
            // .duration(250)
            // .style("fill",mycolor)
            // .attr('stroke-width', 0.5)
            // // .attr("r", radius)
            // .ease('sine')
            // // .each("end", repeat);
            // ;

            // })
            .transition()
            .delay(function (d, i) { return i * 10; })
            .duration(1250)
            .style('opacity', 1)
            ;
    }

    bubble(data2bub, board);

    // svg.selectAll("text")
    // .data(loaded_data)
    // .enter()
    // .append("svg:text")
    // .attr('class', 'lbl')
    // .text(function(d){
    // return d.name_be;
    // })
    // .attr("x", function(d){
    // return projection([d.lon, d.lat])[0];
    // })
    // .attr("y", function(d){
    // return  projection([d.lon, d.lat])[1];
    // })
    // .attr("text-anchor","middle")
    // .attr('font-size',function(d) { return Math.min(2 * d.r, (2 * d.r - 8) / this.getComputedTextLength() * 24) + "px"; });


    // svg.selectAll(".dots").on("click", function(){
    // d3.select(this)
    // // .attr('r', 25)
    // .style("fill","lightcoral")
    // .style("stroke","red");

    // // alert( function(d) { return d.name_be; } ) ;
    // });
}
function pulse() {
    var circle = svg.select("circle");
    (function repeat() {
        circle = circle.transition()
            .duration(2000)
            .attr("stroke-width", 20)
            .attr("r", 10)
            .transition()
            .duration(2000)
            .attr('stroke-width', 0.5)
            .attr("r", 20)
            .ease('sine')
            .each("end", repeat);
    })();
}
function clean_canvas(placeholder) {
    lock = 0;
    d3.select("#head").text(l8n('title'));
    placeholder.selectAll(".tower").remove();
    placeholder.selectAll(".citynames").remove();
    placeholder.selectAll(".citydot").remove();


    placeholder.selectAll(".drawline").remove();
    placeholder.selectAll(".dots").remove();
    placeholder.selectAll(".legend").remove();

    placeholder.selectAll(".sq").remove();
    placeholder.selectAll(".node").remove();

    placeholder.selectAll(".hexagons").remove();
    placeholder.selectAll(".bincell").remove();
    placeholder.selectAll(".stars").remove();
    placeholder.select("#pielayer").remove();
    placeholder.select("#sovietlayer").remove();
    placeholder.select("#bar").text('');
    // svg2.selectAll("*").remove();
}
function fy(d) {
    console.log(JSON.stringify(d));
}
