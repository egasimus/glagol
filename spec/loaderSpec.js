var glagol=require("..")
var fs=require("fs")


describe("loader", function() {
	it("glagol(pathToSomeFile) returns a File instance populated with the contents of that file. The instance's parent property defaults to null.",
		function(done) {
			var g = glagol("./spec/sample/n1");
			expect(glagol.File.is(g)).toBe(true);
			expect(g.parent).toBe(null);
			fs.readFile("./spec/sample/n1", "utf8", function (err, data) {
				if (err) throw err;
				expect(g.source).toEqual(data);
				done();
			});
		});
});