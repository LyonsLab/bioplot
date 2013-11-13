describe("Bioplot: util", function() {
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
})
