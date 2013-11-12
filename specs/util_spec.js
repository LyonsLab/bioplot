describe("Bioplot: util", function() {
    it("should be a svg translate string", function() {
        var result = translate(25, 25);
        expect(result).toBe("translate(25,25)");
    });
})
