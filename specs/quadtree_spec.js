describe("quadtree", function() {
    Rectangle = bioplot.Rectangle;
    Quadtree = bioplot.Quadtree;

    var northWest = new Rectangle(0, 100, 50, 100),
        northEast = new Rectangle(50, 100, 50, 100),
        southWest = new Rectangle(0, 0, 50, 100),
        southEast = new Rectangle(50, 0, 50, 100);
        tree = new Quadtree(new Rectangle(0, 0, 100, 200))

    beforeEach(function() {
        tree = new Quadtree(new Rectangle(0, 0, 100, 200));
    })

    describe("rectangle", function() {
        var w = new Rectangle(5, 5, 5, 5),
            x = new Rectangle(0, 0, 20, 20),
            y = new Rectangle(10, 15, 20, 20),
            z = new Rectangle(25, 25, 10, 10);

        it("should intersect itself", function() {
            expect(x.intersects(x)).toBe(true);
        })

        it("should intersect rectangle", function() {
            expect(x.intersects(y)).toBe(true);
            expect(y.intersects(x)).toBe(true);
            expect(w.intersects(x)).toBe(true);
            expect(x.intersects(w)).toBe(true);
        })

        it("should not intersect rectangle", function() {
            expect(w.intersects(w)).toBe(true);
            expect(x.intersects(z)).toBe(false);
            expect(z.intersects(x)).toBe(false);
        })

        it("should contain itself", function() {
            expect(x.contains(x)).toBe(true);
        })

        it("should contain the rectangle", function() {
            expect(x.contains(w)).toBe(true);
        })

        it("should not contain the rectangle", function() {
            expect(w.contains(x)).toBe(false);
        })
    })

    it("should be an empty quadtree", function() {
        var rect = new Rectangle(1, 1, 2, 2);
        var q = new Quadtree(rect);

        expect(q.capacity).toBe(10);
        expect(q.level).toBe(10);

        expect(q.northWest).toBeUndefined();
        expect(q.northEast).toBeUndefined();
        expect(q.southWest).toBeUndefined();
        expect(q.southEast).toBeUndefined();
        expect(q.points).toEqual([]);
        expect(q.boundary.toString()).toEqual(rect.toString());
    })

    it("should split itself", function() {
        var nw = northWest.toString(),
            ne = northEast.toString(),
            sw = southWest.toString(),
            se = southEast.toString();

        tree.split();

        expect(tree.northWest.boundary.toString()).toBe(nw);
        expect(tree.northEast.boundary.toString()).toBe(ne);
        expect(tree.southWest.boundary.toString()).toBe(sw);
        expect(tree.southEast.boundary.toString()).toBe(se);
    })
})
