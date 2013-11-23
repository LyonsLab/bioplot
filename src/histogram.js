function histogram(element, config) {
    var self = this;
    this.element = element;
    this.scales = {
        horizontal: d3.scale.linear(),
        vertical: d3.scale.linear(),
        color: d3.scale.linear().interpolate(d3.interpolateHcl)
    };
    this.bins = [];

    var dispatch = d3.dispatch("selection", "selectionend");
    d3.rebind(this, dispatch, "on");

    this.configure = function (configuration) {
        this.config = configuration || {};
        this.config.size = this.config.size || {
            width: 700,
            height: 700
        };
        this.config.bins = this.config.bins || 50;

        var colors = ["#3fc213", "#123243"];
        this.scales.color.range(colors);

        return self;
    };

    this.render = function() {
        self.svg = d3.select(element).append("svg")
                    .attr("width", self.config.size.width + 20)
                    .attr("height", self.config.size.height + 20)
                    .append("g")
                    .attr("transform", translate(20, 20));

        self.plot = self.svg.append("g").attr("class", "bins");
        self.brush = d3.svg.brush();
        self.selected = self.svg.append("g")
            .attr("class", "brush");

        self.xaxis = self.svg.append("g")
            .attr("class", "axis")
            .attr("transform", translate(0, self.config.size.height - 20));

        return self;
    };

    this.redraw = function() {
        if (!self.bins.length) return;

        var xScale = self.scales.horizontal,
            yScale = self.scales.vertical;


        var labels = self.plot.selectAll("text")
            .data(self.bins);

        labels.enter().append("text");

        labels.transition()
            .text(function(d) { return d.y ? d.y : ""; })
            .style("font-size", function(d) { return Math.min(15, parseInt(xScale(d.dx) - 1)); })
            .attr("text-anchor", "end")
            .attr("transform", function(d) { return transform(xScale(d.x), yScale(d.y) - 5, 90);});

        var bars = self.plot.selectAll("rect")
            .data(self.bins);

        bars.enter().append("rect");

        bars.transition()
            .attr("x", function(d) { return xScale(d.x); })
            .attr("y", function(d) { return yScale(d.y); })
            .attr("color", d3.rgb(self.scales.color).toString())
            .attr("width", function(d) { return xScale(d.dx); })
            .attr("height", function(d) { return yScale.range()[0] - yScale(d.y); });

        bars.exit().remove();

        var axis = d3.svg.axis().scale(xScale).orient("bottom");
        self.xaxis.call(axis);

        self.brush.clear()
            .x(xScale)
            .on("brush", self._onSelectionChange(self.brush))
            .on("brushend", self._onSelectionEnd(self.brush));

        self.selected
            .call(self.brush)
            .selectAll("rect").attr("height", self.config.size.height - 20);
    };

    this.bin = function(data, func) {
        self.scales.horizontal.domain([0, d3.max(data, func)])
            .range([0, self.config.size.width - 20]);

        self.scales.color.domain([0, d3.max(data, func)]);

        self.bins = d3.layout.histogram()
            .value(func)
            .bins(self.scales.horizontal.ticks(self.config.bins))(data);

        self.scales.vertical.domain([0, d3.max(self.bins, function(bin) { return bin.y; })])
            .range([self.config.size.height - 20, 20]);

        return self;
    };

    this._onSelectionEnd = function(brush)  {
        return function() {
            dispatch.selectionend(brush.empty());
        };
    };

    this._onSelectionChange = function(brush) {
        return function() {
            var extent = brush.empty() ? self.scales.horizontal.domain() : brush.extent();

            var filtered = self.bins.filter(function(bin) {
                return bin.x <= extent[1] && bin.x >= extent[0];
            });

            dispatch.selection([].concat.apply([], filtered));
        };
    };

    d3.select(this.element).attr("class", "ui-bioplot-histogram");
    this.configure(config);
}
