var arcDefault;
var arcOver;
var lock = 0;
var op_color = 'yellow';
var colorschemes = [];
var locale_code = 1;
var locale = {};
var modalAboutLoaded = false;
var server_url = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '') + '/';
var fulltestingapp = window.location.href.includes('full');
console.log('mode:', fulltestingapp ? 'full' : 'basic');
var old_ages = [1250, 1569, 1772, 1917, 1991, 2015];
var old_ages_flags = ['ori.svg', 'gdl-flag.svg', 'rp-flag.svg', 're-flag.svg', 'sov-u-flag.svg', 'bel-flag.svg'];
var old_ages_names = ['nameor', 'namegd', 'namerp', 'namere', 'namesu', 'nameby'];
var old_ages_colors = ['#377eb8', '#e41a1c', '#ff7f00', /*'#ffff33' '#f781bf'*/ '#a65628', '#984ea3', '#4daf4a'];
var get_old_age = d3
    .scaleThreshold()
    // .scale
    // .threshold()
    .domain(old_ages)
    // // .range(ages)
    .range([0, 1, 2, 3, 4, 5, 6, 7]);

d3.selection.prototype.moveToFront = function () {
    return this.each(function () {
        this.parentNode.appendChild(this);
    });
};
//  Grand Duchy of Lithuania, Ruthenia and Samogitia
var queries = {
    q17: { query: 'село', label: ['Village radix', 'Сяло-'] },
    q18: { query: 'город', label: ['City radix', 'Горад-'] },
    q3: { query: 'болот', label: ['Swamplands', '«Людзі на балоце»'] },
    q16: { query: 'гора|горк|горье', label: ['Belarusian mountains', 'Беларускія горы'] },
    q5: { query: 'нов[аяоый]{2}', label: ['New ones', 'Усё новае'] },
    q9: { query: 'вичи$', label: ['Patronimic -vich', '-авічы/-овічы/-евічы'] },
    q2: {
        query: 'Пролет#Красн#Октяб#Коммун#Совет#Ленин#киров#дзержин#калинин#ворошилов#чапаев',
        label: ['Soviet names', '«Савецкі Саюз»'],
    },
    q14: { query: 'ре[кч]#озер', label: ['River vs lake', 'Край азёр і рэк...'] },
    q15: { query: '^ив[^а]#^лоз#^верб', label: ['*vьrba, *jьva, *loza = willow', '*vьrba, *jьva, *loza'] },
    iszki: { query: 'ишки$', label: ['Jana Safarewicz border (-iszki)', 'Granica Jana Safarewicza (-iszki)'] },
    q8: { query: 'овка$#щина$', label: ['Suffixes -owka vs -schyna', '-оўка/-шчына'] },
    q6: {
        query: '^лях#^лит#^москал#^ятв#^рус#кривич',
        label: ['Lithuania, Ruthenia and other nations', 'Літва, Русь, крывічы, ляхі ды маскалі'],
    },
    q4: { query: 'велик|больш#мал', label: ['Big and small', 'Вялікі і малы'] },
    q10: { query: 'яскевич', label: ['Yaskevichs', 'Яскевічы'] },
    q7: { query: 'ье$', label: ['Old Slavic *-je suffix', 'Назвы на *-je'] },
    q11: { query: 'бобр#барсук', label: ['Beaver vs badger', 'Бобр vs барсук'] },
    q13: { query: 'виш.?н#малин', label: ['Cherry vs Raspberry', 'Вішня vs маліна'] },
    q12: { query: 'бел', label: ['-bel- = white', '-бел- у Беларусі'] },
    q19: { query: '@красн#чырв', label: ['Traditional Red and Russian one', '„Красны“ і „чырвоны“'] },
};

function switchLocale() {
    locale_code ^= 1;
    // console.log("locale:", locale_code);
    setLocale();
}

function makeMenu(list, start, end) {
    var entries = Object.entries(list);
    if (start || end) {
        entries = entries.slice(start, end);
    }
    return entries.map(function (x) {
        return `<li role="presentation"><a href="#" class="query ${x[0]}">${x[1].label[locale_code]}</a></li>`
    }).join("");
}
function setLocale() {
    var be1 = d3.select('.interface_be');
    var en1 = d3.select('.interface_en');

    if (be1.empty() || en1.empty()) {
        return;
    }

    d3.select(be1.node().parentNode).classed('disabled', locale_code);
    d3.select(en1.node().parentNode).classed('disabled', !locale_code);
    d3.selectAll('[class^=label]').text(function () {
        return l8n(d3.select(this).attr('class'));
    });
    d3.select('.req').attr('placeholder', l8n('tipsearch'));
    loadAbout();
    if (fulltestingapp) {
        var menu = makeMenu(queries);
        d3.select('.queries').html(menu);
    } else {
        var unwrapped = makeMenu(queries, 0, 7);
        var wrapped = makeMenu(queries, 7);
        var more = `<li class="dropdown">
        <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button"
            aria-haspopup="true" aria-expanded="false">
            <span class="glyphicon glyphicon-heart"></span>
            <span class="labelqueries">${locale['labelmore'][locale_code]}</span><span class="caret"></span></a>
        <ul class="dropdown-menu">${wrapped}</ul>
        </li>`;
        d3.select('.examples').html(unwrapped + more);
    }
}
function l8n(property) {
    // console.info(property);
    return locale[property][locale_code];
}
function L(s) {
    return locale_code ? s : transliterate(s);
}
function transliterate(word) {
    var a = {
        Ё: 'Yo',
        Й: 'I',
        Ц: 'Ts',
        У: 'U',
        К: 'K',
        Е: 'E',
        Н: 'N',
        Г: 'G',
        Ш: 'Sh',
        Щ: 'Sch',
        З: 'Z',
        Х: 'H',
        Ъ: "'",
        ё: 'yo',
        й: 'i',
        ц: 'ts',
        у: 'u',
        к: 'k',
        е: 'e',
        н: 'n',
        г: 'g',
        ш: 'sh',
        щ: 'sch',
        з: 'z',
        х: 'kh',
        ъ: "'",
        Ф: 'F',
        Ы: 'I',
        В: 'V',
        А: 'A',
        П: 'P',
        Р: 'R',
        О: 'O',
        Л: 'L',
        Д: 'D',
        Ж: 'Zh',
        Э: 'E',
        ф: 'f',
        ы: 'y',
        в: 'v',
        а: 'a',
        п: 'p',
        р: 'r',
        о: 'o',
        л: 'l',
        д: 'd',
        ж: 'zh',
        э: 'e',
        Я: 'Ya',
        Ч: 'Ch',
        С: 'S',
        М: 'M',
        И: 'I',
        Т: 'T',
        Ь: "'",
        Б: 'B',
        Ю: 'Yu',
        я: 'ya',
        ч: 'ch',
        с: 's',
        м: 'm',
        и: 'i',
        т: 't',
        ь: '',
        б: 'b',
        ю: 'yu',
        ў: 'w',
        '’': 'y',
        і: 'i',
        І: 'I',
        '-': '‒',
    }; // " ":"∙"
    return word.toString()
        .split('')
        .map(function (char) {
            // return a[char] || char;
            return typeof a[char] !== 'undefined' ? a[char] : char;
        })
        .join('')
        .replace('we', 'wye')
        .replace('oi', 'oy')
        .replace('ei', 'ey');
}
// https://gist.github.com/wrobstory/7612013
var d3tooltip = function (accessor) {
    return function (selection) {
        var d3tooltipDiv;
        var body = d3.select('body').node();
        selection
            .on('mouseover', function (event, d) {
                d3.select('body').selectAll('div.d3tooltip').remove();
                d3tooltipDiv = d3.select('body').append('div').attr('class', 'd3tooltip');
                // console.log(event, d);
                d3tooltipDiv
                    .style('left', event.pageX + 10 + 'px')
                    .style('top', event.pageY - 15 + 'px')
                    .style('position', 'absolute')
                    .style('z-index', 1001);
                // var d3tooltipText = accessor(d, i) || '';
                // d3tooltipDiv.style('width', function (d, i) { return (d3tooltipText.length > 80) ? '300px' : null; })
                //     .html(d3tooltipText);
            })
            .on('mousemove', function (event, d) {
                d3tooltipDiv.style('left', event.pageX + 10 + 'px').style('top', event.pageY - 15 + 'px');
                var d3tooltipText = accessor(event, d) || '';
                if (d3tooltipText.length) {
                    d3tooltipDiv.html(d3tooltipText);
                }
            })
            .on('mouseout', function (d, i) {
                d3tooltipDiv.remove();
            });
    };
};
// kashesandr : http://stackoverflow.com/questions/10692100/invoke-a-callback-at-the-end-of-a-transition
function endall(transition, callback) {
    if (transition.size() === 0) {
        callback();
    }
    var n = 0;
    transition
        .each(function () {
            ++n;
        })
        .on('end', function () {
            if (!--n) callback.apply(this, arguments);
        });
}
function resizeDots(age, rad) {
    //this.prevRadius = d3.select(this).attr("r");
    d3.selectAll('.age' + age)
        //.attr("r", r1)
        .transition()
        .ease(d3.easeElastic)
        .duration(500)
        .attr('r', rad);
}
function ImageExist(url) {
    var img = new Image();
    img.src = url;
    return img.height != 0;
}
function osm_layer_put(where, projection_path, jsonfile, svgclass) {
    d3.json(jsonfile).then(function (data) {
        where
            .selectAll('.' + svgclass)
            .data(data.features)
            .enter()
            .append('path')
            .attr('class', svgclass)
            .attr('d', projection_path)
            .call(
                d3tooltip(function (event, d) {
                    return d.properties['NAME'];
                })
            );
    });
}
function tiles_load(svg, proj, w, h) {
    var tiles = d3
        .tile()
        .scale(proj.scale() * 2 * Math.PI)
        .translate(proj([0, 0]))
        .size([w, h])
        .zoomDelta((window.devicePixelRatio || 1) - 0.5)();
    var prov = 'tile.opentopomap.org';

    svg
        .append('g')
        .attr('clip-path', 'url(#clip)')
        .selectAll('image')
        .data(tiles)
        .enter()
        .append('image')
        .attr('xlink:href', function (d) {
            return (
                '//' + ['a', 'b', 'c'][(Math.random() * 3) | 0] + '.' + prov + '/' + d[2] + '/' + d[0] + '/' + d[1] + '.png'
            );
        })
        .attr('width', Math.round(tiles.scale))
        .attr('height', Math.round(tiles.scale))
        .attr('x', function (d) {
            return Math.round((d[0] + tiles.translate[0]) * tiles.scale);
        })
        .attr('y', function (d) {
            return Math.round((d[1] + tiles.translate[1]) * tiles.scale);
        });

    svg.append('use').attr('xlink:href', '#land').attr('class', 'stroke');
}
function push2objlist(object_node, name, date, color, delay, num) {
    var par = object_node
        .insert('xhtml:div', ':first-child')
        .classed('row', true)
        .style('opacity', 1.0)
        // .style("background-color",  function () { return num % 2 ? "lightyellow" : "#FFCC11"} )
        .style('background-color', color)
        .html('<div class="left">' + name + '</div><div class="right">' + date + '</div>')
        .style('font-weight', 'bold')
        .transition()
        .delay(4000)
        // .duration(3000)
        // .ease('quad')
        .style('font-weight', 'normal')
        // ;
        // par
        .transition()
        .delay(delay)
        // .duration(5000)
        .duration(1000)
        // .style("opacity",0.0) // there is some bug in here!!!
        .style('color', color)
        // .style("background-color",color)
        // .transition()
        // .delay(1000)
        // .duration(100)
        .remove();
}
function city_put(svg, projection, city, number, object_node, citydot_radius, mustache_template, quick_mode) {
    var size = 25;
    var begin_size = size * 2.5;
    var name = city.histname_be || city.name_be;

    var citydgroup = svg.append('g').attr('id', 'citydgroup');
    var new_g = citydgroup.append('g');
    // var imgpath = server_url + "coat/" + city.place_id + city.ext;
    var hname = city.histname_be ? city.histname_be + ' (' + city.name_be + ')' : city.name_be;
    // console.log(ImageExist(imgpath) ? "yes" : imgpath);

    new_g.call(
        d3tooltip(function (d, i) {
            var render = Mustache.render(mustache_template, {
                uri: server_url,
                img: city.place_id + city.ext,
                name: L(hname),
                text_est: l8n('labelest'),
                text_status: l8n('labelstatus'),
                text_labelpop: l8n('labelpop'),
                labelyeardot: l8n('labelyeardot'),
                text_1k: l8n('labelthousand'),
                est_date: city.est_date,
                magd_date: city.magd_date,
                pop: city.pop,
                estflag: old_ages_flags[get_old_age(city.est_date)],
                magdflag: old_ages_flags[get_old_age(city.magd_date)],
            });
            return render;
        })
    );
    if (!quick_mode) {
        push2objlist(object_node, name, city.est_date, op_color, 5000, number);
        var city_x1 = projection([city.lon, city.lat])[0] - begin_size / 2;
        var city_y1 = projection([city.lon, city.lat])[1] - begin_size / 2;
        var city_x2 = projection([city.lon, city.lat])[0] - size / 2;
        var city_y2 = projection([city.lon, city.lat])[1] - size / 2;
        new_g
            .append('svg:image')
            .attr('class', 'tower')
            .attr('xlink:href', 'mdbg.svg')
            .attr('x', city_x1)
            .attr('y', city_y1)
            .attr('width', begin_size)
            .attr('height', begin_size)
            .transition()
            .duration(3000)
            .attr('x', city_x2)
            .attr('y', city_y2)
            .attr('width', size)
            .attr('height', size);
        // .each("start", function(d){++status;})
        // .each("end", function(d){--status;})
        new_g
            .append('text')
            .attr('class', 'citynames unselectable')
            .text(name)
            .attr('x', projection([city.lon, city.lat])[0])
            .attr('y', projection([city.lon, city.lat])[1] + size);
    }

    new_g
        .append('circle')
        .style('opacity', 0)
        .style('fill', function (d) {
            return old_ages_colors[get_old_age(city.est_date)];
        })
        .attr('class', function (d) {
            return 'citydot age' + get_old_age(city.est_date);
        })
        .attr('cx', projection([city.lon, city.lat])[0])
        .attr('cy', projection([city.lon, city.lat])[1])
        .attr('r', citydot_radius)
        .on('mouseover', function (d) {
            var cellplate = d3.select('.cellplate' + get_old_age(city.est_date));
            cellplate.attr('stroke-width', 4);
            resizeDots(get_old_age(city.est_date), citydot_radius * 2);
        })
        .on('mouseout', function (d) {
            var cellplate = d3.select('.cellplate' + get_old_age(city.est_date));
            cellplate.attr('stroke-width', 1);
            resizeDots(get_old_age(city.est_date), citydot_radius);
        });
}
function drawTreemap(data, container, radius) {
    var root = d3.treemap().tile(d3.treemapBinary).size([300, 300]).padding(1).round(true)(
        d3
            .hierarchy({ children: data })
            .sum(d => d.values)
            .sort(function (a, b) {
                return b.values - a.values;
            })
    );

    var percent = d3.sum(
        data.map(function (x) {
            return x.values;
        })
    );

    var tree = container.append('g').classed('sq', true).attr('transform', 'translate(0,50)');

    var leaf = tree
        .selectAll('.cell')
        .data(root.leaves())
        .join('g')
        .classed('cell', true)
        .attr('transform', function (d) {
            return `translate(${d.x0},${d.y0})`;
        });

    leaf
        .append('rect')
        .attr('class', function (d) {
            return 'cellplate' + d.data.key;
        })
        .attr('id', function (d) {
            return (d.leafUid = 'leaf' + d.data.key);
        })
        .attr('width', function (d) {
            return d.x1 - d.x0;
        })
        .attr('height', function (d) {
            return d.y1 - d.y0;
        })
        .on('mouseover', function (event, d) {
            var that = d3.select(this);
            this.prevStrokeW = that.attr('stroke-width');
            that.attr('stroke-width', 4);
            resizeDots(d.data.key, radius * 2);
        })
        .on('mouseout', function (event, d) {
            d3.select(this).attr('stroke-width', this.prevStrokeW);
            resizeDots(d.data.key, radius);
        })
        .style('fill', 'white')
        .transition()
        .duration(2000)
        .ease(d3.easeCubic)
        .style('fill', function (d) {
            return old_ages_colors[d.data.key];
        });

    text = leaf.append('text').classed('pass', true).each(insertLinebreaks);
    // leaf.append("clipPath")
    //     .attr("id", d => (d.clipUid = "clip" + d.data.key))
    //     .append("use")
    //     .attr("xlink:href", d => d.leafUid.href);

    // leaf.append("text")
    //     .attr("clip-path", function (d) { return d.clipUid })
    //     .attr("class", "pass")
    //     .selectAll("tspan")
    //     .data(function (d) { return d.data.title.split(/(?=[A-Z][a-z])|\s+/g) })
    //     .join("tspan")
    //     .attr("x", 5)
    //     .attr("y", function (d, i, nodes) { return `${(i === nodes.length - 1) * 0.3 + 1.1 + i * 0.9}em` })
    //     .text(function (d) { return d; });

    function insertLinebreaks(d) {
        var el = d3.select(this);
        var words = d.data.title.split(' ');
        el.text('');
        var bbox = this.getBBox(),
            cbbox = this.parentNode.getBBox(),
            scale = Math.min(cbbox.width / bbox.width, cbbox.height / bbox.height);

        for (var i = 0; i < words.length; i++) {
            var tspan = el.append('tspan').text(words[i]);
            if (i)
                tspan
                    .attr('x', 0)
                    .attr('dy', cbbox.height / words.length) // should be related to line height
                    .attr('dx', '3px');
            else
                tspan
                    .attr('x', 0)
                    .attr('y', 5)
                    .attr('dy', cbbox.height / (words.length + 1) + 'px') //30
                    .attr('dx', '3px');
        }

        // console.log(d.data.values, d.data.values / percent);

        if (d.data.values / percent > 0.1) {
            var me = d3.select(this);
            var ff = 72;
            me.style('font-size', ff + 'px');
            while (this.getBBox().width + 2 > cbbox.width) {
                me.style('font-size', --ff + 'px');
            }
        }
    }
}
function drawBubble(data, placeholder) {
    placeholder.selectAll('.node').remove();
    var bleed = 10,
        bub_width = 360,
        bub_height = 360;
    // var layout_pack = d3.pack()
    //     .sort(function (a, b) { return d3.descending(a.values, b.values); })
    //     .size([bub_width, bub_height + bleed * 2])
    //     .padding(20)
    //     .value(function (d) { return d.values; });
    var pack = d3.pack().size([bub_width, bub_height]).padding(3);

    var root = pack(
        d3
            .hierarchy({ children: data })
            .sum(d => d.values)
            .sort(function (a, b) {
                return b.values - a.values;
            })
    );
    // .sort(function (a, b) { return d3.descending(a.values, b.values); }))
    // d3.hierarchy(data , function(d) { return d.values; })
    // .sum(i => i.values)
    // var root = placeholder.append("g")
    // .classed("bubble", true);
    // .attr("transform", "translate(70,100)");
    var node = placeholder
        .selectAll('.node')
        // .data(bubblePack.nodes({ children: data }).filter(function (d) { return !d.children; }))
        .data(root.leaves())
        .enter()
        .append('g')
        .attr('class', function (d) {
            return 'node group' + d.data.group;
        })
        .attr('transform', function (d) {
            return 'translate(' + d.x + ',' + d.y + ')';
        })
        .call(
            d3tooltip(
                //!!
                function (event, d) {
                    d3.select('.d3tooltip').style('background-color', d.data.color);
                    // return  '<div style="min-height:100%; height:100%;font-weight:bold;background-color:' + d.color + '">' + d.key + "&nbsp;&nbsp;&nbsp;" + d.values + '</div>';
                    return (
                        '<div style="font-weight:bold;color:' +
                        d.data.textcolor +
                        ';">' +
                        (locale_code ? d.data.key : transliterate(d.data.key)) +
                        (d.data.mark ? ' ' + l8n('labelother') : '&nbsp;&nbsp;&nbsp;' + d.data.values) +
                        '</div>'
                    );
                }
            )
        );

    node
        .append('circle')
        // .attr("id", function (d) {
        //     console.log("d", d);
        //     d.leafUid = d.data.key;
        //     return d.data.key;
        // })
        .style('fill', function (d) {
            return d.data.color;
        })
        .attr('r', function (d) {
            return d.r;
        })
        .attr('class', function (d) {
            return 'bubble';
        })
        .on('mouseover', function (event, d) {
            // d3.select(this).transition()
            // .duration(1000)
            // .attr("d", arcOver);
            d3.selectAll('.dots')
                .filter('*:not(.group' + d.data.group + ')')
                .style('opacity', 0);
            d3.selectAll('.node')
                .filter('*:not(.group' + d.data.group + ')')
                .style('opacity', 0.2);
        })
        .on('mouseout', function (event, d) {
            d3.selectAll('.dots')
                .filter('*:not(.group' + d.data.group + ')')
                .style('opacity', 1);
            d3.selectAll('.node')
                .filter('*:not(.group' + d.data.group + ')')
                .style('opacity', 1);
            // d3.select(this).transition()
            // .duration(1000)
            // .attr("d", pied_arc);
            // d3.selectAll('.citydot').style('opacity', 1);
        });

    node
        .append('text')
        .text(function (d) {
            return (d.data.mark ? '+' : '') + (locale_code ? d.data.key : transliterate(d.data.key));
        })
        .style('font-size', function (d) {
            return Math.min(2 * d.r, ((2 * d.r - 8) / this.getComputedTextLength()) * 24) + 'px';
        })
        .attr('fill', function (d) {
            return d.data.textcolor;
        })
        .style('opacity', 0.54)
        // .attr("stroke-width", "1px")
        // .attr("stroke", "black")
        .attr('dy', '.35em');
    //d3.select(self.frameElement).style("height", height + "px");
}
function colored_cities(data, placeholder, citydot_radius) {
    // var treeData = d3.nest()
    //     .key(function (d) {
    //         return get_old_age(d.est_date);
    //     })
    //     .rollup(function (d) { return d3.sum(d, function (g) { return 1; }); })
    //     .entries(data);
    var treeData = d3
        .groups(data, d => get_old_age(d.est_date))
        .map(function (x) {
            return { key: x[0], values: x[1].length };
        })
        .sort(function (a, b) {
            return a.key - b.key;
        });

    treeData.forEach(function (d) {
        d.title = l8n(old_ages_names[d.key]);
        if (d.title === 'ВКЛ') d.title = 'Вялікае Княства Літоўскае Рускае Жамойцкае';
    });

    drawTreemap(treeData, placeholder, citydot_radius);
}
function cities_after_timer(data, mapholder, placeholder, citydot_radius) {
    // console.log("there");
    mapholder.selectAll('.citydot').style('opacity', 1);

    mapholder.selectAll('.tower').transition().duration(5000).ease(d3.easePolyInOut).style('opacity', 0).remove();

    d3.select('#forobj').transition().duration(5000).ease(d3.easePolyInOut).style('opacity', 0).remove();

    d3.selectAll('.citynames').attr('dy', '-1em');

    colored_cities(data, placeholder, citydot_radius);

    // console.log("wow");
}
function drawPie(data, svg) {
    // Store our chart dimensions
    var pie_innerRadius = 10,
        pie_outerRadius = 120,
        pie_labelRadius = 130;
    var layer = svg.append('g').attr('id', 'pielayer');

    var art = layer
        .append('g')
        .attr('transform', function (d, i) {
            return 'translate(150,200)';
        })
        .attr('class', 'art');

    var labels = layer
        .append('g')
        .attr('transform', function (d, i) {
            return 'translate(150,200)';
        })
        .attr('class', 'labels');

    var pieLayout = d3.pie().value(function (d, i) {
        return d.values;
    });
    var pieData = pieLayout(data);

    arcDefault = d3.arc().innerRadius(pie_innerRadius).outerRadius(pie_outerRadius);

    var arcZer = d3.arc().innerRadius(pie_innerRadius).outerRadius(1);

    arcOver = d3
        .arc()
        .innerRadius(pie_innerRadius)
        .outerRadius(pie_outerRadius + 20);

    // Let's start drawing the arcs.
    art
        .selectAll('.wedge')
        .data(pieData)
        .join('path')
        .style('fill', '#E7E7E7')
        .attr('class', 'wedge')
        .attr('id', function (d, i) {
            return 'arc' + d.data.key;
        })
        .attr('d', arcZer)
        .on('mouseover', function (event, d) {
            if (!lock) {
                d3.select(this).transition().duration(1000).attr('d', arcOver);
                d3.selectAll('.citydot')
                    .filter('*:not(.age' + d.data.key + ')')
                    .style('opacity', 0);
            }
        })
        .on('mouseout', function (event, d) {
            if (!lock) {
                d3.select(this).transition().duration(1000).attr('d', arcDefault);
                d3.selectAll('.citydot').style('opacity', 1);
            }
        })
        .on('click', function (event, d) {
            if (lock) {
                lock = 0;
                d3.selectAll('.wedge')
                    .filter('*:not(#arc' + d.data.key + ')')
                    .classed('pass', false)
                    .style('opacity', 1);
                d3.selectAll('.citydot')
                    .filter('*:not(.age' + d.data.key + ')')
                    .classed('pass', false)
                    .style('opacity', 1);
                d3.selectAll('.label')
                    .filter('*:not(#lbl' + d.data.key + ')')
                    .style('opacity', 1);
            } else {
                lock = 1;
                d3.selectAll('.wedge')
                    .filter('*:not(#arc' + d.data.key + ')')
                    .classed('pass', true)
                    .style('opacity', 0.25);
                d3.selectAll('.citydot')
                    .filter('*:not(.age' + d.data.key + ')')
                    .classed('pass', true)
                    .style('opacity', 0);
                d3.selectAll('.label')
                    .filter('*:not(#lbl' + d.data.key + ')')
                    .style('opacity', 0.25);
            }
        })
        .attr('stroke-width', 0)
        .attr('stroke', 'lightyellow')
        .transition()
        // .delay(1000)
        .duration(2000)
        .ease(d3.easeLinear)
        .attr('d', arcDefault)
        .style('fill', function (d, i) {
            return old_ages_colors[d.data.key];
        })
        .transition()
        // .delay(2000)
        .duration(2000)
        .ease(d3.easeCubic)
        .attr('stroke-width', 9)
        .transition()
        // .delay(2000)
        .duration(1000)
        .ease(d3.easeCubic)
        .attr('stroke-width', 3);

    // Now we'll draw our label lines, etc.
    var enteringLabels = labels.selectAll('.label').data(pieData).enter();

    var labelGroups = enteringLabels
        .append('g')
        .attr('class', 'label')
        .attr('id', function (d, i) {
            return 'lbl' + d.data.key;
        });

    labelGroups
        .append('circle')
        .attr('x', 0)
        .attr('y', 0)
        .attr('r', 2)
        .attr('fill', '#000')
        .attr('transform', function (d, i) {
            centroid = arcDefault.centroid(d);
            return 'translate(' + arcDefault.centroid(d) + ')';
        })
        .attr('class', 'label-circle')
        .style('opacity', 0)
        .transition()
        .delay(function (d, i) {
            return (i + 1) * 1000;
        })
        .duration(1000)
        .ease(d3.easeLinear)
        .style('opacity', 1);

    // "When am I ever going to use this?" I said in 10th grade trig.
    var textLines = labelGroups
        .append('line')
        // .style("stroke", "black") // colour the line
        .classed('label-line', true)
        .attr('x1', function (d, i) {
            return arcDefault.centroid(d)[0];
        }) // x position of the first end of the line
        .attr('y1', function (d, i) {
            return arcDefault.centroid(d)[1];
        }) // y position of the first end of the line
        .attr('x2', function (d, i) {
            return arcDefault.centroid(d)[0];
        }) // x position of the first end of the line
        .attr('y2', function (d, i) {
            return arcDefault.centroid(d)[1];
        }) // y position of the first end of the line
        .transition()
        .delay(function (d, i) {
            return (i + 1) * 1000;
        })
        .duration(1000)
        .ease(d3.easeLinear)
        .attr('x2', function (d, i) {
            centroid = arcDefault.centroid(d);
            midAngle = Math.atan2(centroid[1], centroid[0]);
            x = Math.cos(midAngle) * pie_labelRadius;
            return x;
        })
        .attr('y2', function (d, i) {
            centroid = arcDefault.centroid(d);
            midAngle = Math.atan2(centroid[1], centroid[0]);
            y = Math.sin(midAngle) * pie_labelRadius;
            return y;
        });

    var textLabels = labelGroups
        .append('text')
        .attr('x', function (d, i) {
            centroid = arcDefault.centroid(d);
            midAngle = Math.atan2(centroid[1], centroid[0]);
            x = Math.cos(midAngle) * pie_labelRadius;
            sign = x > 0 ? 1 : -1;
            labelX = x + 5 * sign;
            return labelX;
        })
        .attr('y', function (d, i) {
            centroid = arcDefault.centroid(d);
            midAngle = Math.atan2(centroid[1], centroid[0]);
            y = Math.sin(midAngle) * pie_labelRadius;
            return y;
        })
        .attr('text-anchor', function (d, i) {
            centroid = arcDefault.centroid(d);
            midAngle = Math.atan2(centroid[1], centroid[0]);
            x = Math.cos(midAngle) * pie_labelRadius;
            return x > 0 ? 'start' : 'end';
        })
        .attr('class', 'label-text')
        .style('filter', 'url(#drop-shadow)')
        // .text("|")
        .transition()
        .delay(function (d, i) {
            return (i + 1) * 1000;
        })
        .duration(5000)
        .ease(d3.easeLinear)
        .text(function (d) {
            return l8n(old_ages_names[d.data.key]);
        });

    var alpha = 0.5;
    var spacing = 14;

    function relax() {
        again = false;
        textLabels.each(function (d, i) {
            a = this;
            da = d3.select(a);
            y1 = da.attr('y');
            textLabels.each(function (d, j) {
                b = this;
                // a & b are the same element and don't collide.
                if (a == b) return;
                db = d3.select(b);
                // a & b are on opposite sides of the chart and
                // don't collide
                if (da.attr('text-anchor') != db.attr('text-anchor')) return;
                // Now let's calculate the distance between
                // these elements.
                y2 = db.attr('y');
                deltaY = y1 - y2;

                // Our spacing is greater than our specified spacing,
                // so they don't collide.
                if (Math.abs(deltaY) > spacing) return;

                // If the labels collide, we'll push each
                // of the two labels up and down a little bit.
                again = true;
                sign = deltaY > 0 ? 1 : -1;
                adjust = sign * alpha;
                da.attr('y', +y1 + adjust);
                db.attr('y', +y2 - adjust);
            });
        });
        // Adjust our line leaders here
        // so that they follow the labels.
        if (again) {
            labelElements = textLabels[0];
            textLines.attr('y2', function (d, i) {
                labelForLine = d3.select(labelElements[i]);
                return labelForLine.attr('y');
            });
            // setTimeout(relax,5000)
            relax();
        }
    }
    // relax();
    //setTimeout(relax,5000)
}
function renderStats(label, color_sceheme_num, path, districts, placeholder, head, board, bar, pattern) {
    var cols = {
        labelpop: 'pop',
        labelbeldom: 'home_lang_pc_be',
        labelrusdom: 'home_lang_pc_ru',
        labelbelnat: 'nat_lang_pc_be',
        labelrusnat: 'nat_lang_pc_ru',
    };
    var column = cols[label];
    clean_canvas(placeholder);
    head.text(l8n(label));
    var color_range = colorschemes[color_sceheme_num];
    // var color = d3.scale.ordinal()
    // .domain(["6TH", "7TH", "5TH", "4TH"])
    // .range(colorbrewer.RdBu[4]);
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
    d3.json('/api/districts.json').then(function (districts_db_data) {
        var domainArray = [];
        for (var i in districts_db_data) {
            domainArray.push(Number(districts_db_data[i][column]));
        }

        var qcolor = d3.scaleQuantile().range(color_range);
        var recolorMap = qcolor.domain(domainArray);
        /////////////////////////////////////////////////
        //Define quantile scale to sort data values into buckets of color
        var color = d3.scaleQuantize().range(color_range);
        color.domain([d3.min(domainArray), d3.max(domainArray)]);
        placeholder.selectAll('.district').remove();
        placeholder.select('#legendgroup').remove();

        if (!pattern) {
            var legendgroup = placeholder.append('g').attr('id', 'legendgroup');

            var legend = legendgroup
                .selectAll('g.legendEntry')
                // .data(color.range()) //
                .data(recolorMap.range()) //
                .enter()
                .append('g')
                .attr('class', 'legendEntry')
                .attr('transform', 'translate(60, 50)');

            legend
                .append('rect')
                .attr('x', 0)
                .attr('y', function (d, i) {
                    return i * 20;
                })
                .attr('width', 14)
                .attr('height', 14)
                .style('stroke', 'black')
                .style('stroke-width', 1)
                .style('fill', function (d) {
                    return d;
                });
            //the data objects are the fill colors
            // console.log("!!", title);
            var delim = column === 'pop' ? 1000 : 1;
            var unit = column === 'pop' ? ' ' + l8n('labelthousand') : ' %';

            // LEGEND !!!
            legend
                .append('text')
                .attr('x', 20) //leave 5 pixel space after the <rect>
                .attr('y', function (d, i) {
                    return i * 20;
                })
                .attr('dy', '0.9em') //place text one line *below* the x,y point
                .text(function (d, i) {
                    var extent = color.invertExtent(d);
                    //extent will be a two-element array, format it however you want:
                    // var format = d3.format("0.2f");
                    // return (format(+extent[0]) + "—" + format(+extent[1])).replace(".", ",");
                    var format = d3.format('.0f');
                    // console.log(d, extent);
                    return (
                        format(Math[i ? 'ceil' : 'floor'](extent[0] / delim)) + '…' + format(Math.ceil(extent[1] / delim)) + unit
                    );
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

        placeholder
            .selectAll('.district')
            .data(districts)
            .enter()
            .append('path')
            .attr('stroke-opacity', 1)
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
            // // return recolorMap(districts_db_data[osm].labelbelnat);
            // return recolorMap(districts_db_data[osm].labelbeldom);
            // })
            .style('fill', function (d) {
                // var osm = Math.abs(d.properties["OSM_ID"]);
                var osm = d.properties.id;

                if (pattern) {
                    return districts_db_data[osm][column] > 50 ? 'url(#myPattern)' : 'url(#myPattern2)';
                } else {
                    return recolorMap(districts_db_data[osm][column]);
                }
            })
            // .attr("class", function(d) {
            // var osm = Math.abs(d.properties["OSM_ID"]);
            // return quantize( districts_db_data[osm].pop);
            // })
            .attr('d', path)
            .call(
                d3tooltip(function (event, d) {
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
                    // d3.select('.d3tooltip').style("font", "14px Georgia, serif");
                    // var osm = Math.abs(d.properties["OSM_ID"]);
                    var osm = d.properties.id;

                    var format = d3.format('02.1f');
                    var cdt = districts_db_data[osm];

                    return (
                        '<b>' +
                        // (locale_code ? '': (cdt.name_be + "&nbsp;")) +
                        (locale_code ? cdt.name_be : transliterate(cdt.capital_be)) +
                        '&nbsp;' +
                        l8n('labeldistrict') +
                        // (locale_code ? ("&nbsp;" + transliterate(cdt.capital_be)) : '') +
                        '</b>' +
                        '<br/>' +
                        cdt.pop +
                        '&nbsp;' +
                        l8n('labelpersons') +
                        '<br/>' +
                        l8n('labelnative') +
                        (locale_code ? '&nbsp;&nbsp;&nbsp;' : '&nbsp;') +
                        '<img src="b91.svg" class="small_flag_inline" />' +
                        '&nbsp;' +
                        format(+cdt.nat_lang_pc_be) +
                        '&nbsp;&nbsp;' +
                        '<img src="rf.svg" class="small_flag_inline" />' +
                        '&nbsp;' +
                        format(+cdt.nat_lang_pc_ru) +
                        '<br/>' +
                        l8n('labeldomestic') +
                        (locale_code ? '&nbsp;' : '&nbsp;&nbsp;&nbsp;') +
                        '<img src="b91.svg" class="small_flag_inline" />' +
                        '&nbsp;' +
                        format(+cdt.home_lang_pc_be) +
                        '&nbsp;&nbsp;' +
                        '<img src="rf.svg" class="small_flag_inline" />' +
                        '&nbsp;' +
                        format(+cdt.home_lang_pc_ru)
                    );
                })
            );
    });
}
function renderMagdeburg(projection, placeholder, titler, side, bar, template, quick_mode) {
    clean_canvas(placeholder);
    titler.text(l8n('titlecity'));

    var fo_layer = side
        .append('g')
        .attr('transform', function (d, i) {
            return 'translate(90,20)';
        }) // 90, 20
        .attr('id', 'fo_layer');

    fo_layer
        .append('foreignObject')
        .attr('id', 'forobj')
        // .attr("height", "100%")
        .attr('height', '700px')
        .attr('width', '220px') //320
        .append('xhtml:body')
        // .style("font", "18px 'Book Antiqua'")
        // .append("xhtml:div")
        // .classed("folist", true)
        // .attr("id", "objcity")
        .html("<div xmlns='http://www.w3.org/1999/xhtml' id='objcity' class='folist'></div>");

    var objcity = d3.select('#objcity');

    var after_anim = 0;
    d3.json('/api/cities.json').then(function (grd) {
        var size = 30;
        var begin_size = size * 2.5;

        // var data = d3.nest()
        //     .key(function (d) {
        //         return get_old_age(d.magd_date);
        //     })
        //     .rollup(function (d) { return d3.sum(d, function (g) { return 1; }); })
        //     .entries(grd);

        var data = d3
            .groups(grd, d => get_old_age(d.magd_date))
            .map(function (x) {
                return { key: x[0], values: x[1].length };
            })
            .sort(function (a, b) {
                return a.key - b.key;
            });

        grd.forEach(function (d) {
            d.radius = d.pop;

            if (d.radius > 150) {
                d.radius = 150;
                d.mega = 1;
            }
            d.radius = d.radius / 4;
            d.color = old_ages_colors[get_old_age(d.magd_date)];
        });

        var citydgroup = placeholder.append('g').attr('id', 'citydgroup');

        var categorized = citydgroup.selectAll('.dots').data(grd);
        // .sort(function (a, b) { return d3.descending(a.radius, b.radius); })
        var every = categorized
            .enter()
            .append('g')
            .call(
                d3tooltip(function (event, d) {
                    var hname = d.histname_be ? d.histname_be + ' (' + d.name_be + ')' : d.name_be;
                    return Mustache.render(template, {
                        uri: server_url,
                        img: d.place_id + d.ext,
                        name: L(hname),
                        text_est: l8n('labelest'),
                        text_status: l8n('labelstatus'),
                        text_labelpop: l8n('labelpop'),
                        labelyeardot: l8n('labelyeardot'),
                        text_1k: l8n('labelthousand'),
                        est_date: d.est_date,
                        magd_date: d.magd_date,
                        pop: d.pop,
                        estflag: old_ages_flags[get_old_age(d.est_date)],
                        magdflag: old_ages_flags[get_old_age(d.magd_date)],
                    });
                })
            );

        every
            .append('circle') // d3.select(this.parentNode)
            .style('opacity', 0)
            .style('fill', function (d) {
                return d.color;
            })
            .attr('class', function (d) {
                return 'citydot age' + get_old_age(d.magd_date);
            })
            .attr('cx', function (d) {
                return projection([d.lon, d.lat])[0];
            })
            .attr('cy', function (d) {
                return projection([d.lon, d.lat])[1];
            })
            .attr('r', function (d) {
                return d.radius;
            })
            .attr('stroke-width', function (d) {
                return d.mega ? 12 : 0;
            })
            .attr('stroke', function (d) {
                return d.mega ? d.color : 'none';
            })
            .attr('stroke-dasharray', 4)
            // .attr("stroke-alignment", "outer")
            .on('mouseover', function (event, d) {
                if (after_anim) {
                    var agenum = get_old_age(d.magd_date);
                    if (!lock) {
                        d3.selectAll('.citydot')
                            .filter('*:not(.age' + agenum + ')')
                            .style('opacity', 0);
                        d3.select('#arc' + agenum)
                            .transition()
                            .duration(1000)
                            .attr('d', arcOver);
                    }
                }
            })
            .on('mouseout', function (event, d) {
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
                            .attr('d', arcDefault);
                    }
                }
            });

        if (quick_mode) {
            placeholder
                .selectAll('.citydot')
                .transition()
                .delay(function (d, i) {
                    return i * 30;
                })
                .duration(1000)
                .style('opacity', 1);
            drawPie(data, side);
            after_anim = 1;
        } else {
            every
                .append('svg:image')
                .attr('class', 'dots')
                .attr('width', begin_size)
                .attr('height', begin_size)
                .attr('x', function (d, i) {
                    return projection([d.lon, d.lat])[0] - size / 2;
                })
                .attr('y', function (d, i) {
                    return projection([d.lon, d.lat])[1] - size / 2;
                })
                .transition()
                .delay(function (d, i) {
                    return (d.magd_date - 1390) * 100;
                }) // 100
                // .delay(function(d,i) { return i * 100})
                //.delay(1000)
                .duration(1000) //
                .tween('text', function (d) {
                    bar.text(d.magd_date);
                    // bar_city.text(d.name_be);
                    // console.log(d.magd_date);
                    var name = d.histname_be || d.name_be;
                    push2objlist(objcity, name, d.magd_date, op_color, 2000, 1);
                })
                .call(endall, function () {
                    // console.log("all done");
                    bar.text('');
                    // bar_city.text("");

                    setTimeout(function () {
                        placeholder.selectAll('.citydot').style('opacity', 1);

                        placeholder
                            .selectAll('.dots')
                            .transition()
                            .delay(function (d, i) {
                                return i * 30;
                            })
                            .duration(1000)
                            // .remove();
                            .style('opacity', 0);

                        // select
                        // d3.select("#fo_layer")
                        fo_layer.transition().duration(5000).ease(d3.easePolyInOut).style('opacity', 0).remove();
                        drawPie(data, side);
                        after_anim = 1;
                    }, 3000);
                })
                .style('opacity', 1)
                .attr('xlink:href', function (d, i) {
                    return '/coat/' + d.place_id + d.ext;
                })
                // .attr("x", function (d, i) { return projection([d.lon, d.lat])[0] - (begin_size / 2); })
                // .attr("y", function (d, i) { return projection([d.lon, d.lat])[1] - (begin_size / 2); })
                // .attr("width", begin_size)
                // .attr("height", begin_size)
                .transition()
                .duration(2000)
                .attr('x', function (d, i) {
                    return projection([d.lon, d.lat])[0] - size / 2;
                })
                .attr('y', function (d, i) {
                    return projection([d.lon, d.lat])[1] - size / 2;
                })
                .attr('width', size)
                .attr('height', size);
        }
    });
}
function renderFounding(projection, placeholder, titler, board, bar, template, quick_mode) {
    clean_canvas(placeholder);
    var container = placeholder.append('g').classed('cities', true);
    titler.text(l8n('titlehexbin'));
    d3.json('/api/cities.json').then(function (grd) {
        board
            .append('g')
            .attr('transform', function (d, i) {
                return 'translate(90,20)';
            }) // 90, 20
            .append('foreignObject')
            .attr('id', 'forobj')
            // .attr("height", "100%")
            .attr('height', '700px')
            .attr('width', '220px') //320
            .append('xhtml:body')
            // .style("font", "18px 'Book Antiqua'")
            // .append("xhtml:div")
            // .classed("folist", true)
            // .attr("id", "objcity")
            .html("<div xmlns='http://www.w3.org/1999/xhtml' id='objcity' class='folist'></div>");

        var objcity = d3.select('#objcity');
        grd = grd.sort(function (a, b) {
            return d3.ascending(a.est_date, b.est_date);
        });
        var interval = 100;
        var city_radius = 7;

        // cities_after_timer (grd, placeholder, board, city_radius);
        // return;

        function makeCallback(cur_year, city_num, max) {
            return function () {
                // note that we're returning a new callback function each time
                var cond = true;
                ++cur_year;
                if (!quick_mode) {
                    bar.text(cur_year);
                }
                cur_gor = grd[city_num];

                while (cur_gor.est_date === cur_year) {
                    city_put(container, projection, cur_gor, city_num, objcity, city_radius, template, quick_mode);

                    ++city_num;
                    if (max === city_num) {
                        cond = false;
                        // bar.text("2015");
                        //bar_city.text("");
                        // console.log("here");
                        setTimeout(
                            function () {
                                cities_after_timer(grd, container, board, city_radius);
                            },
                            quick_mode ? 500 : 5000
                        );
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
            };
        }

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
        var amenities = container
            .selectAll('.tower')
            .data(grd)
            .sort(function (a, b) {
                return d3.descending(a.est_date, b.est_date);
            })
            .enter()
            .append('g')
            .call(
                d3tooltip(function (d, i) {
                    return Mustache.render(template, {
                        img: d.place_id + d.ext,
                        name: d.name_be,
                        est_date: d.est_date,
                        magd_date: d.magd_date,
                        pop: d.pop,
                        estflag: old_ages_flags[get_old_age(d.est_date)],
                        magdflag: old_ages_flags[get_old_age(d.magd_date)],
                    });
                })
            )
            .append('svg:image')
            .attr('class', 'tower')
            .transition()
            .delay(function (d, i) {
                return (d.est_date - 862) * 100;
            }) //100
            //.delay(function(d,i) { return i * 100})
            //.delay(1000)
            .duration(100)
            .tween('text', function (d) {
                bar.text(d.est_date);
                act_name = d.histname_be || d.name_be;

                d3.select(this.parentNode)
                    .append('text')
                    .attr('class', 'citynames')
                    .text(act_name)
                    .attr('x', function (d, i) {
                        return projection([d.lon, d.lat])[0];
                    })
                    .attr('y', function (d, i) {
                        return projection([d.lon, d.lat])[1] + size;
                    });
                // console.log("done");

                d3.select(this.parentNode)
                    .append('circle')
                    .style('opacity', 0)
                    .style('fill', function (d) {
                        return old_ages_colors[get_old_age(d.est_date)];
                    })
                    .attr('class', function (d) {
                        return 'citydot age' + get_old_age(d.est_date);
                    })
                    .attr('cx', function (d) {
                        return projection([d.lon, d.lat])[0];
                    })
                    .attr('cy', function (d) {
                        return projection([d.lon, d.lat])[1];
                    })
                    .attr('r', city_radius)
                    .on('mouseover', function (d) {
                        // console.log(JSON.stringify(this));

                        // d3.select(this).style("stroke", "navy");
                        d3.selectAll('.age' + get_old_age(d.est_date)).attr('r', city_radius * 2);
                        // .style("stroke", "navy")
                        // .style("fill", "white");
                    })
                    .on('mouseout', function (d) {
                        d3.selectAll('.age' + get_old_age(d.est_date)).attr('r', city_radius);
                    });
            })

            .style('opacity', 1)
            .attr('xlink:href', 'mdbg.svg')
            .attr('x', function (d, i) {
                return projection([d.lon, d.lat])[0] - begin_size / 2;
            })
            .attr('y', function (d, i) {
                return projection([d.lon, d.lat])[1] - begin_size / 2;
            })
            .attr('width', begin_size)
            .attr('height', begin_size)
            .transition()
            .duration(5000)
            .attr('x', function (d, i) {
                return projection([d.lon, d.lat])[0] - size / 2;
            })
            .attr('y', function (d, i) {
                return projection([d.lon, d.lat])[1] - size / 2;
            })
            .attr('width', size)
            .attr('height', size)

            .call(endall, function () {
                console.log('all done');
                bar.text('862–2015');

                setTimeout(function () {
                    // select
                    container.selectAll('.citydot').style('opacity', 1);

                    container
                        .selectAll('.tower')
                        // .transition()
                        // .duration(1000)
                        .remove();
                    // console.log("wow");
                }, 3000);
            });
    });
}
function renderHexbin(projection, width, height, svg, titler, board, bar, quick) {
    clean_canvas(svg);

    var hexbin = d3.hexbin().size([width, height]).radius(8);

    var radius = d3.scaleSqrt().domain([0, 12]).range([0, 8]);

    var myScale = d3
        .scaleLinear()
        // .domain([new Date(1962, 0, 1), new Date(2006, 0, 1)])
        .domain([1917, 1991])
        .range(['red', 'green']);

    var colorize = myScale.interpolate(d3.interpolateLab);

    titler.text(l8n('titlerendist'));
    var parseDate = d3.timeFormat('%Y').parse;
    d3.json('/api/changes.json').then(function (ren_hg_data) {
        ren_hg_data.forEach(function (d) {
            var p = projection([d.lon, d.lat]);
            (d[0] = p[0]), (d[1] = p[1]);
            // d.ren_date = parseDate(d.ren_date);
            // console.log(JSON.stringify(d));
        });
        // console.log(JSON.stringify(ren_hg_data));

        svg
            .append('g')
            .attr('class', 'hexagons')
            .selectAll('path')
            .data(
                hexbin(ren_hg_data).sort(function (a, b) {
                    return b.length - a.length;
                })
            )
            .enter()
            .append('path')
            .attr('id', function (d) {
                return 'bincell_' + d[0].id;
            })
            // .attr("d", function(d) { return hexbin.hexagon(radius(d.length*2.5)); })
            .attr('d', function (d) {
                return hexbin.hexagon();
            })
            .attr('transform', function (d) {
                return 'translate(' + d.x + ',' + d.y + ')';
            })
            .call(
                d3tooltip(function (event, d) {
                    var num_inbin = d.length;
                    var resultstring = '';
                    d.sort(function (a, b) {
                        return d3.ascending(a.ren_date, b.ren_date);
                    }).forEach(function (d) {
                        // console.log(d.ren_date);
                        //replace("|", ", ")
                        resultstring =
                            resultstring +
                            ' <b>' +
                            d.ren_date +
                            '</b> ' +
                            L(d.name_be) +
                            ' ← ' +
                            L(d.names_pre_be.replace(/\|/g, ', ')) +
                            '<br/>';
                    });

                    // for (var i = 0; i < num_inbin; i++) {

                    // }

                    //console.log(d.length + '::' + JSON.stringify(d));
                    // console.log(JSON.stringify(d));
                    // return num_inbin + '::' + resultstring;
                    return resultstring;
                })
            )
            .style('fill', function (d) {
                return colorize(
                    d3.median(d, function (d) {
                        return +d.ren_date;
                    })
                );
            })
            // .style("fill", function(d) {
            // return colorize(d.length);
            // })
            // .style("fill", "steelblue")
            .attr('class', function (d) {
                return 'bincell';
            });

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
        // -- !!
        // var legend = svg.append("g")
        //     .attr("class", "legend")
        //     .attr("transform", "translate(0,40)")
        //     .chart("HorizontalLegend")
        //     .height(20)
        //     .width(300)
        //     .padding(4)
        //     .boxes(30);

        // legend.draw(colorize);
        // --

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
function renderRenaming(projection, svg, titler, board, bar, quick) {
    clean_canvas(svg);
    titler.text(l8n('titlerenanim'));

    d3.json('/api/changes.json').then(function (grd) {
        board.style('font', "72px 'Soviet Style',  Arial, sans-serif");

        var margin = { top: 20, right: 20, bottom: 30, left: 40 },
            width = 300 - margin.left - margin.right,
            height = 300 - margin.top - margin.bottom;

        var x = d3.scaleBand().rangeRound([0, width]).padding(0.1);

        var y = d3.scaleLinear().range([height, 0]);

        var xAxis = d3.axisBottom(x).tickFormat(formatCurrency);

        var yAxis = d3.axisLeft(y).ticks(10);

        var groot = board.append('g').attr('transform', 'translate(30, 150)').attr('id', 'sovietlayer');

        var ages = [1923, 1938, 1941, 1946, 1954, 1965, 1986, 1991];
        var per = d3
            .scaleThreshold()
            .domain(ages)
            // .range(ages)
            .range([1, 2, 3, 4, 5, 6, 7, 8, 9]);

        function formatCurrency(d) {
            return l8n('labelbeforedot') + ' ' + ages[d - 1];
        }
        // var data = d3.nest()
        //     .key(function (d) {
        //         // p1 1917-1922
        //         // p2 1923-1941
        //         // p3 1941-1945
        //         // p4 1945—1953
        //         // p5 1953—1964
        //         // p6 1964—1991
        //         return per(d.ren_date);
        //     })
        //     .rollup(function (d) { return d3.sum(d, function (g) { return 1; }); })
        //     .entries(grd);
        var data = d3
            .groups(grd, d => per(d.ren_date))
            .map(function (x) {
                return { key: x[0], values: x[1].length };
            })
            .sort(function (a, b) {
                return a.key - b.key;
            });

        data.forEach(function (d) {
            d.values < 5 ? (d.values = 5) : null;
        });

        x.domain(
            data.map(function (d) {
                return d.key;
            })
        );
        var sov_max = d3.max(data, function (d) {
            return d.values;
        });
        y.domain([0, sov_max]);

        function show_soviet_ages() {
            groot
                .append('g')
                .attr('class', 'x rnbc_axis')
                .attr('transform', 'translate(0,' + height + ')')
                .call(xAxis)
                .selectAll('text')
                .style('text-anchor', 'end')
                .attr('dx', '-.8em')
                .attr('dy', '-.6em')
                .attr('transform', 'rotate(-90)');

            groot
                .append('g')
                .attr('class', 'y rnbc_axis')
                .call(yAxis)
                .append('text')
                .attr('transform', 'rotate(-90)')
                .attr('y', 6)
                .attr('dy', '.71em')
                .style('text-anchor', 'end')
                .text(l8n('labelamount'));

            groot
                .selectAll('.renamebarchart')
                .data(data)
                .enter()
                .append('rect')
                .attr('class', 'renamebarchart')
                .attr('id', function (d) {
                    return 'p' + d.key;
                })
                .on('mouseover', function (d) {
                    d3.selectAll('.stars')
                        .filter('*:not(.period' + d.key + ')')
                        // .transition()
                        // .delay(function (d, i) {
                        // return i*10;
                        // })
                        // .duration(500)
                        .style('opacity', 0);
                    d3.select(this).style('fill', 'darkred');
                })
                .on('mouseout', function (d) {
                    d3.selectAll('.stars').style('opacity', 1);
                    d3.select(this).style('fill', 'black');
                })
                .attr('x', function (d) {
                    return x(d.key);
                })
                .attr('width', x.bandwidth())
                //.attr("width", 3)
                .attr('height', 0)
                .attr('y', height)
                //.attr("y", function(d) { return y(d.values); })
                //.attr("height", function(d) { return height - y(d.values); })
                .transition()
                //.duration(1)
                .duration(1500)
                .call(function () {
                    var stick = d3.select('#p6');
                    var st_wi = stick.attr('width');
                    var st_x = stick.attr('x');
                    var delta = 100;
                    var h_delta = height - delta;
                    stick.classed('renamebarchart renamebarchart2', true);

                    groot
                        .append('rect')
                        .attr('class', 'renamebarchart2')
                        .attr('height', 0)
                        .attr('x', st_x)
                        .attr('y', height)
                        .transition()
                        .duration(1500)
                        .ease(d3.easeBounce)
                        .attr('x', st_x)
                        .attr('width', st_wi)
                        .attr('y', delta)
                        .attr('height', h_delta);

                    tr_size = st_wi * 10;

                    var x_shift = +st_x + st_wi / 2;
                    var triangle = d3.symbol().type(d3.symbolTriangle);

                    var tri = groot
                        .append('svg:path')
                        .attr('d', triangle.size(tr_size))
                        // size(tr_size) !!!
                        .attr('transform', 'translate(' + parseInt(x_shift) + ',' + (delta - st_wi / 3) + ')')
                        .style('fill', 'black')
                        .attr('class', 'renamebarchart2')
                        .style('opacity', 0)
                        .transition()
                        .delay(0)
                        .duration(4000)
                        .style('opacity', 1);

                    var st_wi_new = 3;
                    var st_x_new = x_shift - st_wi_new / 2;
                    stick.attr('x', st_x_new);
                    stick.attr('width', st_wi_new);
                    var flaz_wi = width / 3;

                    groot
                        .append('svg:image')
                        .attr('class', 'flag')
                        .attr('xlink:href', 'sov-u-flag.svg')
                        .attr('x', +stick.attr('x') + parseInt(stick.attr('width')))
                        .attr('y', 0)
                        .attr('width', 0)
                        .attr('height', flaz_wi / 2)
                        .transition()
                        .delay(0)
                        .duration(4000)
                        //.style("opacity", 1)
                        .attr('width', flaz_wi);
                })
                .attr('y', function (d) {
                    return y(d.values);
                })
                .attr('height', function (d) {
                    return height - y(d.values);
                });

            d3.selectAll('.renamebarchart2')
                .on('mouseover', function (d, i) {
                    d3.selectAll('.renamebarchart2').style('fill', 'darkred');
                    d3.select('#p6').style('fill', 'darkred');
                    d3.selectAll('.stars')
                        .filter('*:not(.period' + '6' + ')')
                        .style('opacity', 0);
                })
                .on('mouseout', function (d, i) {
                    d3.selectAll('.renamebarchart2').style('fill', 'black');
                    d3.select('#p6').style('fill', 'black');
                    d3.selectAll('.stars').style('opacity', 1);
                });
        }

        var star_duration = quick ? 0 : 2000;
        var size = 15;
        // console.log(grd);

        var stars = svg.append('g').attr('class', 'stars');
        stars
            .selectAll('.stars')
            .data(grd)
            // .sort(function (a, b) { return d3.descending(a.ren_date, b.ren_date); })
            .enter()
            .append('g')
            .call(
                d3tooltip(function (event, d) {
                    return (
                        '<b>' +
                        d.name_be +
                        '</b><br/>' +
                        l8n('labelearlier') +
                        ': ' +
                        d.names_pre_be.replace(/\|/g, ', ') +
                        '<br/>' +
                        l8n('labelyear') +
                        ': ' +
                        d.ren_date
                    );
                })
            )
            .append('svg:image')
            .attr('class', function (d) {
                return 'stars period' + per(d.ren_date);
            })
            .on('mouseover', function (event, d) {
                var timespan = per(d.ren_date);
                d3.selectAll('.stars')
                    .filter('*:not(.period' + timespan + ')')
                    .style('opacity', 0.25);
                d3.select('#p' + timespan).style('fill', 'darkred');
                if (timespan === 6) {
                    d3.selectAll('.renamebarchart2').style('fill', 'darkred');
                }
            })
            .on('mouseout', function (event, d) {
                var timespan = per(d.ren_date);
                d3.selectAll('.stars').style('opacity', 1);
                d3.select('#p' + timespan).style('fill', 'black');
                if (timespan === 6) {
                    d3.selectAll('.renamebarchart2').style('fill', 'black');
                }
            })
            .attr('x', 700)
            .attr('y', 150)
            .transition()
            .delay(function (d, i) {
                if (quick) {
                    return 0;
                } else {
                    // return i * 100;
                    var dif = d.ren_date - 1917;
                    if (dif > 60) {
                        dif = 61;
                    }
                    return dif * 1000;
                }
            })
            .duration(star_duration)
            .tween('showdate', function (d) {
                bar.text(d.ren_date);
            })
            .call(endall, function () {
                console.log('all done');
                bar.text('');
                show_soviet_ages();
            })
            // .style('opacity', 1)
            // .attr("xlink:href", "magd1.svg")
            .attr('xlink:href', 'Communist1.svg')
            .attr('fill', 'pink')
            .attr('x', function (d, i) {
                return projection([d.lon, d.lat])[0] - size / 2;
            })
            .attr('y', function (d, i) {
                return projection([d.lon, d.lat])[1] - size / 2;
            })
            .attr('width', size)
            .attr('height', size);
    });
}
function colores_google(n) {
    var colores_g = [
        '#3366cc',
        '#dc3912',
        '#ff9900',
        '#109618',
        '#990099',
        '#0099c6',
        '#dd4477',
        '#66aa00',
        '#b82e2e',
        '#316395',
        '#994499',
        '#22aa99',
        '#aaaa11',
        '#6633cc',
        '#e67300',
        '#8b0707',
        '#651067',
        '#329262',
        '#5574a6',
        '#3b3eac',
    ];
    return colores_g[n % colores_g.length];
}
function mapdots(projection, svg, board, loaded_data, pack) {
    svg.selectAll('.dots').remove();
    svg.selectAll('.node').remove();
    var datacopy = loaded_data.slice(0);
    var feature = datacopy[0].hasOwnProperty('group') ? 'group' : 'name_be';

    var newdata = d3
        .rollups(
            datacopy,
            v => d3.sum(v, d => 1),
            d => d[feature]
        )
        .map(x => ({ key: x[0], values: x[1] }));
    // var newdata = d3.nest()
    //     .key(function (d) { return d[feature]; })
    //     .rollup(function (d) { return d3.sum(d, function (g) { return 1; }); })
    //     .entries(datacopy);

    var places_qty = newdata.length;
    // console.log("Begin size: " + places_qty);
    var data2bub = newdata;
    var outof = 0;
    var uplimit = 10;
    var upcolor = 'lightgray';

    if (places_qty > uplimit) {
        for (i = 1; ; i++) {
            data2bub = data2bub.filter(function (d) {
                if (d.values != i) {
                    return d;
                }
            });
            cur_size = data2bub.length;
            // console.log( "•" + i + " → items: " + cur_size);
            if (cur_size < uplimit) {
                outof = newdata.filter(function (d) {
                    if (d.values <= i) {
                        return d;
                    }
                }).length;
                data2bub.push({ key: outof, values: i, mark: 1 }); // add array of links to names
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
        d.textcolor = frgb.r * 0.299 + frgb.g * 0.587 + frgb.b * 0.114 > 128 ? '#000000' : '#ffffff'; //186
        colorscheme_hash[d.key] = d.color;
        d.group = d.mark ? uplimit : i + 1;
    });
    var outof_color = colorscheme_hash[outof];

    var m = d3.map(data2bub, function (d) {
        return d.key;
    });

    loaded_data.forEach(function (d, i) {
        // d.color = colors(i);
        if (m.includes(d[feature])) {
            // var item = m.get(d[feature]);
            var item = data2bub[m.indexOf(d[feature])];
            d.color = item.color;
            d.qty = item.values;
            d.group = item.group;
            d.textcolor = item.textcolor;
        } else {
            d.color = upcolor;
            d.qty = 0;
            d.group = uplimit;
            d.textcolor = 'black';
        }
    });

    loaded_data.sort(function (a, b) {
        return d3.ascending(a.qty, b.qty);
    });
    // console.log(JSON.stringify(loaded_data));
    if (true) {
        var radius = 5;
        var dots = svg
            .selectAll('dots')
            .data(loaded_data)
            .enter()
            .append('g')
            .call(
                d3tooltip(function (event, d) {
                    // d3.select('.d3tooltip').style("background-color", colorscheme_hash[d.name_be] || outof_color );
                    d3.select('.d3tooltip').style('background-color', d.color);
                    return (
                        '<div style="color:' +
                        d.textcolor +
                        ';"><b>' +
                        L(d.name_be) +
                        '</b><br/>' +
                        (locale_code ? d.district_be : transliterate(d.capital_be)) +
                        ' ' +
                        l8n('labeldistrict') +
                        '</div>'
                    );
                })
            )
            .append('circle')
            .style('opacity', 0)
            .attr('cx', function (d) {
                return projection([d.lon, d.lat])[0];
            })
            .attr('cy', function (d) {
                return projection([d.lon, d.lat])[1];
            })
            .attr('r', radius)
            .attr('class', function (d) {
                return 'dots group' + d.group;
            })
            .on('mouseover', function (event, d) {
                // d3.select(this).transition()
                // .duration(1000)
                // .attr("d", arcOver);
                d3.selectAll('.dots')
                    .filter('*:not(.group' + d.group + ')')
                    .style('opacity', 0);
                d3.selectAll('.node')
                    .filter('*:not(.group' + d.group + ')')
                    .style('opacity', 0.2);
            })
            .on('mouseout', function (d) {
                d3.selectAll('.dots')
                    .filter('*:not(.group' + d.group + ')')
                    .style('opacity', 1);
                d3.selectAll('.node')
                    .filter('*:not(.group' + d.group + ')')
                    .style('opacity', 1);
                // d3.select(this).transition()
                // .duration(1000)
                // .attr("d", acrDefault);
                // d3.selectAll('.citydot').style('opacity', 1);
            })
            // .style("fill", function(d) {  return colorscheme_hash[d.name_be] || outof_color } )
            .style('fill', function (d) {
                return d.color;
            })

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
            // })
            .transition()
            .delay(function (d, i) {
                return loaded_data.length < 300 ? i * 10 : 0;
            })
            .duration(1250)
            .style('opacity', 1);
    }

    var sortedBubData = data2bub.sort((a, b) => b.values - a.values);
    drawBubble(sortedBubData, board);
}
function pulse() {
    var circle = svg.select('circle');
    (function repeat() {
        circle = circle
            .transition()
            .duration(2000)
            .attr('stroke-width', 20)
            .attr('r', 10)
            .transition()
            .duration(2000)
            .attr('stroke-width', 0.5)
            .attr('r', 20)
            .ease('sine')
            .each('end', repeat);
    })();
}
function clean_canvas(placeholder) {
    lock = 0;
    d3.select('.head').text(l8n('title'));
    placeholder.selectAll('.tower').remove();
    placeholder.selectAll('.citynames').remove();
    placeholder.selectAll('.citydot').remove();

    placeholder.selectAll('.drawline').remove();
    placeholder.selectAll('.dots').remove();
    placeholder.selectAll('.legend').remove();

    placeholder.selectAll('.sq').remove();
    placeholder.selectAll('.node').remove();

    placeholder.selectAll('.hexagons').remove();
    placeholder.selectAll('.bincell').remove();
    placeholder.selectAll('.stars').remove();
    placeholder.select('#pielayer').remove();
    placeholder.select('#sovietlayer').remove();
    placeholder.select('#bar').text('');
    // svg2.selectAll("*").remove();
}
function askdb(svgObject, header, cnv, proj, keyword, title) {
    if (keyword) {
        d3.json('/api/data.json', {
            method: 'post',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                r: keyword,
                b: 3,
            }),
        }).then(data => {
            // console.log(JSON.parse(data.body))
            // })
            // .header('Content-Type', 'application/x-www-form-urlencoded')
            // .post('r=' + keyword + '&b=3', function (error, data) {
            var size = data.length;
            console.log(keyword);
            // console.log(JSON.stringify(data));
            clean_canvas(svgObject);
            if (fulltestingapp) {
                header.text('' + (title ? title : keyword) + ' ⇒ ' + size + '');
            } else {
                header.text('' + (title ? title : keyword));
            }
            if (size > 0) {
                mapdots(proj, svgObject, cnv, data);
            }
        });
    }
}
function loadAbout() {
    d3.text('/about' + locale_code + '.html').then(function (data) {
        d3.select('#ModalAbout').html(data);
        modalAboutLoaded = true;
    });
}
function renderCities(svg, proj, cities) {
    // console.log("render cities");
    var container = svg.append('g').classed('bigcities', true);

    var bigcities = container
        .selectAll('circle')
        .data(cities)
        .enter()
        .append('g')
        .attr('opacity', 0)
        .attr('class', 'bigcity');

    bigcities
        // .append("rect")
        .append('circle')
        .attr('cx', function (d) {
            return proj([d.lon, d.lat])[0];
        })
        .attr('cy', function (d) {
            return proj([d.lon, d.lat])[1];
        })
        // .attr("width", function(d) { return 5;})
        // .attr("height", function(d) { return 5; })
        .attr('r', 8)
        .style('fill', function (d) {
            return 'red';
        });
    // .attr("stroke-width", 1)
    // .attr("stroke", "navy")
    // .attr("stroke-dasharray", '3')

    bigcities
        .append('text')
        // .text(function(d) { return (d.mark?"+":"") + d.key; })
        .text(function (d) {
            return d['name_be'].charAt(0);
        })

        .attr('x', function (d, i) {
            return proj([d.lon, d.lat])[0];
        })
        .attr('y', function (d, i) {
            return proj([d.lon, d.lat])[1];
        })
        .style('font-size', function (d) {
            return Math.min(2 * d.r, ((2 * d.r - 8) / this.getComputedTextLength()) * 24) + 'px';
        })
        .attr('fill', function (d) {
            return 'lightyellow';
        })
        // .style("opacity", 0.54)
        .style('text-anchor', 'middle')
        // .attr("stroke-width", "1px")
        // .attr("stroke", "black")
        .attr('dy', '.35em');
}
function setupPatterns(svg, path, shape) {
    var defs = svg.append('defs');
    // http://bl.ocks.org/cpbotha/5200394
    // create filter with id #drop-shadow
    // height=130% so that the shadow is not clipped
    var filter = defs.append('filter').attr('id', 'drop-shadow').attr('height', '130%');
    // SourceAlpha refers to opacity of graphic that this filter will be applied to
    // convolve that with a Gaussian with standard deviation 3 and store result
    // in blur
    filter.append('feGaussianBlur').attr('in', 'SourceAlpha').attr('stdDeviation', 5).attr('result', 'blur');
    // translate output of Gaussian blur to the right and downwards with 2px
    // store result in offsetBlur
    filter.append('feOffset').attr('in', 'blur').attr('dx', 1).attr('dy', 1).attr('result', 'offsetBlur');
    // overlay original SourceGraphic over translated blurred opacity by using
    // feMerge filter. Order of specifying inputs is important!
    var feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'offsetBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');
    defs.append('path').attr('id', 'land').datum(shape).attr('d', path);
    defs.append('clipPath').attr('id', 'clip').append('use').attr('xlink:href', '#land');
    dwi = 50;
    dhe = 25;
    dwi2 = 45;
    dhe2 = 30;
    defs
        .append('pattern')
        .attr('id', 'myPattern')
        .attr('width', dwi)
        .attr('height', dhe)
        .attr('patternUnits', 'userSpaceOnUse')
        .attr('x', 0)
        .attr('y', 0)
        // .attr("stroke", "black")
        // .attr("stroke-width", "1px")
        // .style("fill", "black")
        .append('svg:image')
        // .attr("xlink:href", "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxMCcgaGVpZ2h0PScxMCc+CiAgPHJlY3Qgd2lkdGg9JzEwJyBoZWlnaHQ9JzEwJyBmaWxsPSd3aGl0ZScgLz4KICA8Y2lyY2xlIGN4PSc0LjUnIGN5PSc0LjUnIHI9JzQuNScgZmlsbD0nYmxhY2snLz4KPC9zdmc+")
        .attr('xlink:href', 'b91.svg')
        // .attr('x',10)
        // .attr('y',0)
        .attr('width', dwi)
        .attr('height', dhe);
    // .style("fill", "black")
    // .attr("stroke", "black")
    // .attr("stroke-width", "1px")
    // .append('path')
    // .attr('fill','none')
    // .attr('stroke','#335553')
    // .attr('stroke-width','3') //M10,55 C15,5 100,5 100,55
    // .attr('d','M0,0 Q10,20  20,10 T 40,0' )
    defs
        .append('pattern')
        .attr('id', 'myPattern2')
        .attr('width', dwi2)
        .attr('height', dhe2)
        .attr('patternUnits', 'userSpaceOnUse')
        .attr('x', 0)
        .attr('y', 0)
        .attr('stroke', 'black')
        .attr('stroke-width', '1px')
        .style('fill', 'black')
        .append('svg:image')
        .attr('xlink:href', 'rf.svg')
        .attr('width', dwi2)
        .attr('height', dhe2)
        .style('fill', 'black')
        .attr('stroke', 'black')
        .attr('stroke-width', '1px');
}
function renderBorders(svg, path, width, height, projection, raw1, raw2) {
    var topo = topojson.feature(raw1, raw1.objects.boundary);
    var topo2 = topojson.feature(raw2, raw2.objects.GEO);
    // var districts = topo.features.filter(function(d) {
    // if (d.properties["ADMIN_LVL"] == "6" && d.properties["NAME"].match(/район/gi))
    // return d;
    // });
    var districts = topo2.features.filter(function (d) {
        return d;
    });
    var country = topo.features.filter(function (d) {
        if (d.properties['ADMIN_LVL'] == '2') return d;
    });
    var boundary = country[0].geometry;
    // var kontur = topojson.merge(belarus, belarus.objects.states.geometries);
    var states = topo.features.filter(function (d) {
        if (d.properties['ADMIN_LVL'] == '4')
            // if (d.properties["ADMIN_LVL"] == "6" && d.properties["NAME"].match(/район/gi))
            return d;
    });

    // Compute the bounds of a feature of interest, then derive scale & translate.
    var b = path.bounds(boundary),
        s = 0.95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
        t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];
    // Update the projection to use computed scale & translate.
    projection.scale(s).translate(t);
    var earth = svg.append('g').attr('class', 'earth');

    earth
        .selectAll('.state')
        .data(states)
        .enter()
        .append('path')
        // .attr('class', function (d) { return 'state ' + d.id; })
        .attr('class', 'state')
        .attr('stroke-opacity', 1)
        .attr('d', path);
    // districts were here
    earth.append('path').datum(boundary).attr('class', 'boundary').attr('stroke-opacity', 1).attr('d', path);
    setupPatterns(svg, path, boundary);
    return districts;
}
function setupMap(files) {
    var [data, data2, data3, template] = files;
    var activeLine;
    const minus = Math.ceil(
        d3.select('.header').node().offsetHeight +
        d3.select('.head').node().offsetHeight +
        d3.select('.footer').node().offsetHeight
    );
    var height = document.documentElement.scrollHeight - minus;
    var docWidth = document.documentElement.scrollWidth;
    var width = docWidth > 800 ? 800 : docWidth;
    // console.log(height, width);
    // var scale = 4200;
    var projection = d3
        .geoMercator()
        // .scale(scale)
        // .translate([width / 2, height / 2])
        // // .rotate([-27.55, 0])
        // // .center([0, 53.916667])
        // .center([27.55, 53.62])
        // .precision(.1);
        // 53.627930, 27.966922
        .scale(1)
        .translate([0, 0]);

    // var path = d3.geo.path().projection(projection);
    var path = d3.geoPath().projection(projection);
    var div = d3.select('.map');
    var new_width = div.style('width');
    // console.log(width, new_width);
    var svg = div
        .append('svg')
        // .attr("width", width)
        .attr('width', new_width)
        .attr('height', height);

    // var head = svg.append('text');
    var head = d3.select('.head');

    // head
    //     .attr("class", "head")
    //     .attr("id", "head")
    //     .attr("x", 10)
    //     .attr("y", 25)
    //     .text(l8n('title'));
    head.text(l8n('title'));

    var board = svg
        .append('g')
        .attr('transform', function (d, i) {
            return 'translate(750,0)';
        })
        .attr('class', 'board');

    var bar = svg
        .append('g')
        .attr('transform', function (d, i) {
            return 'translate(640,60)';
        })
        .attr('class', 'barboard')
        .append('text')
        .attr('class', 'abc')
        .attr('id', 'bar');

    var renderPath = d3
        .line()
        .x(function (d) {
            return d[0];
        })
        .y(function (d) {
            return d[1];
        })
        .curve(d3.curveBasis);

    // !!
    // svg.call(d3.drag().on('dragstart', dragstarted).on('drag', dragged).on('dragend', dragended));

    function dragstarted() {
        activeLine = svg.append('path').datum([]).attr('class', 'drawline');
    }

    function dragged() {
        activeLine.datum().push(d3.mouse(this));
        activeLine.attr('d', renderPath);
    }

    function dragended() {
        activeLine = null;
    }

    // console.log('loaded');
    var districts = renderBorders(svg, path, width, height, projection, data, data2);
    // Mustache.parse(template);   // optional, speeds up future uses
    renderCities(svg, projection, data3);
    if (fulltestingapp) {
        d3.select(window).on('keypress', function (event) {
            var char = String.fromCharCode(event.which);
            if (event.keyCode === 13) {
                console.log('ENTER');
            } else {
                switch (char) {
                    case '0':
                        console.log('clean');
                        clean_canvas(svg);
                        break;
                    case '1':
                        renderFounding(projection, svg, head, board, bar, template, true);
                        break;
                    case '2':
                        renderMagdeburg(projection, svg, head, board, bar, template, true);
                        break;
                    case '3':
                        renderRenaming(projection, svg, head, board, bar, true);
                        break;
                    case '4':
                        renderHexbin(projection, width, height, svg, head, board, bar);
                        break;
                    case '5':
                        // console.log("stat");
                        renderStats('labelbeldom', 9, path, districts, svg, head, board, bar);
                        break;
                    case '6':
                        console.log('stroke');
                        // var dists = d3.selectAll(".district");
                        // var opset = dists.attr("stroke-opacity");
                        // d3.selectAll(".district").attr("stroke-opacity", 0);
                        var di = d3.select('.district');
                        if (!di.empty()) {
                            var bc_op = di.attr('stroke-opacity');
                            console.log(bc_op);
                            bc_op ^= 1;
                            console.log(bc_op);
                            d3.selectAll('.district').attr('stroke-opacity', bc_op);
                        }
                        break;
                    case '7':
                        console.log('stroke');

                        var bc_op = d3.select('.boundary').attr('stroke-opacity');
                        console.log(bc_op);
                        bc_op ^= 1;
                        console.log(bc_op);
                        d3.selectAll('.boundary').attr('stroke-opacity', bc_op);

                        bc_op = d3.select('.state').attr('stroke-opacity');
                        console.log(bc_op);
                        bc_op ^= 1;
                        console.log(bc_op);
                        d3.selectAll('.state').attr('stroke-opacity', bc_op);
                        break;
                    case '9':
                        console.log('bigcity');
                        var bc_op = d3.select('.bigcity').attr('opacity');
                        bc_op ^= 1;
                        d3.selectAll('.bigcity').attr('opacity', bc_op).moveToFront();
                        break;
                    default:
                        console.log('default keypress');
                }
            }
        });
    }

    var handlers = {
        cit_rel: function () {
            tiles_load(svg, projection, width, height);
        },
        cit_wat: function () {
            osm_layer_put(svg, path, '/data/water-polygon.geojson', 'water');
        },
        cit_rail: function () {
            osm_layer_put(svg, path, '/data/rail.geojson', 'rail');
        },
        'navbar-form': function (event) {
            // prevent default browser behaviour
            event.preventDefault();
            askdb(svg, head, board, projection, d3.select('.req').property('value'));
        },
        query: function () {
            var id = /(q\d+)/.exec(d3.select(this).attr('class')).shift();
            askdb(svg, head, board, projection, queries[id].query, d3.select(this).property('text'));
        },
        labelabout: function () {
            if (!modalAboutLoaded) {
                loadAbout();
            }
            $('#ModalAbout').modal('show');
        },
        contacts: function () {
            $('#ModalContacts').modal('show');
        },
        interface_be: function () {
            switchLocale();
        },
        interface_en: function () {
            switchLocale();
        },
        //////////////// extended functions
        labeldensity: function () {
            renderStats('labelpop', 11, path, districts, svg, head, board, bar);
        },
        labelbelnat: function () {
            renderStats('labelbelnat', 6, path, districts, svg, head, board, bar);
        },
        labelrusnat: function () {
            renderStats('labelrusnat', 2, path, districts, svg, head, board, bar);
        },
        labelbeldom: function () {
            renderStats('labelbeldom', 9, path, districts, svg, head, board, bar);
        },
        labelrusdom: function () {
            renderStats('labelrusdom', 5, path, districts, svg, head, board, bar);
        },
        distr_be_ru: function () {
            renderStats('labelbeldom', 9, path, districts, svg, head, board, bar, true);
        },
        labelanim: function () {
            renderRenaming(projection, svg, head, board, bar);
        },
        cit_magd: function () {
            renderMagdeburg(projection, svg, head, board, bar, template);
        },
        cit_hist: function () {
            renderFounding(projection, svg, head, board, bar, template);
        },
        labelhexbin: function () {
            renderHexbin(projection, width, height, svg, head, board, bar);
        },
    };

    for (var key in handlers) {
        d3.selectAll('.' + key).on('click', handlers[key]);
    }
}
function setupApp() {
    // var old_ages_colors_my = ["#3366cc", 	"#dc3912", "#990099", 		"#ffd600", 			"#9e9e9e",  	"#33691e"];
    // var old_ages_colors_orig = ["#3366cc", "#dc3912", "#ff9900", 	"#109618",			 "#990099",  	"#651067", "#3b3eac"
    // //, "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", ",
    // ];

    op_color = d3.select('body').style('background-color');
    colorschemes = [
        ['#edf8e9', '#bae4b3', '#74c476', '#31a354', '#006d2c'], //Define default colorbrewer scheme 0
        ['#D4B9DA', '#C994C7', '#DF65B0', '#DD1C77', '#980043'], //pink orig 1
        ['#edf8fb', '#b3cde3', '#8c96c6', '#8856a7', '#810f7c'], // violet - gray 2
        ['green', '#b3cde3', '#8c96c6', '#8856a7', 'white' /*'#D82028'*/], //custom + green on low 3
        ['#f1eef6', '#bdc9e1', '#74a9cf', '#2b8cbe', '#045a8d'], // blue - gray 4
        ['#f2f0f7', '#cbc9e2', '#9e9ac8', '#756bb1', '#54278f'], // purple-gray, mostly gray 5
        ['#ffffcc', '#c2e699', '#78c679', '#31a354', '#006837'], // kentucky 6
        ['#fff7ec', '#fee8c8', '#fdd49e', '#fdbb84', '#fc8d59', '#ef6548', '#d7301f', '#b30000', '#7f0000'], // 7
        [
            'rgb(255,255,217)',
            'rgb(237,248,177)',
            'rgb(199,233,180)',
            'rgb(127,205,187)',
            'rgb(65,182,196)',
            'rgb(29,145,192)',
            'rgb(34,94,168)',
            'rgb(37,52,148)',
            'rgb(8,29,88)',
        ],
        // deep blue - sea yellow 8
        [op_color /*'#ffffcc'*/, '#a1dab4', '#41b6c4', '#2c7fb8', '#253494'], // navy - green - yellow - ok 9
        [op_color /*"gray" '#fef0d9'*/, '#fdcc8a', '#fc8d59', '#e34a33', '#b30000'], //10
        ['#f7f7f7', '#cccccc', '#969696', '#636363', '#252525'], //11 cool black-white
    ];

    var language = window.navigator.userLanguage || window.navigator.language;
    locale_code = +['ru', 'by', 'uk'].includes(language.split('-').shift())
    console.log(locale_code);

    if (fulltestingapp) {
        d3.select('.extendedcontrols').classed('hidden', false);
    } else {
        d3.text('howto' + locale_code + '.html').then(function (data) {
            d3.select('#ModalHowTo').html(data);
        });
        $('#ModalHowTo').modal('show');
        d3.select('.cit_rel_long').classed('hidden', false);
        d3.select('.basiccontrols').classed('hidden', false);
    }
    d3.json('locale.json').then(function (data) {
        locale = data;
        setLocale();
    });
    Promise.all([
        d3.json('/data/btop.json'),
        d3.json('/data/districts-topo.json'),
        d3.json('/api/top.json'),
        d3.text('tooltip.html'),
    ]).then(function (files) {
        setupMap(files);
    });
}

d3.select(window).on('load', setupApp);
