function dotplot(element, config) {
    var self = this,
        dispatch = d3.dispatch("coordinates", "zoom");

    d3.rebind(this, dispatch, "on");

    this.element = element;
    this.scales = {
        horizontal: d3.scale.linear(),
        vertical: d3.scale.linear()
    };
    this.regions = {};

    this.configure = function(configuration) {
        this.config = configuration || {};

        this.config.size = this.config.size || {
            width: 700,
            height: 700
        };
        this.config.padding = this.config.padding || {
            top : this.config.title ? 40 : 20,
            right : 40,
            bottom : this.config.xlabel ? 50 : 20,
            left : this.config.ylabel ? 50 : 20
        };
        this.config.extent = this.config.extent || {
            default: {
                vertical: [0, this.config.size.width],
                horizontal: [0, this.config.size.width]
            }
        };

        this.coordinates(this.config.coordinates || "default");
    };

    this.render = function () {
        var vwidth = self.config.size.width + self.config.padding.left + self.config.padding.right,
            vheight = self.config.size.height + self.config.padding.top + self.config.padding.bottom;

        self.viewport = d3.select(self.element).append("svg")
            .attr("width",  vwidth)
            .attr("height", vheight)
            .style("z-index", 1)
            .append("g")
            .attr("transform", translate(self.config.padding.left,
                    self.config.padding.top));


        self.view = self.viewport.append("g")
            .attr("transform", translate(5, 5))
            .append("rect")
            .attr("width", self.config.size.width)
            .attr("height", self.config.size.height)
            .attr("pointer-events", "all");

        if (self.config.title) {
            self.viewport.append("text")
                .attr("class", "axis")
                .text(self.config.title)
                .attr("x", self.config.size.width / 2)
                .attr("dy", "-1em")
                .style("text-anchor", "middle");
        }

        if (self.config.xlabel) {
            self.viewport.append("text")
                .attr("class", "axis x")
                .text(self.config.xlabel)
                .attr("x", self.config.size.width / 2)
                .attr("y", self.config.size.height)
                .attr("dy", "2.5em")
                .style("text-anchor", "middle");
        }

        if (self.config.ylabel) {
            self.viewport.append("text")
                .attr("class", "axis y")
                .text(self.config.ylabel)
                .style("text-anchor", "middle")
                .attr("transform", transform(-10, self.config.size.height/2, 90));
        }

        self._redraw();
    };

    this.zoomed = function() {
        return function() {
            var x = self.scales.horizontal,
                y = self.scales.vertical;

            self._redraw();
            dispatch.zoom([x.domain(), y.domain()]);
        };
    };

    var drawToCanvas = function(context, scales) { return function(drawable) {
            context.beginPath();
            if (layer.color !== undefined) {
                context.strokeStyle = layer.color(drawable);
            }

            if (drawable.dataType === "line") {
                context.moveTo(scales.horizontal(drawable.x1), scales.vertical(drawable.y1));
                context.lineTo(scales.horizontal(drawable.x2), scales.vertical(drawable.y2));
            } else {
                var vmax = scales.vertical.range()[1];

                var x1 = scales.horizontal(drawable.x),
                    x2 = scales.horizontal(drawable.x + drawable.width),
                    y1 = scales.vertical(drawable.y),
                    y2 = scales.vertical(drawable.y + drawable.height);

                context.rect(x2, y1, x2 - x1, y2 - y1);
            }
            context.stroke();
        };
    };

    var clearCanvas = function(context, size) {
        return function() {
            context.clearRect(0, 0, size.width, size.height);
        };
    };

    this.redrawSelection = function(layer, points) {
        if (layer.render_queue === undefined) {
            var context = layer.canvas.node().getContext("2d");
            layer.render_queue = new renderQueue(drawToCanvas(context, this.scales))
                .clear(clearCanvas(context, this.config.size));
        }

        layer.render_queue(points);
    };

    this._redraw = function() {
        for (var reg in this.regions) {
            var region  = this.regions[reg];
            for (var name in region.layers) {
                var layer = region.layers[name];

                var tree = layer.quadtree,
                    horizontal = this.scales.horizontal.domain(),
                    vertical = this.scales.vertical.domain();

                var x = Math.floor(horizontal[0]),
                    y = Math.floor(vertical[0]),
                    width = Math.ceil(horizontal[1] - horizontal[0]),
                    height = Math.ceil(vertical[1] - vertical[0]);

                var rect = new rectangle(x, y, width, height);
                this.redrawSelection(layer, tree.query(rect));
            }
        }
    };

    this.reset = function() {
        var self = this;
        d3.transition().duration(750)
            .tween("zoom", function() {
                var ix = d3.interpolate(self.scales.horizontal.domain(), self.config.extent[self.config.coordinates].horizontal),
                    iy = d3.interpolate(self.scales.vertical.domain(), self.config.extent[self.config.coordinates].vertical);

                return function(t) {
                    self.zoom
                        .x(self.scales.horizontal.domain(ix(t)))
                        .y(self.scales.vertical.domain(iy(t)));

                    self.zoomed()();
                    self._redraw();
                };
            });
    };

    this.load = function(data) {
        var id = data.region.id;
        this.regions[id] = data.region;
        this.genomes = data.genomes;

        var region = this.regions[id];

        var process_genome = function(context, genome) {
            var offset = 0;
            var index = 0;

            for (var key in genome.chromosomes) {
                var chr = genome.chromosomes[key];
                chr.__order__ = index++;
                chr.__offset__ = {};
                chr.__offset__[context.config.coordinates] = offset;
                offset += chr.length;
            }
        };

        for (var gid in this.genomes) {
            process_genome(this, this.genomes[gid]);
        }

        var ref = this.genomes[region.reference],
            src = this.genomes[region.source];

        var process_layer = function(context, layer) {

            var extent = context.config.extent[context.config.coordinates],
                width = extent.horizontal[1] - extent.horizontal[0],
                height = extent.vertical[1] - extent.vertical[0];

            var bounding = new rectangle(0, 0, width, height);

            layer.quadtree = new quadtree(bounding);

            var x = self.config.padding.left + 5,
                y = self.config.padding.top + 5;

            layer.canvas = d3.select(self.element).append("canvas")
                .attr("width", self.config.size.width)
                .attr("height", self.config.size.height)
                .style("top",  y + "px")
                .style("left", x + "px")
                .style("position", "absolute");

            layer.forEach(function(point, index) {
                var chr1 = point.chr1,
                    chr2 = point.chr2;

                if (chr1 !== undefined && chr2 !== undefined) {
                    var src_chr = src.chromosomes[chr1],
                        ref_chr = ref.chromosomes[chr2];

                    var src_offset = src_chr.__offset__[context.config.coordinates],
                        ref_offset = ref_chr.__offset__[context.config.coordinates];

                    point.dataType = "line";
                    point.x1 = point[context.config.coordinates][0] + src_offset;
                    point.x2 = point[context.config.coordinates][2] + ref_offset;
                    point.y1 = point[context.config.coordinates][1] + src_offset;
                    point.y2 = point[context.config.coordinates][3] + ref_offset;
                } else {
                    point.dataType = "rect";
                    point.x = point[context.config.coordinates][0];
                    point.y = point[context.config.coordinates][2];
                    point.width = point[context.config.coordinates][1] - point.x;
                    point.height = point[context.config.coordinates][3] - point.y;
                }

                if(!layer.quadtree.insert(point)) console.warn("Unable to insert data item");
            });
        };

        for(var name in region.layers) {
            process_layer(this, region.layers[name]);
        }
    };

    this.coordinates = function(_) {
        if(!arguments.length) return this.config.coordinates;

        if (!this.config.extent.hasOwnProperty(_)) {
            throw new Error("An extent does not exist for this coordinate system");
        }

        this.config.coordinates = _;

        this.scales.horizontal
            .domain(this.config.extent[_].horizontal)
            .range([0, this.config.size.width]);

        this.scales.vertical
            .domain(this.config.extent[_].vertical)
            .range([this.config.size.height, 0]);

        dispatch.coordinates(_);

        return this;
    };

    d3.select(element).style("position", "relative");
    d3.select(element).attr("class", "ui-bioplot-dotplot");
    this.configure(config);
}
