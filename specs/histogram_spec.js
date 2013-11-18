describe("histogram", function() {
    var element,
        hist;

    beforeEach(function() {
        element = d3.select(document.body).append('div');
        hist = new histogram(element.node());
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

        var svg = element.select("svg");
        expect(svg.attr("width")).toBe("700")
        expect(svg.attr("height")).toBe("700")
    })
});
