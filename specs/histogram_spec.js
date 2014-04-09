describe("histogram", function() {
    var element,
        hist,
        points,
        bins;

    beforeEach(function() {
        element = d3.select(document.body).append('div');
        hist = histogram();
        points = d3.range(100).map(d3.random.irwinHall(2));
        bins = hist.bin(points);
    })

    afterEach(function() {
        element.remove('div');
    });

    it("should be configured when created", function() {
        var config = hist.config();
        expect(config.size).toEqual({width: 700, height: 700});
        expect(config.bins).toBe(50);
    })

    it("should override the config", function() {
        var config;

        hist.configure({
            size: {
                width: 500,
                height: 500
            },
            bins: 100
        });

        config = hist.config();
        expect(config.size).toEqual({width: 500, height: 500});
        expect(config.bins).toBe(100);
    })

    it("should bin the data", function() {
        var count = bins.reduce(function(a, b) { return a + b.length; }, 0);
        expect(count).toBe(points.length);
    })

    it("should be render the plot", function() {
        hist(element.node(), bins);

        var svg = d3.select("svg");
        expect(svg.attr("width")).toBe("720")
        expect(svg.attr("height")).toBe("720")
        expect(d3.selectAll("g.bins > rect")[0].length).toBe(bins.length);
    })

    it("should return the selection of points", function() {
        var done = false,
            selection = [];
            scale = d3.scale.linear(),
            extent = d3.extent(bins, function(bin) { return bin.x; });

        // Add missing delta
        extent[1] = extent[1] + bins[0].dx;

        // set scale
        scale.domain(extent)
            .range([0, hist.config().size.width - 20]);

        hist(element.node(), bins);
        hist.brush().extent(extent);

        hist.on('selected', function(s) {
           selection = s;
           done = true;
        });

        // Simulate brush event
        hist.selected();

        waitsFor(function() { return done; }, 'brush selection done', 1000);

        expect(selection.sort()).toEqual(points.sort());
    })
});
