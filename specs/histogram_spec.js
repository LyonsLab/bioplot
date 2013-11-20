describe("histogram", function() {
    var element,
        hist,
        points;

    beforeEach(function() {
        element = d3.select(document.body).append('div');
        hist = new histogram(element.node());
        points = d3.range(100).map(d3.random.irwinHall(2));
    })

    afterEach(function() {
        element.remove('div');
    });

    it("should be configured when created", function() {
        expect(hist.config.size).toEqual({width: 700, height: 700});
        expect(hist.config.bins).toBe(50);
    })

    it("should override the config", function() {
        hist.configure({
            size: {
                width: 500,
                height: 500
            },
            bins: 100
        });

        expect(hist.config.size).toEqual({width: 500, height: 500});
        expect(hist.config.bins).toBe(100);
    })

    it("should be rendered", function() {
       hist.render();

       var svg = d3.select("svg");
       expect(svg.attr("width")).toBe("700")
       expect(svg.attr("height")).toBe("700")
    })

    it("should have rect bins", function() {
        hist.render();
        hist.load(points).redraw();

        expect(d3.selectAll("g.bins > rect")[0].length).toBe(hist.bins.length);
    })

    it("should load data", function() {
        hist.load(points);

        var count = hist.bins.reduce(function(a, b) { return a + b.length; }, 0);
        expect(count).toBe(points.length);
    })
});
