(function(bioplot) {
    var histogram = bioplot.histogram = function(config) {
        var brush = d3.svg.brush(),
            color = d3.scale.linear(),
            horizontal = d3.scale.linear(),
            vertical = d3.scale.linear(),
            dispatch = d3.dispatch("selected");

        function my(element, bins) {
            var svg,
                genter,
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
                .classed("ui-bioplot-histogram", true)
                .selectAll("svg")
                .data([1]);

            genter = svg.enter()
                .append("svg")
                .append("g")
                .attr("transform", translate(20, 20));

            svg.attr("width", config.size.width + 20)
                .attr("height", config.size.height + 20);

            genter.append("g").attr("class", "bins");

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

        my.bin = function(data, accessor) {
            var layout = d3.layout.histogram();
                horizontal = d3.scale.linear()
                .range([0, config.size.width - 20]);

            if (accessor && typeof accessor === "function") {
                horizontal.domain(d3.extent(data, accessor));
                layout.value(accessor);
            } else {
                horizontal.domain(d3.extent(data));
            }

            return layout.bins(horizontal.ticks(config.bins))(data);
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

        my.setBins = function(bins) {
            config.bins = bins;
        };

        my.setColors = function(colors) {
            config.colors = colors;
        };

        my.setSize = function(width, height) {
            config.size.width = width;
            config.size.height = height;
        };

        my.color = function() {
            return color;
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

        d3.rebind(my, dispatch, "on");
        my.configure(config);

        return my;
    };
}(window.bioplot || (window.bioplot  = {})));

(function(bioplot) {
    function Rectangle(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    Rectangle.prototype = (function() {
        return {
            contains: function(that) {
                if (that.dataType === "line") return this._containsLine(that);
                if (that.dataType === "point") return this._containsPoint(that);

                return (that.x >= this.x &&
                        that.y >= this.y &&
                        (that.x + that.width) <= (this.x + this.width) &&
                        (that.y + that.height) <= (this.y + this.height));
            },

            _containsLine: function(line) {
                return (this._containsPoint({ x: line.x1, y: line.y1})
                        && this._containsPoint({ x: line.x2, y: line.y2}));
            },

            _containsPoint: function(point) {
                return (point.x >= this.x &&
                        point.y >= this.y &&
                        point.x <= (this.x + this.width) &&
                        point.y <= (this.y + this.height));
            },

            toString: function() {
                return "[x=" + this.x  + ", y=" + this.y + ", width=" + this.width + ", height=" + this.height + "]";
            },

            intersects: function(that) {
                if (that.dataType === "line") return this._intersectsLine(that);
                if (that.dataType === "point") return this._containsPoint(that);

                return !(that.left > (this.left + this.width) ||
                        (that.left + that.width) < this.left ||
                        that.y > (this.y + this.height) ||
                        (that.y + that.height) < this.x);
            },

            _intersectsLine: function(line) {
                return (this._containsPoint({ x: line.x1, y: line.y1})
                        || this._containsPoint({ x: line.x2, y: line.y2}));
            }
        };
    }());

    function Quadtree(boundary, level) {
        this.capacity = 10;
        this.level = level || 10;
        this.boundary = boundary;
        this.points = [];
    }

    Quadtree.prototype = (function() {
        return {
            split: function() {
                var width = parseInt(this.boundary.width / 2, 10),
                    height = parseInt(this.boundary.height / 2, 10),
                    l = this.level + 1,
                    x = this.boundary.x,
                    y = this.boundary.y,
                    x2 = x + width,
                    y2 = y + height;

                this.northWest = new Quadtree(new Rectangle(x, y2, width, height), l);
                this.northEast = new Quadtree(new Rectangle(x2, y2, width, height), l);
                this.southEast = new Quadtree(new Rectangle(x2, y, width, height), l);
                this.southWest = new Quadtree(new Rectangle(x, y, width, height), l);
            },

            clear: function() {
                if (this.northWest !== undefined) this.northWest.clear();
                if (this.northEast !== undefined) this.northEast.clear();
                if (this.southWest !== undefined) this.southWest.clear();
                if (this.southEast !== undefined) this.southEast.clear();

                this.northWest = undefined;
                this.northEast = undefined;
                this.southWest = undefined;
                this.southEast = undefined;
                this.points.length = 0;
            },

            insert: function(data) {
                if (!this.boundary.contains(data)) return false;

                if (this.points.length < this.capacity) {
                    this.points.push(data);
                    return true;
                }

                if (this.northWest === undefined) {
                    this.split();
                }

                if (this.northWest.insert(data)) return true;
                if (this.northEast.insert(data)) return true;
                if (this.southWest.insert(data)) return true;
                if (this.southEast.insert(data)) return true;

                this.points.push(data);

                return true;
            },

            query: function(boundingBox) {
                var points = [];
                if (!this.boundary.intersects(boundingBox)) return points;

                this.points.forEach(function(point) {
                    if (boundingBox.intersects(point)) points.push(point);
                });

                if (this.northWest === undefined) return points;

                points = points.concat(this.northWest.query(boundingBox));
                points = points.concat(this.northEast.query(boundingBox));
                points = points.concat(this.southWest.query(boundingBox));
                points = points.concat(this.southEast.query(boundingBox));

                return points;
            }
        };
    }());

    bioplot.Rectangle = Rectangle;
    bioplot.Quadtree = Quadtree;
}(window.bioplot || (window.bioplot = {})));

function translate(x, y) {
    return "translate(" + x + "," + y + ")";
}

function rotate(rotation) {
    return "rotate(" + rotation + ")";
}

function transform(x, y, rotation) {
    return translate(x,y) + rotate(rotation);
}
