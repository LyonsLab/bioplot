describe("quadtree", function() {
    var northWest = new rectangle(0, 100, 50, 100),
        northEast = new rectangle(50, 100, 50, 100),
        southWest = new rectangle(0, 0, 50, 100),
        southEast = new rectangle(50, 0, 50, 100),
        tree = new quadtree(new rectangle(0, 0, 100, 200)),
        points;

    beforeEach(function() {
        tree = new quadtree(new rectangle(0, 0, 100, 200));
        points = d3.range(50).map(function(d) {
            return {dataType: "point", x: 100 * Math.random(), y: 200 * Math.random()};
        });
    })

    afterEach(function(){
        tree.clear();
        points.length = 0;
    });

    describe("rectangle", function() {
        var w = new rectangle(5, 5, 5, 5),
            x = new rectangle(0, 0, 20, 20),
            y = new rectangle(10, 15, 20, 20),
            z = new rectangle(25, 25, 10, 10);

        var a = {dataType: "line", x1:1, x2:3, y1:10, y2:10},
            b = {dataType: "line", x1:0, x2:0, y1:20, y2:20},
            c = {dataType: "line", x1:25, x2:40, y1:25, y2:40};

        var g = {dataType: "point", x: 10, y: 10},
            h = {dataType: "point", x: 20, y: 20},
            i = {dataType: "point", x: 25, y: 25};

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

        it("should intersect the line", function() {
            expect(x.intersects(a)).toBe(true);
            expect(x.intersects(b)).toBe(true);
            expect(z.intersects(c)).toBe(true);
        })

        it("should not intersect the line", function() {
            expect(x.intersects(c)).toBe(false);
        })

        it("should contain the points", function() {
            expect(x._containsPoint(g)).toBe(true);
            expect(x._containsPoint(h)).toBe(true);
            expect(x.contains(g)).toBe(true);
            expect(x.contains(h)).toBe(true);
        })

        it("should not contain the point", function() {
            expect(x._containsPoint(i)).toBe(false);
            expect(x.contains(i)).toBe(false);
        })

        it("should contain the lines", function() {
            expect(x._containsLine(a)).toBe(true);
            expect(x._containsLine(b)).toBe(true);
            expect(x.contains(a)).toBe(true);
            expect(x.contains(b)).toBe(true);
        })

        it("should not contain the line", function() {
            expect(z._containsLine(c)).toBe(false);
            expect(z.contains(c)).toBe(false);
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

    it("should split itself", function() {
        var nw = northWest.toString(),
            ne = northEast.toString(),
            sw = southWest.toString(),
            se = southEast.toString();

        tree._split();

        expect(tree.northWest.boundary.toString()).toBe(nw);
        expect(tree.northEast.boundary.toString()).toBe(ne);
        expect(tree.southWest.boundary.toString()).toBe(sw);
        expect(tree.southEast.boundary.toString()).toBe(se);
    })

    it("should clear a quadtree", function() {
        tree._split();

        p1 = tree.points = [1, 2, 3, 4];
        p2 = tree.northWest.points = [1, 2, 3, 4];
        p3 = tree.northEast.points = [1, 2, 3, 4];
        p4 = tree.southWest.points = [1, 2, 3, 4];
        p5 = tree.southEast.points = [1, 2, 3, 4];

        tree.clear();

        expect(tree.northWest).toBeUndefined();
        expect(tree.northEast).toBeUndefined();
        expect(tree.southWest).toBeUndefined();
        expect(tree.southEast).toBeUndefined();

        expect(p1).toEqual([]);
        expect(p2).toEqual([]);
        expect(p3).toEqual([]);
        expect(p4).toEqual([]);
        expect(p5).toEqual([]);
    })

    it("should not insert data outside the boundary", function() {
        var rect = {x: 20, y: 30, width: 10, height: 500},
            line = {dataType: "line", x1:10, x2:250, y1:20, y2:20},
            point = {dataType: "point", x: 250, y:250};

        expect(tree.insert(rect)).toBe(false);
        expect(tree.points.length).toBe(0);

        expect(tree.insert(line)).toBe(false);
        expect(tree.points.length).toBe(0);

        expect(tree.insert(point)).toBe(false);
        expect(tree.points.length).toBe(0);
    })

    it("should insert data inside the boundary", function() {
        var rect = {x: 20, y: 30, width: 10, height: 10},
            line = {dataType: "line", x1:20, x2:100, y1:20, y2:20},
            point = {dataType: "point", x: 20, y:20};

        expect(tree.insert(rect)).toBe(true);
        expect(tree.points.length).toBe(1);

        expect(tree.insert(line)).toBe(true);
        expect(tree.points.length).toBe(2);

        expect(tree.insert(point)).toBe(true);
        expect(tree.points.length).toBe(3);
    })

    it("should dynamically grow on insert", function() {
        var res = points.map(function(d) {return tree.insert(d)});

        res.forEach(function(successful) {
            expect(successful).toBe(true);
        })
    })

    it("should return all points within itself", function() {
        points.forEach(function(point) { tree.insert(point)});
        var query = tree.query(tree.boundary);
        expect(query.length).toBe(points.length);
    })

    it("should return no points outside its boundary", function() {
        points.forEach(function(point) { tree.insert(point)});
        var query = tree.query(new rectangle(250, 110, 25, 25));
        expect(query.length).toBe(0);
    });
})
