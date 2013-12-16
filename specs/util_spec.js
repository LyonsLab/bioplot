describe("util", function() {
    it("should be a svg translate string", function() {
        var result = translate(25, 25);
        expect(result).toBe("translate(25,25)");
    });

    it("should be a svg rotate string", function() {
        var result = rotate(25);
        expect(result).toBe("rotate(25)");
    });

    it("shold be a rotate and transform string", function() {
        var result = translate(25, 25) + rotate(25);
        expect(transform(25,25,25)).toBe(result);
    });

    it("should pick out the attribute", function() {
        var x = {
            a: 'a',
            b: 'b',
            c: 'c'
        };

        expect(pick('a')(x)).toBe('a');
        expect(pick('b')(x)).toBe('b');
        expect(pick('c')(x)).toBe('c');
    });

    it("should scan the values", function() {
        var points = [10, 5, 2, 2, 5];
        var add = function(a, b) { return a + b; }
        var divide = function(a, b) { return a / b; }
        expect(scan(add, 0, points)).toEqual([0, 10, 15, 17, 19, 24])
        expect(scan(divide, 1000, points)).toEqual([1000, 100, 20, 10, 5, 1]);
    })

    it("should be a partial application from the right", function() {
        var f = function() { return arguments; };
        var g = rbind(f, null, 2, 3, 4);

        expect(g(1)).toEqual([1, 2, 3, 4]);
    })

    it("should bound the functions output value", function() {
        var f = function(x) { return x; };
        var g = bound(f, 0, 100);

        //extremes bounded
        expect(g(-Infinity)).toBe(0);
        expect(g(Infinity)).toBe(100);

        //edge case
        expect(g(100)).toBe(100);
        expect(g(0)).toBe(0);

        expect(g(50)).toBe(50);
        expect(isNaN(g(NaN))).toBe(true);
    });
})
