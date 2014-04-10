function histogram(config) {
    var brush = d3.svg.brush(),
        color = d3.scale.linear(),
        horizontal = d3.scale.linear(),
        vertical = d3.scale.linear(),
        dispatch = d3.dispatch("selected");

    d3.rebind(my, dispatch, "on");

    function my(element, bins) {
        var svg,
            genter,
            plot,
            bars,
            xaxis,
            extent = d3.extent(bins, function(bin) { return bin.x; });

        // Add missing delta
        extent[1] = extent[1] + bins[0].dx;

        horizontal.domain(extent)
            .range([0, config.size.width - 20]);

        color.domain(extent).range(config.colors).interpolate(d3.interpolateHcl);

        vertical.domain([0, d3.max(bins, function(bin) { return bin.y; })])
            .range([config.size.height - 20, 20]);

        svg = d3.select(element)
            .attr("class", "ui-bioplot-histogram")
            .selectAll("svg")
            .data([1]);

        genter = svg.enter()
            .append("svg")
            .append("g")
            .attr("transform", translate(20, 20));

        svg.attr("width", config.size.width + 20)
            .attr("height", config.size.height + 20)

        plot = genter.append("g").attr("class", "bins");

        brush.clear()
            .x(horizontal)
            .on("brush", my.selected(bins));

        genter.append("g").attr("class", "brush");

        svg.select(".brush")
            .call(brush)
            .selectAll("rect").attr("height", config.size.height - 20);

        xaxis = d3.svg.axis().scale(horizontal).orient("bottom");

        genter.append("g").attr("class", "axis");

        svg.select(".axis")
            .attr("transform", translate(0, config.size.height - 20))
            .call(xaxis);

        if (bins.length) {
            bars = svg.select(".bins").selectAll("rect").data(bins);

            bars.enter().append("rect");

            bars.transition()
                .attr("x", function(d) { return horizontal(d.x); })
                .attr("y", function(d) { return vertical(d.y); })
                .attr("fill", function(d) { return color(d.x); })
                .attr("width", function(d) { return horizontal(d.x + d.dx) - horizontal(d.x); })
                .attr("height", function(d) { return vertical.range()[0] - vertical(d.y); });

            bars.exit().remove();
        }
    }

    my.bin = function(data) {
        var horizontal = d3.scale.linear()
            .domain(d3.extent(data))
            .range([0, config.size.width - 20]);

        return d3.layout.histogram()
            .bins(horizontal.ticks(config.bins))(data);
    };

    my.configure = function(configuration) {
        config = configuration || {};
        config.size = config.size || {
            width: 700,
            height: 700
        };
        config.colors = config.colors || ["green", "red", "blue"];
        config.bins = config.bins || 50;
    };

    my.brush = function() {
        return brush;
    };

    my.config = function() {
        return config;
    };

    my.selected = function(bins) {
        return function() {
            var extent = brush.extent();
            var filtered = bins.filter(function(bin) {
                return bin.x <= extent[1] && bin.x >= extent[0];
            });

            dispatch.selected([].concat.apply([], filtered));
        };
    };

    my.configure(config);

    return my;
}
