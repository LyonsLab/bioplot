describe("quadtree", function() {
    describe("rectangle", function() {
        var w = new rectangle(5, 5, 5, 5),
            x = new rectangle(0, 0, 20, 20),
            y = new rectangle(10, 15, 20, 20),
            z = new rectangle(25, 25, 10, 10);

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
        var rect = new rectangle(1, 1, 2, 2);
        var q = new quadtree(rect);

        expect(q.capacity).toBe(10);
        expect(q.level).toBe(10);

        expect(q.northWest).toBeUndefined();
        expect(q.northEast).toBeUndefined();
        expect(q.southWest).toBeUndefined();
        expect(q.southEast).toBeUndefined();
        expect(q.points).toEqual([]);
        expect(q.boundary.toString()).toEqual(rect.toString());
    })
})
