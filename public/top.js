var fulltestingapp = 1;
// var locale_code = 1; // 'en';
var locale_code = 0; // 'en';
var server_url = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '') + '/';

var old_ages = [1250, 1569, 1772, 1917, 1991, 2015];
var old_ages_flags = ['ori.svg', 'gdl-flag.svg', 'rp-flag.svg', 're-flag.svg', 'sov-u-flag.svg', 'bel-flag.svg'];
var old_ages_names = ['ruthenia', 'vkl', 'korona', 'rmn', 'su', 'by'];
var old_ages_colors = ['#377eb8', '#e41a1c', '#ff7f00',/*'#ffff33' '#f781bf'*/ '#a65628', '#984ea3', '#4daf4a'];

// var old_ages_colors_my = ["#3366cc", 	"#dc3912", "#990099", 		"#ffd600", 			"#9e9e9e",  	"#33691e"];
// var old_ages_colors_orig = ["#3366cc", "#dc3912", "#ff9900", 	"#109618",			 "#990099",  	"#651067", "#3b3eac"
// //, "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", ",
// ];


var apptext = {
    locale: ['be', 'en'],
    ruthenia: ['Даўняя Русь', 'Old Ruthenia'],
    vkl: ['ВКЛ', 'GDL'],
    //  Grand Duchy of Lithuania, Ruthenia and Samogitia
    korona: ['Польская Карона', 'Kingdom of Poland'],
    //''Res Publica Serenissima''
    // Polish–Lithuanian Commonwealth, formally the Kingdom of Poland and the Grand Duchy of Lithuania, after 1791 the Commonwealth of Polan
    rmn: ['Расійская імперыя', 'Russian Empire'],
    su: ['Савецкі Саюз', 'Soviet Union'],
    by: ['Беларусь', 'Belarus'],

    home_lang_pc_be: ["Беларуская мова дома", "Belarusian as Domestic"],
    nat_lang_pc_be: ["Беларуская мова родная", "Belarusian as Native"],
    home_lang_pc_ru: ["Руская мова дома", "Russian as Domestic"],
    nat_lang_pc_ru: ["Руская мова родная", "Russian as Native"],
    pop: ["Шчыльнасць насельніцтва", "Population Density"],

    city_status: ["Атрыманне статусу горада", "Status of a City (Borough)"],
    city_est: ["Гісторыя заснавання гарадоў", "History of Establishing Cities"],
    ren_hex: ["Перайменаванні савецкага перыяду: размеркаванне", "Renamings of Soviet age: distribution"],
    ren_chr: ["Перайменаванні савецкага перыяду: храналогія", "Renamings of Soviet age: chronology"],
    title: ["Назвы маёй краіны", "Place Names of Belarus"],
    ren_amount: ["Колькасць перайменаванняў", "Amount of Renamings"],
    raion: ["раён", "district"],
    earlr: ["Раней", "Earlier"],
    persons: ["чалавек", "persons"],
    thsnd: ["тыс", "th."],
    bef: ["да", "bef."],
    oth: ["іншых", "other"],
    ntv: ["Родная", "Native"],
    dmst: ["Дома", "Domestic"],
    yr: ["Год", "Year"],
    yrdot: ["г.", "yr."], // A.D.
    estd: ["Заснаваны", "Established"],
    sttus: ["Статус горада", "City status"],
    ppshn: ["Насельніцтва", "Population"]
};


function l8n(property) {
    // console.info(property);
    return apptext[property][locale_code];
}

function L(s) {
    return locale_code ? transliterate(s) : s;
}
// Array.apply(0, Array(3)).map(function (x, y) { return y + 1; });	
var get_old_age = d3.scale.threshold()
    .domain(old_ages)
    // // .range(ages)
    .range([0, 1, 2, 3, 4, 5, 6, 7]);

function colores_google(n) {
    var colores_g = ["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac"];
    return colores_g[n % colores_g.length];
}


d3.selection.prototype.moveToFront = function () {
    return this.each(function () {
        this.parentNode.appendChild(this);
    });
};


// function rotateBarChartLabels() {
// d3.selectAll('div#totals-bar-chart > svg > g > .axis.x > .tick.major > text')
// // rotate bar chart labels so they don't overlap
// .attr("transform", function(d) { return "rotate(20, -5, 50)"; });
// };

// accepted
// Your answer will work, but for posterity, these methods are more generic.

// Remove all children from HTML:

// d3.select("div.parent").html("");
// Remove all children from SVG/HTML:

// d3.select("g.parent").selectAll("*").remove();

function transliterate(word) {
    var a = { "Ё": "Yo", "Й": "I", "Ц": "Ts", "У": "U", "К": "K", "Е": "E", "Н": "N", "Г": "G", "Ш": "Sh", "Щ": "Sch", "З": "Z", "Х": "H", "Ъ": "'", "ё": "yo", "й": "i", "ц": "ts", "у": "u", "к": "k", "е": "e", "н": "n", "г": "g", "ш": "sh", "щ": "sch", "з": "z", "х": "kh", "ъ": "'", "Ф": "F", "Ы": "I", "В": "V", "А": "A", "П": "P", "Р": "R", "О": "O", "Л": "L", "Д": "D", "Ж": "Zh", "Э": "E", "ф": "f", "ы": "y", "в": "v", "а": "a", "п": "p", "р": "r", "о": "o", "л": "l", "д": "d", "ж": "zh", "э": "e", "Я": "Ya", "Ч": "Ch", "С": "S", "М": "M", "И": "I", "Т": "T", "Ь": "'", "Б": "B", "Ю": "Yu", "я": "ya", "ч": "ch", "с": "s", "м": "m", "и": "i", "т": "t", "ь": "", "б": "b", "ю": "yu", "ў": "w", "’": "y", "і": "i", "І": "I", "-": "‒" }; // " ":"∙"
    return word.split('').map(function (char) {
        // return a[char] || char; 
        return (typeof (a[char]) !== 'undefined') ? a[char] : char;
    }).join("").replace("we", "wye").replace("oi", "oy").replace("ei", "ey");
}


var op_color = "yellow";
var colorschemes;


$(function () {
    op_color = d3.select('body').style("background-color");
    colorschemes = [
        ["#edf8e9", "#bae4b3", "#74c476", "#31a354", "#006d2c"], //Define default colorbrewer scheme 0
        ["#D4B9DA", "#C994C7", "#DF65B0", "#DD1C77", "#980043"], //pink orig 1
        ['#edf8fb', '#b3cde3', '#8c96c6', '#8856a7', '#810f7c'], // violet - gray 2
        ['green', '#b3cde3', '#8c96c6', '#8856a7', 'white' /*'#D82028'*/], //custom + green on low 3
        ['#f1eef6', '#bdc9e1', '#74a9cf', '#2b8cbe', '#045a8d'], // blue - gray 4
        ['#f2f0f7', '#cbc9e2', '#9e9ac8', '#756bb1', '#54278f'], // purple-gray, mostly gray 5
        ["#ffffcc", "#c2e699", "#78c679", "#31a354", "#006837"], // kentucky 6
        ["#fff7ec", "#fee8c8", "#fdd49e", "#fdbb84", "#fc8d59", "#ef6548", "#d7301f", "#b30000", "#7f0000"], // 7
        ['rgb(255,255,217)', 'rgb(237,248,177)', 'rgb(199,233,180)', 'rgb(127,205,187)', 'rgb(65,182,196)', 'rgb(29,145,192)', 'rgb(34,94,168)', 'rgb(37,52,148)', 'rgb(8,29,88)'],
        // deep blue - sea yellow 8
        [op_color /*'#ffffcc'*/, '#a1dab4', '#41b6c4', '#2c7fb8', '#253494'], // navy - green - yellow - ok 9	
        [op_color /*"gray" '#fef0d9'*/, '#fdcc8a', '#fc8d59', '#e34a33', '#b30000'],  //10
        ['#f7f7f7', '#cccccc', '#969696', '#636363', '#252525'], //11 cool black-white
    ];

    var activeLine;

    var template = d3.select("#template").html();
    // Mustache.parse(template);   // optional, speeds up future uses
    var height = 690;
    var width = 800;
    var scale = 4200;

    var projection = d3.geo.mercator()
        // .scale(scale)
        // .translate([width / 2, height / 2])
        // // .rotate([-27.55, 0])
        // // .center([0, 53.916667])
        // .center([27.55, 53.62])
        // .precision(.1);
        // 53.627930, 27.966922
        .scale(1)
        .translate([0, 0]);

    var path = d3.geo.path().projection(projection);

    // var map = void 0;
    // var belarus = void 0;
    // var states = void 0;

    var new_width = d3.select("#map").style("width");
    var svg = d3.select("#map")
        .append("svg")
        // .attr("width", width)
        .attr("width", new_width)
        .attr("height", height);

    var board = svg.append("g")
        .attr("transform", function (d, i) { return "translate(800,0)"; })
        .attr('class', 'board');

    var head = d3.select("#head");
    head.text(l8n('title'));

    var bar = svg.append("g")
        .attr("transform", function (d, i) { return "translate(640,60)"; })
        .attr('class', 'barboard')
        .append("text")
        .attr('class', 'abc')
        .attr('id', 'bar');

    // bar_city = svg.append("g")
    // .attr("transform", function(d, i) { return "translate(600,110)"; })
    // .append("text")
    // .attr('class', 'bar_city');

    var renderPath = d3.svg.line()
        .x(function (d) { return d[0]; })
        .y(function (d) { return d[1]; })
        .interpolate("basis");

    svg.call(d3.behavior.drag()
        .on("dragstart", dragstarted)
        .on("drag", dragged)
        .on("dragend", dragended));

    function dragstarted() {
        activeLine = svg.append("path").datum([]).attr("class", "drawline");
    }

    function dragged() {
        activeLine.datum().push(d3.mouse(this));
        activeLine.attr("d", renderPath);
    }

    function dragended() {
        activeLine = null;
    }

    function askdb(keyword, title) {
        if (keyword) {
            d3.json("/data.js")
                .header("Content-Type", "application/x-www-form-urlencoded")
                .post("r=" + keyword + "&b=3", function (error, data) {
                    var size = data.length;
                    console.log(keyword);
                    // console.log(JSON.stringify(data));
                    clean_canvas(svg);
                    if (fulltestingapp) {
                        head.text("" + (title ? title : keyword) + ' → ' + size + '');
                    } else {
                        head.text("" + (title ? title : keyword));
                    }
                    if (size > 0) {
                        mapdots(projection, svg, board, data);
                    }
                });
        }
    }

    // d3.json('admgeo.json.geojson', function(data) {
    // d3.json('btop.json', function(data) {	  
    function loadReady(_error, data, data2) {
        if (_error) { console.log(_error); }

        var topo = topojson.feature(data, data.objects.boundary);
        var topo2 = topojson.feature(data2, data2.objects.GEO);

        // var districts = topo.features.filter(function(d) {
        // if (d.properties["ADMIN_LVL"] == "6" && d.properties["NAME"].match(/район/gi)) 
        // return d;
        // });

        var districts = topo2.features.filter(function (d) {
            return d;
        });

        belarus = topo.features.filter(function (d) {
            if (d.properties["ADMIN_LVL"] == "2")
                return d;
        });
        var kontur = belarus[0].geometry;

        // var kontur = topojson.merge(belarus, belarus.objects.states.geometries);

        var states = topo.features.filter(function (d) {
            if (d.properties["ADMIN_LVL"] == "4")
                // if (d.properties["ADMIN_LVL"] == "6" && d.properties["NAME"].match(/район/gi)) 
                return d;
        });
        /////////////////////////////////////////////////////////////////////////////////////
        // Compute the bounds of a feature of interest, then derive scale & translate.
        var b = path.bounds(kontur),
            s = .95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
            t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

        // Update the projection to use computed scale & translate.
        projection
            .scale(s)
            .translate(t);

        ///////////////////////////////////////////////////////////////////////////////////////////////////////


        var outlinegroup = svg.append('g').attr("id", "outlinegroup");

        // svg.selectAll('.state')
        outlinegroup.selectAll('.state')
            .data(states)
            .enter()
            .append('path')
            // .attr('class', function (d) { return 'state ' + d.id; })
            .attr('class', 'state')
            .attr("stroke-opacity", 1)
            .attr('d', path);
        // districts were here
        outlinegroup.append('path')
            .datum(kontur)
            .attr('class', 'boundary')
            .attr("stroke-opacity", 1)
            .attr('d', path);


        /////////////
        d3.json('topct.js', function (cities) {

            var bigcities = svg.selectAll("circle")
                .data(cities)
                .enter()
                .append("g")
                .attr("opacity", 0)
                .attr('class', 'bigcity');

            bigcities
                // .append("rect")
                .append("circle")
                .attr("cx", function (d) { return projection([d.lon, d.lat])[0]; }) // --> x
                .attr("cy", function (d) { return projection([d.lon, d.lat])[1]; })
                // .attr("width", function(d) { return 5;})
                // .attr("height", function(d) { return 5; })
                .attr("r", 8)
                .style("fill", function (d) {
                    return "red"
                        // "lightyellow"
                        // "black" 

                        // op_color
                        ;
                })
                // .attr("stroke-width", 1)
                // .attr("stroke", "navy")
                // .attr("stroke-dasharray", '3')
                ;

            bigcities.append("text")
                // .text(function(d) { return (d.mark?"+":"") + d.key; })
                .text(function (d) { return d['name_be'].charAt(0) })

                .attr("x", function (d, i) { return projection([d.lon, d.lat])[0] })
                .attr("y", function (d, i) { return projection([d.lon, d.lat])[1] })
                .style("font-size", function (d) { return Math.min(2 * d.r, (2 * d.r - 8) / this.getComputedTextLength() * 24) + "px"; })
                .attr("fill", function (d) { return "lightyellow" })
                // .style("opacity", 0.54)
                .style("text-anchor", "middle")
                // .attr("stroke-width", "1px")
                // .attr("stroke", "black")
                .attr("dy", ".35em");
        });
        ///////////////////////////////////////
        var tile = d3.geo.tile()
            .scale(projection.scale() * 2 * Math.PI)
            .translate(projection([0, 0]))
            .size([width, height])
            .zoomDelta((window.devicePixelRatio || 1) - .5)
            ;

        var tiles = tile();
        var defs = svg.append("defs");

        // http://bl.ocks.org/cpbotha/5200394

        // create filter with id #drop-shadow
        // height=130% so that the shadow is not clipped
        var filter = defs.append("filter")
            .attr("id", "drop-shadow")
            .attr("height", "130%");

        // SourceAlpha refers to opacity of graphic that this filter will be applied to
        // convolve that with a Gaussian with standard deviation 3 and store result
        // in blur
        filter.append("feGaussianBlur")
            .attr("in", "SourceAlpha")
            .attr("stdDeviation", 5)
            .attr("result", "blur");

        // translate output of Gaussian blur to the right and downwards with 2px
        // store result in offsetBlur
        filter.append("feOffset")
            .attr("in", "blur")
            .attr("dx", 1)
            .attr("dy", 1)
            .attr("result", "offsetBlur");

        // overlay original SourceGraphic over translated blurred opacity by using
        // feMerge filter. Order of specifying inputs is important!
        var feMerge = filter.append("feMerge");

        feMerge.append("feMergeNode")
            .attr("in", "offsetBlur")
        feMerge.append("feMergeNode")
            .attr("in", "SourceGraphic");

        ///////////////////////////////////////////
        defs.append("path")
            .attr("id", "land")
            .datum(kontur)
            .attr("d", path);
        defs.append("clipPath")
            .attr("id", "clip")
            .append("use")
            .attr("xlink:href", "#land");


        dwi = 50;
        dhe = 25;
        dwi2 = 45;
        dhe2 = 30;
        defs.append("pattern")
            .attr('id', 'myPattern')
            .attr("width", dwi)
            .attr("height", dhe)
            .attr('patternUnits', "userSpaceOnUse")
            .attr("x", 0).attr("y", 0)
            // .attr("stroke", "black")
            // .attr("stroke-width", "1px")
            // .style("fill", "black")
            .append('svg:image')
            // .attr("xlink:href", "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxMCcgaGVpZ2h0PScxMCc+CiAgPHJlY3Qgd2lkdGg9JzEwJyBoZWlnaHQ9JzEwJyBmaWxsPSd3aGl0ZScgLz4KICA8Y2lyY2xlIGN4PSc0LjUnIGN5PSc0LjUnIHI9JzQuNScgZmlsbD0nYmxhY2snLz4KPC9zdmc+")
            .attr("xlink:href", "b91.svg")
            // .attr('x',10)
            // .attr('y',0)
            .attr("width", dwi)
            .attr("height", dhe)
            // .style("fill", "black")
            // .attr("stroke", "black")
            // .attr("stroke-width", "1px")
            // .append('path')
            // .attr('fill','none')
            // .attr('stroke','#335553')
            // .attr('stroke-width','3') //M10,55 C15,5 100,5 100,55
            // .attr('d','M0,0 Q10,20  20,10 T 40,0' )
            ;
        defs.append("pattern")
            .attr('id', 'myPattern2')
            .attr("width", dwi2)
            .attr("height", dhe2)
            .attr('patternUnits', "userSpaceOnUse")
            .attr("x", 0).attr("y", 0)
            .attr("stroke", "black")
            .attr("stroke-width", "1px")
            .style("fill", "black")
            .append('svg:image')
            .attr("xlink:href", "rf.svg")
            .attr("width", dwi2)
            .attr("height", dhe2)
            .style("fill", "black")
            .attr("stroke", "black")
            .attr("stroke-width", "1px")
            ;


        load_about(); // do load about
        // do hotkeys	
        // enable_hotkeys();

        var queries = {
            iszki: 'ишки$',
            q8: 'овка$#щина$',
            q6: '^лях#^лит#^москал#^ятв#^рус#кривич',
            q2: 'Пролет#Красн#Октяб#Коммун#Совет#Ленин#киров#дзержин#калинин#ворошилов#чапаев',
            q5: 'нов[аяоый]{2}',
            q4: 'велик|больш#мал',
            q10: 'яскевич',
            q9: 'вичи$',
            q3: 'болот',
            q7: 'ье$',
            q11: 'бобр#барсук',
            q13: 'виш.?н#малин',
            q12: 'бел',
            q14: 'ре[кч]#озер',
            q15: '^ив[^а]#^лоз#^верб',
            q16: 'гора|горк|горье',
            q17: 'село',
            q18: 'город',
            q19: '@красн#чырв',
            q20: 'овка$',

        };


        if (fulltestingapp) {
            $(document).keypress(function (event) {
                var curchar = String.fromCharCode(event.which);

                if (curchar === '9') {
                    col("bigcity");
                    var bc_op = d3.select(".bigcity").attr("opacity");
                    bc_op ^= 1;
                    d3.selectAll(".bigcity").attr("opacity", bc_op)
                        .moveToFront();
                }

                if (curchar === '7') {
                    col("stroke");
                    // var dists = d3.selectAll(".district");
                    // var opset = dists.attr("stroke-opacity");
                    // d3.selectAll(".state").attr("stroke-opacity", 0);
                    // d3.selectAll(".boundary").attr("stroke-opacity", 0);

                    var bc_op = d3.select(".boundary").attr("stroke-opacity");
                    col(bc_op);
                    bc_op ^= 1;
                    col(bc_op);
                    d3.selectAll(".boundary").attr("stroke-opacity", bc_op);

                    bc_op = d3.select(".state").attr("stroke-opacity");
                    col(bc_op);
                    bc_op ^= 1;
                    col(bc_op);
                    d3.selectAll(".state").attr("stroke-opacity", bc_op);

                }
                if (curchar === '6') {
                    col("stroke");
                    // var dists = d3.selectAll(".district");
                    // var opset = dists.attr("stroke-opacity");
                    // d3.selectAll(".district").attr("stroke-opacity", 0);
                    var di = d3.select(".district");
                    if (!di.empty()) {
                        var bc_op = di.attr("stroke-opacity");
                        col(bc_op);
                        bc_op ^= 1;
                        col(bc_op);
                        d3.selectAll(".district").attr("stroke-opacity", bc_op);
                    }

                }
                if (curchar === '5') {
                    // col("stat"); 			
                    belarus_districts_stat('home_lang_pc_be', 9, path, districts, svg, head, board, bar);
                }
                if (curchar === '4') {
                    // col("hexbin"); 			
                    hexbin_renaming(projection, width, height, svg, head, board, bar);
                }
                if (curchar === '3') {
                    // col("renaming"); 			
                    viz_renaming(projection, svg, head, board, bar, true);
                }
                if (curchar === '2') {
                    // col("magdeburg"); 
                    magdeburg(projection, svg, head, board, bar, template, true);
                }
                if (curchar === '1') {
                    // col("cities"); 
                    anno_urbis_conditae(projection, svg, head, board, bar, template, true);
                }
                if (curchar === '0') {
                    col("clean");
                    clean_canvas(svg);
                }
            });



            $('#distr_pop').click(function () {
                belarus_districts_stat('pop', 11, path, districts, svg, head, board, bar);
            });
            $('#nat_lang_pc_be').click(function () {
                belarus_districts_stat('nat_lang_pc_be', 6, path, districts, svg, head, board, bar);
            });
            $('#nat_lang_pc_ru').click(function () {
                belarus_districts_stat('nat_lang_pc_ru', 2, path, districts, svg, head, board, bar);
            });
            $('#home_lang_pc_be').click(function () {
                belarus_districts_stat('home_lang_pc_be', 9, path, districts, svg, head, board, bar);
            });
            $('#home_lang_pc_ru').click(function () {
                belarus_districts_stat('home_lang_pc_ru', 5, path, districts, svg, head, board, bar);
            });
            $('#distr_be_ru').click(function () {
                belarus_districts_stat('home_lang_pc_be', 9, path, districts, svg, head, board, bar, true);
            });

            $('#cit_ren').click(function (e) {
                viz_renaming(projection, svg, head, board, bar);
            });
            $('#cit_magd').click(function () {
                magdeburg(projection, svg, head, board, bar, template);
            });
            $('#cit_hist').click(function () {
                anno_urbis_conditae(projection, svg, head, board, bar, template);
            });
            $('#cit_hex').click(function () {
                hexbin_renaming(projection, width, height, svg, head, board, bar);
            });

        } /////////////////////////// false
        $('#cit_rel').click(function () {
            tiles_load(svg, tiles);
        });
        $('#cit_wat').click(function () { // 'water-line.geojson'
            osm_layer_put(svg, path, 'water-polygon.geojson', 'water');
        });
        $('#cit_rail').click(function () {
            osm_layer_put(svg, path, 'rail.geojson', 'rail');
        });

        $('.navbar-form').submit(function (event) {
            // prevent default browser behaviour
            event.preventDefault();
            askdb($('#req').val());
        });

        $('.query').click(function () {
            askdb(queries[$(this).attr('id')], $(this).text());
        });

        $("#about").click(function () {
            $("#myModal").modal('show');
        });
        $("#contacts").click(function () {
            $("#ModalContacts").modal('show');
        });

        $('#interface_be').click(function () {
            locale_code = 0;
        });

        $('#interface_en').click(function () {
            switch2en();
        });


    }

    // var q = queue()
    // .defer(d3.json, "/mbostock/raw/4090846/world-110m.json")
    // .defer(d3.tsv, "/mbostock/raw/4090846/world-country-names.tsv");

    // q.await(ready);


    // function ready(error, world, names) {
    // if (error) {
    // alert('error: ' + error);
    // return ;
    // } 
    queue()
        .defer(d3.json, "btop.json")
        .defer(d3.json, "districts-topo.json")
        .await(loadReady);


});

$(window).load(function () {
    if (!fulltestingapp) {
        $("#ModalHowTo").modal('show');
    }
});

function switch2en() {
    locale_code = 1;
    $('#btn_query').html("Query");
    $('#contacts').html("Contacts");
    $('#about').html("About project");
    $('#lang_choice').html("Language");
    $('#cit_hist_label').html("Cities");
    $('#cit_magd_label').html("Boroughs");
    $('#glaze').html("«Glaze»");
    $('#names_label').html("Names");
    $('#cit_ren').html("Chronology");
    $('#cit_hex').html("«Hexbin»");
    $('#cit_rel_label').html("Relief");
    $('#cit_rail_label').html("Railways");
    $('#cit_wat_label').html("Water");
    $('#cit_queries_label').html("Queries");
    $('#req').attr("placeholder", "Type here to search...");

    $('#cit_queries_label').html("Queries");

    $('#home_lang_pc_be').html(l8n('home_lang_pc_be'));
    $('#home_lang_pc_ru').html(l8n('home_lang_pc_ru'));

    $('#nat_lang_pc_be').html(l8n('nat_lang_pc_be'));
    $('#nat_lang_pc_ru').html(l8n('nat_lang_pc_ru'));

    $('#distr_pop').html(l8n('pop'));

    load_about();

}

function load_about() {
    $.ajax({
        url: "/about" + locale_code + ".txt",
        cache: false,
        success: function (resp) {
            $('#div_about').html(resp);
        },
    });
}

