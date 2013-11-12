describe("dotplot", function() {
    var element;
    var plot;

    beforeEach(function() {
        element = d3.select(document.body).append('div');
        plot = new dotplot(element, {});
    })

    afterEach(function() {
        element.remove('div');
    });

    it("should set default configuration.", function() {
        expect(plot.config.size.width).toBe(700);
        expect(plot.config.size.height).toBe(700);

        expect(plot.config.padding.top).toBe(20);
        expect(plot.config.padding.bottom).toBe(20);
        expect(plot.config.padding.left).toBe(20);
        expect(plot.config.padding.right).toBe(40);

        expect(plot.config.title).toBeUndefined();
        expect(plot.config.xlabel).toBeUndefined();
        expect(plot.config.ylabel).toBeUndefined();
    });

});
